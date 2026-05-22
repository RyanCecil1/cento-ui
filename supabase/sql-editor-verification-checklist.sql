-- Cento schema verification checklist for the Supabase SQL editor.
-- Run this after:
-- 1. supabase/sql-editor-initial-setup.sql
-- 2. supabase/sql-editor-rls-policies.sql
-- 3. optionally supabase/sql-editor-seed-demo-workspace.sql
--
-- This file does not mutate schema data. It only reports PASS/FAIL style checks.

with expected_tables as (
  select unnest(array[
    'workspaces',
    'contacts',
    'contact_groups',
    'contact_group_memberships',
    'contact_suppressions',
    'templates',
    'sender_ids',
    'payment_events',
    'wallet_ledger_entries',
    'campaigns',
    'campaign_audience_groups',
    'campaign_jobs',
    'campaign_runs',
    'message_attempts',
    'activity_logs'
  ]) as table_name
),
actual_tables as (
  select table_name
  from information_schema.tables
  where table_schema = 'public'
),
table_checks as (
  select
    'table_exists:' || e.table_name as check_name,
    case when a.table_name is not null then 'PASS' else 'FAIL' end as status
  from expected_tables e
  left join actual_tables a using (table_name)
),
function_checks as (
  select
    'function_exists:set_current_timestamp_updated_at' as check_name,
    case
      when exists (
        select 1
        from pg_proc
        where proname = 'set_current_timestamp_updated_at'
      ) then 'PASS'
      else 'FAIL'
    end as status
  union all
  select
    'function_exists:is_workspace_owner' as check_name,
    case
      when exists (
        select 1
        from pg_proc
        where proname = 'is_workspace_owner'
      ) then 'PASS'
      else 'FAIL'
    end as status
),
rls_checks as (
  select
    'rls_enabled:' || relname as check_name,
    case when relrowsecurity then 'PASS' else 'FAIL' end as status
  from pg_class
  where relnamespace = 'public'::regnamespace
    and relname in (
      'workspaces',
      'contacts',
      'contact_groups',
      'contact_group_memberships',
      'contact_suppressions',
      'templates',
      'sender_ids',
      'payment_events',
      'wallet_ledger_entries',
      'campaigns',
      'campaign_audience_groups',
      'campaign_jobs',
      'campaign_runs',
      'message_attempts',
      'activity_logs'
    )
),
policy_checks as (
  select
    'policy_count:' || tablename as check_name,
    case when count(*) > 0 then 'PASS' else 'FAIL' end as status
  from pg_policies
  where schemaname = 'public'
    and tablename in (
      'workspaces',
      'contacts',
      'contact_groups',
      'contact_group_memberships',
      'contact_suppressions',
      'templates',
      'sender_ids',
      'payment_events',
      'wallet_ledger_entries',
      'campaigns',
      'campaign_audience_groups',
      'campaign_jobs',
      'campaign_runs',
      'message_attempts',
      'activity_logs'
    )
  group by tablename
),
index_checks as (
  select
    'index_exists:campaign_jobs_due_at_idx' as check_name,
    case
      when exists (select 1 from pg_indexes where schemaname = 'public' and indexname = 'campaign_jobs_due_at_idx')
      then 'PASS' else 'FAIL'
    end as status
  union all
  select
    'index_exists:contacts_tags_gin_idx' as check_name,
    case
      when exists (select 1 from pg_indexes where schemaname = 'public' and indexname = 'contacts_tags_gin_idx')
      then 'PASS' else 'FAIL'
    end as status
  union all
  select
    'index_exists:wallet_ledger_entries_workspace_created_at_idx' as check_name,
    case
      when exists (select 1 from pg_indexes where schemaname = 'public' and indexname = 'wallet_ledger_entries_workspace_created_at_idx')
      then 'PASS' else 'FAIL'
    end as status
),
summary_checks as (
  select
    'row_count:workspaces' as check_name,
    coalesce((select count(*)::text from public.workspaces), '0') as status
  union all
  select
    'row_count:contacts' as check_name,
    coalesce((select count(*)::text from public.contacts), '0') as status
  union all
  select
    'row_count:campaigns' as check_name,
    coalesce((select count(*)::text from public.campaigns), '0') as status
  union all
  select
    'row_count:wallet_ledger_entries' as check_name,
    coalesce((select count(*)::text from public.wallet_ledger_entries), '0') as status
)
select * from table_checks
union all
select * from function_checks
union all
select * from rls_checks
union all
select * from policy_checks
union all
select * from index_checks
union all
select * from summary_checks
order by check_name;
