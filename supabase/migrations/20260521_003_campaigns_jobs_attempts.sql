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
