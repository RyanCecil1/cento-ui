-- Cento owner-only RLS and policies.
-- Run this after supabase/sql-editor-initial-setup.sql.
--
-- Model:
-- - v1 is a single-owner workspace product
-- - the authenticated owner can fully manage rows in their own workspace
-- - service_role bypasses RLS automatically for server-side jobs

create or replace function public.is_workspace_owner(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspaces
    where id = target_workspace_id
      and owner_user_id = auth.uid()
  );
$$;

revoke all on function public.is_workspace_owner(uuid) from public;
grant execute on function public.is_workspace_owner(uuid) to authenticated;

alter table public.workspaces enable row level security;
alter table public.contacts enable row level security;
alter table public.contact_groups enable row level security;
alter table public.contact_group_memberships enable row level security;
alter table public.contact_suppressions enable row level security;
alter table public.templates enable row level security;
alter table public.sender_ids enable row level security;
alter table public.payment_events enable row level security;
alter table public.wallet_ledger_entries enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_audience_groups enable row level security;
alter table public.campaign_jobs enable row level security;
alter table public.campaign_runs enable row level security;
alter table public.message_attempts enable row level security;
alter table public.activity_logs enable row level security;

create policy workspaces_owner_select
on public.workspaces
for select
to authenticated
using (owner_user_id = auth.uid());

create policy workspaces_owner_insert
on public.workspaces
for insert
to authenticated
with check (owner_user_id = auth.uid());

create policy workspaces_owner_update
on public.workspaces
for update
to authenticated
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

create policy workspaces_owner_delete
on public.workspaces
for delete
to authenticated
using (owner_user_id = auth.uid());

create policy contacts_owner_select
on public.contacts
for select
to authenticated
using (public.is_workspace_owner(workspace_id));

create policy contacts_owner_insert
on public.contacts
for insert
to authenticated
with check (public.is_workspace_owner(workspace_id));

create policy contacts_owner_update
on public.contacts
for update
to authenticated
using (public.is_workspace_owner(workspace_id))
with check (public.is_workspace_owner(workspace_id));

create policy contacts_owner_delete
on public.contacts
for delete
to authenticated
using (public.is_workspace_owner(workspace_id));

create policy contact_groups_owner_select
on public.contact_groups
for select
to authenticated
using (public.is_workspace_owner(workspace_id));

create policy contact_groups_owner_insert
on public.contact_groups
for insert
to authenticated
with check (public.is_workspace_owner(workspace_id));

create policy contact_groups_owner_update
on public.contact_groups
for update
to authenticated
using (public.is_workspace_owner(workspace_id))
with check (public.is_workspace_owner(workspace_id));

create policy contact_groups_owner_delete
on public.contact_groups
for delete
to authenticated
using (public.is_workspace_owner(workspace_id));

create policy contact_group_memberships_owner_select
on public.contact_group_memberships
for select
to authenticated
using (public.is_workspace_owner(workspace_id));

create policy contact_group_memberships_owner_insert
on public.contact_group_memberships
for insert
to authenticated
with check (public.is_workspace_owner(workspace_id));

create policy contact_group_memberships_owner_update
on public.contact_group_memberships
for update
to authenticated
using (public.is_workspace_owner(workspace_id))
with check (public.is_workspace_owner(workspace_id));

create policy contact_group_memberships_owner_delete
on public.contact_group_memberships
for delete
to authenticated
using (public.is_workspace_owner(workspace_id));

create policy contact_suppressions_owner_select
on public.contact_suppressions
for select
to authenticated
using (public.is_workspace_owner(workspace_id));

create policy contact_suppressions_owner_insert
on public.contact_suppressions
for insert
to authenticated
with check (public.is_workspace_owner(workspace_id));

create policy contact_suppressions_owner_update
on public.contact_suppressions
for update
to authenticated
using (public.is_workspace_owner(workspace_id))
with check (public.is_workspace_owner(workspace_id));

create policy contact_suppressions_owner_delete
on public.contact_suppressions
for delete
to authenticated
using (public.is_workspace_owner(workspace_id));

create policy templates_owner_select
on public.templates
for select
to authenticated
using (public.is_workspace_owner(workspace_id));

create policy templates_owner_insert
on public.templates
for insert
to authenticated
with check (public.is_workspace_owner(workspace_id));

create policy templates_owner_update
on public.templates
for update
to authenticated
using (public.is_workspace_owner(workspace_id))
with check (public.is_workspace_owner(workspace_id));

create policy templates_owner_delete
on public.templates
for delete
to authenticated
using (public.is_workspace_owner(workspace_id));

create policy sender_ids_owner_select
on public.sender_ids
for select
to authenticated
using (public.is_workspace_owner(workspace_id));

create policy sender_ids_owner_insert
on public.sender_ids
for insert
to authenticated
with check (public.is_workspace_owner(workspace_id));

create policy sender_ids_owner_update
on public.sender_ids
for update
to authenticated
using (public.is_workspace_owner(workspace_id))
with check (public.is_workspace_owner(workspace_id));

