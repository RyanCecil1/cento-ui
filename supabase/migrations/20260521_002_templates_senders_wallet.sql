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
