create extension if not exists "pgcrypto";

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  occurred_at timestamptz not null,
  description text not null,
  category text not null,
  amount_cents integer not null check (amount_cents >= 0),
  source text not null default 'ai-agent',
  external_id text,
  created_at timestamptz not null default now()
);

create unique index if not exists expenses_external_id_unique
  on public.expenses (external_id)
  where external_id is not null;

create index if not exists expenses_occurred_at_idx
  on public.expenses (occurred_at desc);

create index if not exists expenses_category_idx
  on public.expenses (category);
