-- Cento demo workspace seed.
-- Run this after:
-- 1. supabase/sql-editor-initial-setup.sql
-- 2. supabase/sql-editor-rls-policies.sql
--
-- Before running:
-- - replace the email below with a real auth.users email that already exists
-- - this file is idempotent for the seeded rows below

do $$
declare
  target_email text := 'operator@cento.local';
  seed_owner_id uuid;
  seed_workspace_id uuid;
  church_group_id uuid;
  parents_group_id uuid;
  loyalty_group_id uuid;
  template_id uuid;
  approved_sender_id uuid;
  review_sender_id uuid;
  campaign_one_id uuid;
  campaign_two_id uuid;
  campaign_three_id uuid;
begin
  select id
  into seed_owner_id
  from auth.users
  where email = target_email
  limit 1;

  if seed_owner_id is null then
    raise exception 'No auth user found for email %', target_email;
  end if;

  insert into public.workspaces (
    owner_user_id,
    name,
    timezone,
    verification_status
  )
  values (
    seed_owner_id,
    'GraceHub Communications',
    'Africa/Accra',
    'verified'
  )
  on conflict (owner_user_id) do update
    set name = excluded.name,
        timezone = excluded.timezone,
        verification_status = excluded.verification_status,
        updated_at = now()
  returning id into seed_workspace_id;

  insert into public.contact_groups (workspace_id, name, description)
  values
    (seed_workspace_id, 'Church members', 'Members list'),
    (seed_workspace_id, 'Parents', 'Parents list'),
    (seed_workspace_id, 'Loyalty segment', 'Customers')
  on conflict (workspace_id, name) do update
    set description = excluded.description,
        updated_at = now();

  select id into church_group_id
  from public.contact_groups
  where workspace_id = seed_workspace_id and name = 'Church members';

  select id into parents_group_id
  from public.contact_groups
  where workspace_id = seed_workspace_id and name = 'Parents';

  select id into loyalty_group_id
  from public.contact_groups
  where workspace_id = seed_workspace_id and name = 'Loyalty segment';

  insert into public.contacts (
    workspace_id,
    phone_e164,
    full_name,
    first_name,
    last_name,
    source,
    status,
    tags,
    normalization_state,
    is_suppressed
  )
  values
    (
      seed_workspace_id,
      '+233248361973',
      'Ama Nkrumah',
      'Ama',
      'Nkrumah',
      'import',
      'active',
      array['parents'],
      'normalized',
      false
    ),
    (
      seed_workspace_id,
      '+233241940027',
      'Kojo Adjei',
      'Kojo',
      'Adjei',
      'import',
      'invalid',
      array['church-members'],
      'invalid',
      false
    ),
    (
      seed_workspace_id,
      '+233554281738',
      'Nyarko Foods',
      'Nyarko',
      'Foods',
      'import',
      'duplicate',
      array['loyalty'],
      'duplicate',
      false
    )
  on conflict (workspace_id, phone_e164) do update
    set full_name = excluded.full_name,
        first_name = excluded.first_name,
        last_name = excluded.last_name,
        source = excluded.source,
        status = excluded.status,
        tags = excluded.tags,
        normalization_state = excluded.normalization_state,
        is_suppressed = excluded.is_suppressed,
        updated_at = now();

  insert into public.contact_group_memberships (workspace_id, group_id, contact_id)
  select seed_workspace_id, parents_group_id, c.id
  from public.contacts c
  where c.workspace_id = seed_workspace_id
    and c.phone_e164 = '+233248361973'
  on conflict (group_id, contact_id) do nothing;

  insert into public.contact_group_memberships (workspace_id, group_id, contact_id)
  select seed_workspace_id, church_group_id, c.id
  from public.contacts c
  where c.workspace_id = seed_workspace_id
    and c.phone_e164 = '+233241940027'
  on conflict (group_id, contact_id) do nothing;

  insert into public.contact_group_memberships (workspace_id, group_id, contact_id)
  select seed_workspace_id, loyalty_group_id, c.id
  from public.contacts c
  where c.workspace_id = seed_workspace_id
    and c.phone_e164 = '+233554281738'
  on conflict (group_id, contact_id) do nothing;

  insert into public.templates (
    workspace_id,
    name,
    body,
    variables,
    fallback_values,
    template_type
  )
  values (
    seed_workspace_id,
    'Service Reminder',
    'Hello {first_name}, this is a reminder that our Sunday service starts at 8:30 AM tomorrow.',
    '["first_name"]'::jsonb,
    '{"first_name":"Member","last_name":""}'::jsonb,
    'starter'
  )
  on conflict (workspace_id, name) do update
    set body = excluded.body,
        variables = excluded.variables,
        fallback_values = excluded.fallback_values,
        template_type = excluded.template_type,
        updated_at = now()
  returning id into template_id;

  insert into public.sender_ids (
    workspace_id,
    sender_value,
    sender_mode,
    status,
    notes,
    reviewed_at
  )
  values
    (
      seed_workspace_id,
      'GRACEHUB',
      'shared',
      'approved',
      'Ready for campaigns',
      now()
    ),
    (
      seed_workspace_id,
      'CENTOCARE',
      'branded',
      'in_review',
      'Documents pending admin approval',
      null
    )
  on conflict (workspace_id, sender_value) do update
    set sender_mode = excluded.sender_mode,
        status = excluded.status,
        notes = excluded.notes,
        reviewed_at = excluded.reviewed_at,
        updated_at = now();

  select id into approved_sender_id
  from public.sender_ids
  where workspace_id = seed_workspace_id and sender_value = 'GRACEHUB';

  select id into review_sender_id
  from public.sender_ids
  where workspace_id = seed_workspace_id and sender_value = 'CENTOCARE';

  insert into public.wallet_ledger_entries (
    workspace_id,
    entry_type,
    direction,
    units,
    amount_minor,
    currency,
    actor_user_id,
    reason
  )
  select seed_workspace_id, 'top_up', 'credit', 8000, 42000, 'GHS', seed_owner_id, 'Top-up via Paystack'
  where not exists (
    select 1
    from public.wallet_ledger_entries
    where workspace_id = seed_workspace_id
      and reason = 'Top-up via Paystack'
  );

  insert into public.wallet_ledger_entries (
    workspace_id,
    entry_type,
    direction,
    units,
    amount_minor,
    currency,
    actor_user_id,
    reason
  )
  select seed_workspace_id, 'manual_adjustment', 'credit', 6900, null, 'GHS', seed_owner_id, 'Opening balance'
  where not exists (
    select 1
    from public.wallet_ledger_entries
    where workspace_id = seed_workspace_id
      and reason = 'Opening balance'
  );

  insert into public.campaigns (
    workspace_id,
    name,
    sender_mode,
    sender_id,
    template_id,
    message_body,
    personalization_fallback,
    audience_filters,
    scheduled_for,
    state,
    failure_reason,
    estimated_recipient_count,
    estimated_units
  )
  values
    (
      seed_workspace_id,
      'Midweek service reminder',
      'shared',
      approved_sender_id,
      template_id,
      'Hello {first_name}, remember the midweek service tonight at 6:30 PM.',
      '{"first_name":"Member","last_name":""}'::jsonb,
      '[]'::jsonb,
      null,
      'completed',
      null,
      2480,
      2480
    ),
    (
      seed_workspace_id,
      'PTA meeting notice',
      'shared',
      approved_sender_id,
      null,
      'Reminder: PTA meeting starts at 2:30 PM today.',
      '{"first_name":"Parent","last_name":""}'::jsonb,
      '[]'::jsonb,
      now() + interval '1 hour',
      'queued',
      null,
      1120,
      1120
    ),
    (
      seed_workspace_id,
      'Customer promo blast',
      'branded',
      review_sender_id,
      null,
      'Weekend promo: reply now to claim your loyalty offer.',
      '{"first_name":"Customer","last_name":""}'::jsonb,
      '[{"field":"tag","operator":"in","value":"loyalty"}]'::jsonb,
      now() + interval '1 day',
      'needs_attention',
      'invalid_sender',
      4850,
      9700
    )
  on conflict do nothing;

  select id into campaign_one_id
  from public.campaigns
  where workspace_id = seed_workspace_id and name = 'Midweek service reminder';

  select id into campaign_two_id
  from public.campaigns
  where workspace_id = seed_workspace_id and name = 'PTA meeting notice';

  select id into campaign_three_id
  from public.campaigns
  where workspace_id = seed_workspace_id and name = 'Customer promo blast';

  insert into public.campaign_audience_groups (workspace_id, campaign_id, group_id)
  values
    (seed_workspace_id, campaign_one_id, church_group_id),
    (seed_workspace_id, campaign_two_id, parents_group_id),
    (seed_workspace_id, campaign_three_id, loyalty_group_id)
  on conflict (campaign_id, group_id) do nothing;

  insert into public.wallet_ledger_entries (
    workspace_id,
    entry_type,
    direction,
    units,
    currency,
    actor_user_id,
    reason,
    campaign_id
  )
  select seed_workspace_id, 'campaign_deduction', 'debit', 2480, 'GHS', seed_owner_id, 'Campaign deduction', campaign_one_id
  where not exists (
    select 1
    from public.wallet_ledger_entries
    where workspace_id = seed_workspace_id
      and campaign_id = campaign_one_id
      and reason = 'Campaign deduction'
  );
end
$$;
