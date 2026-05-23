alter table workspaces
  add column if not exists primary_audience text not null default '',
  add column if not exists use_case text not null default '',
  add column if not exists sender_mode text not null default 'shared',
  add constraint workspaces_sender_mode_check check (
    sender_mode in ('shared', 'branded')
  );
