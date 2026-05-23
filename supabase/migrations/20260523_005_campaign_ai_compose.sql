alter table campaigns
  add column if not exists ai_compose jsonb not null default '{}'::jsonb;
