create extension if not exists pgcrypto;

create table workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null unique,
  name text not null,
  timezone text not null default 'Africa/Accra',
  verification_status text not null default 'pending',
  created_at timestamptz not null default now(),
  constraint workspaces_verification_status_check check (
    verification_status in ('pending', 'verified', 'rejected')
  )
);

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
  constraint contacts_workspace_phone_unique unique (workspace_id, phone_e164),
  constraint contacts_status_check check (
    status in ('active', 'inactive', 'invalid', 'duplicate')
  ),
  constraint contacts_normalization_state_check check (
    normalization_state in ('pending', 'normalized', 'invalid', 'duplicate')
  )
);

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
  constraint contact_groups_workspace_name_unique unique (workspace_id, name)
);

create index contact_groups_workspace_id_idx on contact_groups (workspace_id);

create table contact_group_memberships (
  group_id uuid not null references contact_groups(id) on delete cascade,
  contact_id uuid not null references contacts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (group_id, contact_id)
);

create index contact_group_memberships_contact_id_idx
  on contact_group_memberships (contact_id);

create table contact_suppressions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  contact_id uuid references contacts(id) on delete set null,
  phone_e164 text not null,
  reason text not null default 'manual',
  created_at timestamptz not null default now(),
  constraint contact_suppressions_workspace_phone_unique unique (workspace_id, phone_e164)
);

create index contact_suppressions_workspace_id_idx on contact_suppressions (workspace_id);
