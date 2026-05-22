-- Cento initial schema bootstrap for manual execution in the Supabase SQL editor.
-- Use this when CLI/database connectivity is unavailable but the remote project
-- still needs the full app schema created in one pass.
--
-- Source migrations:
-- 1. supabase/migrations/20260521_001_auth_workspace_contacts.sql
-- 2. supabase/migrations/20260521_002_templates_senders_wallet.sql
-- 3. supabase/migrations/20260521_003_campaigns_jobs_attempts.sql
--
-- Notes:
-- - This is intended for a fresh project where these tables do not exist yet.
-- - Run the whole file in one execution.
-- - It creates app tables only. It does not yet add RLS policies.

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

create table templates (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  body text not null,
  variables jsonb not null default '[]'::jsonb,
  fallback_values jsonb not null default '{}'::jsonb,
  template_type text not null default 'custom',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint templates_workspace_row_unique unique (workspace_id, id),
  constraint templates_workspace_name_unique unique (workspace_id, name),
  constraint templates_type_check check (
    template_type in ('starter', 'custom')
  )
);

create trigger set_templates_updated_at
before update on templates
for each row
execute function set_current_timestamp_updated_at();

create index templates_workspace_id_idx on templates (workspace_id);

create table sender_ids (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  sender_value text not null,
  sender_mode text not null default 'shared',
  status text not null default 'draft',
  notes text not null default '',
  submitted_at timestamptz,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sender_ids_workspace_row_unique unique (workspace_id, id),
  constraint sender_ids_workspace_value_unique unique (workspace_id, sender_value),
  constraint sender_ids_mode_check check (
    sender_mode in ('shared', 'branded')
  ),
  constraint sender_ids_status_check check (
    status in ('draft', 'submitted', 'in_review', 'approved', 'rejected')
  )
);

create trigger set_sender_ids_updated_at
before update on sender_ids
for each row
execute function set_current_timestamp_updated_at();

create index sender_ids_workspace_id_idx on sender_ids (workspace_id);
create index sender_ids_workspace_status_idx on sender_ids (workspace_id, status);

create table payment_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  provider_name text not null,
  provider_event_id text not null,
  payment_reference text not null,
  status text not null default 'pending',
  amount_minor integer not null default 0,
  currency text not null default 'GHS',
  metadata jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payment_events_workspace_row_unique unique (workspace_id, id),
  constraint payment_events_provider_event_unique unique (provider_name, provider_event_id),
  constraint payment_events_workspace_reference_unique unique (workspace_id, payment_reference),
  constraint payment_events_status_check check (
    status in ('pending', 'confirmed', 'failed', 'refunded')
  ),
  constraint payment_events_amount_minor_check check (amount_minor >= 0)
);

create trigger set_payment_events_updated_at
before update on payment_events
for each row
execute function set_current_timestamp_updated_at();

create index payment_events_workspace_id_idx on payment_events (workspace_id);

create table wallet_ledger_entries (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  entry_type text not null,
  direction text not null,
  units integer not null,
  amount_minor integer,
  currency text not null default 'GHS',
  actor_user_id uuid,
  reason text not null default '',
  provider_reference text,
  payment_event_id uuid,
  campaign_id uuid,
  job_id uuid,
  run_id uuid,
  created_at timestamptz not null default now(),
  constraint wallet_ledger_entries_direction_check check (
    direction in ('credit', 'debit')
  ),
  constraint wallet_ledger_entries_type_check check (
    entry_type in ('top_up', 'manual_adjustment', 'campaign_deduction', 'refund', 'reversal')
  ),
  constraint wallet_ledger_entries_units_check check (units > 0),
  constraint wallet_ledger_entries_workspace_payment_event_fkey
    foreign key (workspace_id, payment_event_id)
    references payment_events(workspace_id, id)
    on delete set null
);

create index wallet_ledger_entries_workspace_id_idx on wallet_ledger_entries (workspace_id);
create index wallet_ledger_entries_workspace_created_at_idx
  on wallet_ledger_entries (workspace_id, created_at desc);

create table campaigns (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  sender_mode text not null default 'shared',
  sender_id uuid,
  template_id uuid,
  message_body text not null default '',
  personalization_fallback jsonb not null default '{}'::jsonb,
  audience_filters jsonb not null default '[]'::jsonb,
  scheduled_for timestamptz,
  state text not null default 'draft',
  failure_reason text,
  estimated_recipient_count integer not null default 0,
  estimated_units integer not null default 0,
  last_rechecked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint campaigns_workspace_row_unique unique (workspace_id, id),
  constraint campaigns_workspace_sender_fkey
    foreign key (workspace_id, sender_id)
    references sender_ids(workspace_id, id)
    on delete set null,
  constraint campaigns_workspace_template_fkey
    foreign key (workspace_id, template_id)
    references templates(workspace_id, id)
    on delete set null,
  constraint campaigns_sender_mode_check check (
    sender_mode in ('shared', 'branded')
  ),
  constraint campaigns_state_check check (
    state in (
      'draft',
      'queued',
      'paused',
      'rechecking',
      'sending',
      'needs_attention',
      'completed',
      'completed_with_failures',
      'canceled'
    )
  ),
  constraint campaigns_estimated_recipient_count_check check (estimated_recipient_count >= 0),
  constraint campaigns_estimated_units_check check (estimated_units >= 0)
);

create trigger set_campaigns_updated_at
before update on campaigns
for each row
execute function set_current_timestamp_updated_at();

create index campaigns_workspace_id_idx on campaigns (workspace_id);
create index campaigns_workspace_state_idx on campaigns (workspace_id, state);
create index campaigns_workspace_scheduled_for_idx on campaigns (workspace_id, scheduled_for);