create policy sender_ids_owner_delete
on public.sender_ids
for delete
to authenticated
using (public.is_workspace_owner(workspace_id));

create policy payment_events_owner_select
on public.payment_events
for select
to authenticated
using (public.is_workspace_owner(workspace_id));

create policy payment_events_owner_insert
on public.payment_events
for insert
to authenticated
with check (public.is_workspace_owner(workspace_id));

create policy payment_events_owner_update
on public.payment_events
for update
to authenticated
using (public.is_workspace_owner(workspace_id))
with check (public.is_workspace_owner(workspace_id));

create policy payment_events_owner_delete
on public.payment_events
for delete
to authenticated
using (public.is_workspace_owner(workspace_id));

create policy wallet_ledger_entries_owner_select
on public.wallet_ledger_entries
for select
to authenticated
using (public.is_workspace_owner(workspace_id));

create policy wallet_ledger_entries_owner_insert
on public.wallet_ledger_entries
for insert
to authenticated
with check (public.is_workspace_owner(workspace_id));

create policy wallet_ledger_entries_owner_update
on public.wallet_ledger_entries
for update
to authenticated
using (public.is_workspace_owner(workspace_id))
with check (public.is_workspace_owner(workspace_id));

create policy wallet_ledger_entries_owner_delete
on public.wallet_ledger_entries
for delete
to authenticated
using (public.is_workspace_owner(workspace_id));

create policy campaigns_owner_select
on public.campaigns
for select
to authenticated
using (public.is_workspace_owner(workspace_id));

create policy campaigns_owner_insert
on public.campaigns
for insert
to authenticated
with check (public.is_workspace_owner(workspace_id));

create policy campaigns_owner_update
on public.campaigns
for update
to authenticated
using (public.is_workspace_owner(workspace_id))
with check (public.is_workspace_owner(workspace_id));

create policy campaigns_owner_delete
on public.campaigns
for delete
to authenticated
using (public.is_workspace_owner(workspace_id));

create policy campaign_audience_groups_owner_select
on public.campaign_audience_groups
for select
to authenticated
using (public.is_workspace_owner(workspace_id));

create policy campaign_audience_groups_owner_insert
on public.campaign_audience_groups
for insert
to authenticated
with check (public.is_workspace_owner(workspace_id));

create policy campaign_audience_groups_owner_update
on public.campaign_audience_groups
for update
to authenticated
using (public.is_workspace_owner(workspace_id))
with check (public.is_workspace_owner(workspace_id));

create policy campaign_audience_groups_owner_delete
on public.campaign_audience_groups
for delete
to authenticated
using (public.is_workspace_owner(workspace_id));

create policy campaign_jobs_owner_select
on public.campaign_jobs
for select
to authenticated
using (public.is_workspace_owner(workspace_id));

create policy campaign_jobs_owner_insert
on public.campaign_jobs
for insert
to authenticated
with check (public.is_workspace_owner(workspace_id));

create policy campaign_jobs_owner_update
on public.campaign_jobs
for update
to authenticated
using (public.is_workspace_owner(workspace_id))
with check (public.is_workspace_owner(workspace_id));

create policy campaign_jobs_owner_delete
on public.campaign_jobs
for delete
to authenticated
using (public.is_workspace_owner(workspace_id));

create policy campaign_runs_owner_select
on public.campaign_runs
for select
to authenticated
using (public.is_workspace_owner(workspace_id));

create policy campaign_runs_owner_insert
on public.campaign_runs
for insert
to authenticated
with check (public.is_workspace_owner(workspace_id));

create policy campaign_runs_owner_update
on public.campaign_runs
for update
to authenticated
using (public.is_workspace_owner(workspace_id))
with check (public.is_workspace_owner(workspace_id));

create policy campaign_runs_owner_delete
on public.campaign_runs
for delete
to authenticated
using (public.is_workspace_owner(workspace_id));

create policy message_attempts_owner_select
on public.message_attempts
for select
to authenticated
using (public.is_workspace_owner(workspace_id));

create policy message_attempts_owner_insert
on public.message_attempts
for insert
to authenticated
with check (public.is_workspace_owner(workspace_id));

create policy message_attempts_owner_update
on public.message_attempts
for update
to authenticated
using (public.is_workspace_owner(workspace_id))
with check (public.is_workspace_owner(workspace_id));

create policy message_attempts_owner_delete
on public.message_attempts
for delete
to authenticated
using (public.is_workspace_owner(workspace_id));

create policy activity_logs_owner_select
on public.activity_logs
for select
to authenticated
using (public.is_workspace_owner(workspace_id));

create policy activity_logs_owner_insert
on public.activity_logs
for insert
to authenticated
with check (public.is_workspace_owner(workspace_id));

create policy activity_logs_owner_update
on public.activity_logs
for update
to authenticated
using (public.is_workspace_owner(workspace_id))
with check (public.is_workspace_owner(workspace_id));

create policy activity_logs_owner_delete
on public.activity_logs
for delete
to authenticated
using (public.is_workspace_owner(workspace_id));
