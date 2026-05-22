create extension if not exists pgcrypto;

create or replace function set_current_timestamp_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null,
  timezone text not null default 'Africa/Accra',
  verification_status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workspaces_owner_workspace_unique unique (id, owner_user_id),
  constraint workspaces_verification_status_check check (
    verification_status in ('pending', 'verified', 'rejected')
  )
);

create trigger set_workspaces_updated_at
before update on workspaces
for each row
execute function set_current_timestamp_updated_at();

create table contacts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  phone_e164 text not null,
  full_name text not null default '',
  first_name text not null default '',
  last_name text not null default '',
  source text not null default 'manual',
  status text not null default 'active',
  tags text[] not null default '{}',
  normalization_state text not null default 'pending',
  is_suppressed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contacts_workspace_row_unique unique (workspace_id, id),
  constraint contacts_workspace_phone_unique unique (workspace_id, phone_e164),
  constraint contacts_status_check check (
    status in ('active', 'inactive', 'invalid', 'duplicate')
  ),
  constraint contacts_normalization_state_check check (
    normalization_state in ('pending', 'normalized', 'invalid', 'duplicate')
  )
);

create trigger set_contacts_updated_at
before update on contacts
for each row
execute function set_current_timestamp_updated_at();

create index contacts_workspace_id_idx on contacts (workspace_id);
create index contacts_workspace_status_idx on contacts (workspace_id, status);
create index contacts_workspace_created_at_idx on contacts (workspace_id, created_at desc);
create index contacts_tags_gin_idx on contacts using gin (tags);

create table contact_groups (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contact_groups_workspace_row_unique unique (workspace_id, id),
  constraint contact_groups_workspace_name_unique unique (workspace_id, name)
);

create trigger set_contact_groups_updated_at
before update on contact_groups
for each row
execute function set_current_timestamp_updated_at();

create index contact_groups_workspace_id_idx on contact_groups (workspace_id);

create table contact_group_memberships (
  workspace_id uuid not null references workspaces(id) on delete cascade,
  group_id uuid not null,
  contact_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (group_id, contact_id),
  constraint contact_group_memberships_workspace_group_fkey
    foreign key (workspace_id, group_id)
    references contact_groups(workspace_id, id)
    on delete cascade,
  constraint contact_group_memberships_workspace_contact_fkey
    foreign key (workspace_id, contact_id)
    references contacts(workspace_id, id)
    on delete cascade
);

create index contact_group_memberships_workspace_contact_idx
  on contact_group_memberships (workspace_id, contact_id);

create table contact_suppressions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  contact_id uuid,
  phone_e164 text not null,
  reason text not null default 'manual',
  created_at timestamptz not null default now(),
  constraint contact_suppressions_workspace_row_unique unique (workspace_id, id),
  constraint contact_suppressions_workspace_phone_unique unique (workspace_id, phone_e164),
  constraint contact_suppressions_workspace_contact_unique unique (workspace_id, contact_id),
  constraint contact_suppressions_workspace_contact_fkey
    foreign key (workspace_id, contact_id)
    references contacts(workspace_id, id)
    on delete set null
);

create index contact_suppressions_workspace_id_idx on contact_suppressions (workspace_id);

create or replace function sync_contact_suppression_flag()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' and old.contact_id is not null then
    update contacts
    set is_suppressed = exists (
      select 1
      from contact_suppressions
      where workspace_id = old.workspace_id
        and contact_id = old.contact_id
    )
    where workspace_id = old.workspace_id
      and id = old.contact_id;
  end if;

  if tg_op in ('INSERT', 'UPDATE') and new.contact_id is not null then
    update contacts
    set is_suppressed = exists (
      select 1
      from contact_suppressions
      where workspace_id = new.workspace_id
        and contact_id = new.contact_id
    )
    where workspace_id = new.workspace_id
      and id = new.contact_id;
  end if;

  if tg_op = 'DELETE' and old.contact_id is not null then
    update contacts
    set is_suppressed = exists (
      select 1
      from contact_suppressions
      where workspace_id = old.workspace_id
        and contact_id = old.contact_id
    )
    where workspace_id = old.workspace_id
      and id = old.contact_id;
  end if;

  return coalesce(new, old);
end;
$$;

create trigger sync_contact_suppression_flag_after_upsert
after insert or update on contact_suppressions
for each row
execute function sync_contact_suppression_flag();

create trigger sync_contact_suppression_flag_after_delete
after delete on contact_suppressions
for each row
execute function sync_contact_suppression_flag();
