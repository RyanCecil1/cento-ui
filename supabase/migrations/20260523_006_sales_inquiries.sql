create table if not exists sales_inquiries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone_number text not null,
  organization_name text not null,
  role_title text not null default '',
  requested_credits integer not null,
  reason text not null,
  exceeds_pricing_limit boolean not null default false,
  pricing_limit_reference integer not null,
  created_at timestamptz not null default now()
);

create index if not exists sales_inquiries_created_at_idx
  on sales_inquiries (created_at desc);
