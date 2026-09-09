-- Fortify cloud schema
-- Run in Supabase SQL editor or via migration.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  reason text not null default 'I want freedom because I want a clear mind, stronger discipline, and a closer relationship with God.',
  start_date date not null default current_date,
  longest_streak integer not null default 0 check (longest_streak >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  checkin_date date not null,
  mood smallint not null check (mood between 1 and 5),
  temptation smallint not null check (temptation between 1 and 10),
  clean boolean not null,
  note text not null default '',
  created_at timestamptz not null default now(),
  unique(user_id, checkin_date)
);

create table if not exists public.urges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  urge_date date not null default current_date,
  trigger text not null,
  action text not null default '',
  overcome boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.relapses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  relapse_date date not null default current_date,
  trigger text not null default 'Other',
  lesson text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null default current_date,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.prayers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists checkins_user_date_idx on public.checkins(user_id, checkin_date desc);
create index if not exists urges_user_date_idx on public.urges(user_id, urge_date desc);
create index if not exists relapses_user_date_idx on public.relapses(user_id, relapse_date desc);
create index if not exists journal_user_created_idx on public.journal_entries(user_id, created_at desc);
create index if not exists prayers_user_created_idx on public.prayers(user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.checkins enable row level security;
alter table public.urges enable row level security;
alter table public.relapses enable row level security;
alter table public.journal_entries enable row level security;
alter table public.prayers enable row level security;

-- Every policy is owner-only. The browser never receives a service-role key.
do $$
declare t text;
begin
  foreach t in array array['profiles','checkins','urges','relapses','journal_entries','prayers'] loop
    execute format('drop policy if exists "owner_select" on public.%I', t);
    execute format('drop policy if exists "owner_insert" on public.%I', t);
    execute format('drop policy if exists "owner_update" on public.%I', t);
    execute format('drop policy if exists "owner_delete" on public.%I', t);
    execute format('create policy "owner_select" on public.%I for select using (auth.uid() = user_id)', t);
    execute format('create policy "owner_insert" on public.%I for insert with check (auth.uid() = user_id)', t);
    execute format('create policy "owner_update" on public.%I for update using (auth.uid() = user_id) with check (auth.uid() = user_id)', t);
    execute format('create policy "owner_delete" on public.%I for delete using (auth.uid() = user_id)', t);
  end loop;
end $$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles(user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
