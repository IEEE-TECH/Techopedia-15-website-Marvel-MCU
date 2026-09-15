-- ============================================================================
-- TECHOPEDIA LEVEL 15 // IEEE SIESGST
-- Run this once in Supabase Dashboard > SQL Editor.
-- Configures RLS policies and tables for Students and Point Transactions
-- ============================================================================

-- 1. Create tables if not existing
create table if not exists public.students (
    id uuid primary key default gen_random_uuid(),
    agent_id text unique not null,
    name text not null,
    prn text unique not null,
    email text unique not null,
    phone text,
    college text default 'SIES Graduate School of Technology',
    team_name text default 'Avengers Initiative',
    team_size text default '1',
    domain text not null,
    points integer default 100 not null,
    qr_code_url text,
    registered_at timestamptz default now() not null,
    created_at timestamptz default now() not null
);

create table if not exists public.point_transactions (
    id uuid primary key default gen_random_uuid(),
    agent_id text not null,
    event_id text,
    points integer not null,
    reason text not null,
    awarded_by text default 'Stall Coordinator',
    created_at timestamptz default now() not null
);

-- 2. Indexes
create index if not exists idx_students_agent_id on public.students (agent_id);
create index if not exists idx_students_prn on public.students (prn);
create index if not exists idx_students_email on public.students (email);
create index if not exists idx_students_points on public.students (points desc);
create index if not exists idx_transactions_agent_id on public.point_transactions (agent_id);
create index if not exists idx_transactions_created_at on public.point_transactions (created_at desc);

-- 3. Row Level Security Policies
alter table public.students enable row level security;
alter table public.point_transactions enable row level security;

-- Policies for students
drop policy if exists "Allow public read access on students" on public.students;
create policy "Allow public read access on students"
on public.students for select
to anon, authenticated
using (true);

drop policy if exists "Allow public student registration" on public.students;
drop policy if exists "Allow public insert on students" on public.students;
create policy "Allow public insert on students"
on public.students for insert
to anon, authenticated
with check (true);

drop policy if exists "Allow public update on students" on public.students;
create policy "Allow public update on students"
on public.students for update
to anon, authenticated
using (true)
with check (true);

-- Policies for point_transactions
drop policy if exists "Allow public read access on point_transactions" on public.point_transactions;
create policy "Allow public read access on point_transactions"
on public.point_transactions for select
to anon, authenticated
using (true);

drop policy if exists "Allow public insert on point_transactions" on public.point_transactions;
create policy "Allow public insert on point_transactions"
on public.point_transactions for insert
to anon, authenticated
with check (true);