-- Run this in your Supabase project:
-- Dashboard → SQL Editor → New Query → paste this → Run

-- 1. Create the subscriptions table
create table if not exists public.subscriptions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  tool_name        text not null,
  website          text,
  category         text not null,
  purpose          text not null,
  status           text not null default 'active',
  email            text not null,
  trial_start_date timestamptz,
  trial_end_date   timestamptz,
  billing_cycle    text,
  price            numeric(10, 2) not null default 0,
  currency         text not null default 'USD',
  payment_method   text not null default 'Credit Card',
  reminder_days    integer not null default 3,
  tags             text[] default '{}',
  notes            text,
  last_used        timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- 2. Enable Row Level Security
alter table public.subscriptions enable row level security;

-- 3. RLS Policies — users can only access their own rows
create policy "Users can view their own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own subscriptions"
  on public.subscriptions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own subscriptions"
  on public.subscriptions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own subscriptions"
  on public.subscriptions for delete
  using (auth.uid() = user_id);

-- 4. Auto-update updated_at on row changes
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute procedure public.handle_updated_at();