create table campaign_audience_groups (
  workspace_id uuid not null references workspaces(id) on delete cascade,
  campaign_id uuid not null,
  group_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (campaign_id, group_id),
  constraint campaign_audience_groups_workspace_campaign_fkey
    foreign key (workspace_id, campaign_id)
    references campaigns(workspace_id, id)
    on delete cascade,
  constraint campaign_audience_groups_workspace_group_fkey
    foreign key (workspace_id, group_id)
    references contact_groups(workspace_id, id)
    on delete cascade
);

create index campaign_audience_groups_workspace_group_idx
  on campaign_audience_groups (workspace_id, group_id);

create table campaign_jobs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  campaign_id uuid not null,
  due_at timestamptz not null,
  state text not null default 'queued',
  idempotency_key text not null,
  payload jsonb not null default '{}'::jsonb,
  retry_count integer not null default 0,
  max_retries integer not null default 3,
  claimed_at timestamptz,
  started_at timestamptz,
  finished_at timestamptz,
  failure_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint campaign_jobs_workspace_row_unique unique (workspace_id, id),
  constraint campaign_jobs_idempotency_key_unique unique (idempotency_key),
  constraint campaign_jobs_workspace_campaign_fkey
    foreign key (workspace_id, campaign_id)
    references campaigns(workspace_id, id)
    on delete cascade,
  constraint campaign_jobs_state_check check (
    state in ('queued', 'claimed', 'running', 'completed', 'failed', 'canceled')
  ),
  constraint campaign_jobs_retry_count_check check (retry_count >= 0),
  constraint campaign_jobs_max_retries_check check (max_retries >= 0)
);

create trigger set_campaign_jobs_updated_at
before update on campaign_jobs
for each row
execute function set_current_timestamp_updated_at();

create index campaign_jobs_due_at_idx on campaign_jobs (due_at);
create index campaign_jobs_workspace_state_idx on campaign_jobs (workspace_id, state);
create index campaign_jobs_campaign_id_idx on campaign_jobs (campaign_id);

create table campaign_runs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  campaign_id uuid not null,
  job_id uuid not null,
  exact_sender text not null default '',
  rendered_message_basis text not null default '',
  audience_snapshot jsonb not null default '[]'::jsonb,
  charge_basis jsonb not null default '{}'::jsonb,
  resolved_recipient_count integer not null default 0,
  deliverable_recipient_count integer not null default 0,
  charge_units_total integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint campaign_runs_workspace_row_unique unique (workspace_id, id),
  constraint campaign_runs_job_id_unique unique (job_id),
  constraint campaign_runs_workspace_job_unique unique (workspace_id, job_id),
  constraint campaign_runs_workspace_campaign_fkey
    foreign key (workspace_id, campaign_id)
    references campaigns(workspace_id, id)
    on delete cascade,
  constraint campaign_runs_workspace_job_fkey
    foreign key (workspace_id, job_id)
    references campaign_jobs(workspace_id, id)
    on delete cascade,
  constraint campaign_runs_resolved_recipient_count_check check (resolved_recipient_count >= 0),
  constraint campaign_runs_deliverable_recipient_count_check check (deliverable_recipient_count >= 0),
  constraint campaign_runs_charge_units_total_check check (charge_units_total >= 0)
);

create trigger set_campaign_runs_updated_at
before update on campaign_runs
for each row
execute function set_current_timestamp_updated_at();

create index campaign_runs_campaign_id_idx on campaign_runs (campaign_id);
create index campaign_runs_workspace_id_idx on campaign_runs (workspace_id);

create table message_attempts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  campaign_id uuid not null,
  run_id uuid not null,
  contact_id uuid,
  phone_e164 text not null,
  rendered_message text not null default '',
  rendered_units integer not null default 1,
  provider_message_id text,
  retry_count integer not null default 0,
  provider_response jsonb not null default '{}'::jsonb,
  outcome text not null default 'pending',
  sent_at timestamptz,
  delivered_at timestamptz,
  failed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint message_attempts_workspace_campaign_fkey
    foreign key (workspace_id, campaign_id)
    references campaigns(workspace_id, id)
    on delete cascade,
  constraint message_attempts_workspace_run_fkey
    foreign key (workspace_id, run_id)
    references campaign_runs(workspace_id, id)
    on delete cascade,
  constraint message_attempts_workspace_contact_fkey
    foreign key (workspace_id, contact_id)
    references contacts(workspace_id, id)
    on delete set null,
  constraint message_attempts_rendered_units_check check (rendered_units > 0),
  constraint message_attempts_retry_count_check check (retry_count >= 0),
  constraint message_attempts_outcome_check check (
    outcome in ('pending', 'sent', 'delivered', 'failed', 'suppressed', 'invalid')
  )
);

create trigger set_message_attempts_updated_at
before update on message_attempts
for each row
execute function set_current_timestamp_updated_at();

create index message_attempts_run_id_idx on message_attempts (run_id);
create index message_attempts_campaign_id_idx on message_attempts (campaign_id);
create index message_attempts_workspace_outcome_idx on message_attempts (workspace_id, outcome);

create table activity_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  actor_user_id uuid,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index activity_logs_workspace_created_at_idx
  on activity_logs (workspace_id, created_at desc);

alter table wallet_ledger_entries
  add constraint wallet_ledger_entries_workspace_campaign_fkey
    foreign key (workspace_id, campaign_id)
    references campaigns(workspace_id, id)
    on delete set null,
  add constraint wallet_ledger_entries_workspace_job_fkey
    foreign key (workspace_id, job_id)
    references campaign_jobs(workspace_id, id)
    on delete set null,
  add constraint wallet_ledger_entries_workspace_run_fkey
    foreign key (workspace_id, run_id)
    references campaign_runs(workspace_id, id)
    on delete set null;
