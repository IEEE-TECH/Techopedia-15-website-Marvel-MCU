-- ============================================================================
-- TECHOPEDIA LEVEL 15 // IEEE ANNUAL TECHNICAL FEST
-- Theme: Marvel Multiverse of Tech
-- Organization: IEEE SIESGST
-- Supabase PostgreSQL Master Database Schema & Security Policies
-- ============================================================================

-- 1. Enable pgcrypto extension for UUID generation
create extension if not exists "pgcrypto";

-- 2. Create `students` table
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

-- 3. Create `point_transactions` table for activity logging & points audit trail
create table if not exists public.point_transactions (
    id uuid primary key default gen_random_uuid(),
    agent_id text not null,
    event_id text,
    points integer not null,
    reason text not null,
    awarded_by text default 'Stall Coordinator',
    created_at timestamptz default now() not null
);

-- 4. Create Performance & Lookup Indexes
create index if not exists idx_students_agent_id on public.students (agent_id);
create index if not exists idx_students_prn on public.students (prn);
create index if not exists idx_students_email on public.students (email);
create index if not exists idx_students_points on public.students (points desc);
create index if not exists idx_students_domain on public.students (domain);
create index if not exists idx_transactions_agent_id on public.point_transactions (agent_id);
create index if not exists idx_transactions_created_at on public.point_transactions (created_at desc);

-- 5. Row Level Security (RLS) Configuration
alter table public.students enable row level security;
alter table public.point_transactions enable row level security;

-- Policies for `students`
drop policy if exists "Allow public read access on students" on public.students;
create policy "Allow public read access on students"
on public.students for select
to anon, authenticated
using (true);

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

-- Policies for `point_transactions`
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

-- 6. Marvel Tech Squad Initial Seed Data
insert into public.students (agent_id, name, prn, email, phone, college, team_name, team_size, domain, points, registered_at)
values
  ('TECH15-STARK-1001', 'Prathamesh Palve', '2023CS0101', 'prathamesh@ieee-siesgst.ac.in', '+91 98201 11223', 'SIES Graduate School of Technology', 'Project Stark', '4', 'Squabble', 750, '2026-10-10T10:00:00.000Z'),
  ('TECH15-PANTHER-2042', 'Abhang Rane', '2023IT0204', 'abhang@ieee-siesgst.ac.in', '+91 98202 22334', 'SIES Graduate School of Technology', 'Wakanda Cyber Siege', '3', 'Eureka', 620, '2026-10-10T10:15:00.000Z'),
  ('TECH15-XMEN-3091', 'Mukul Wani', '2023ME0309', 'mukul@ieee-siesgst.ac.in', '+91 98203 33445', 'SIES Graduate School of Technology', 'Stark Bot Battalion', '4', 'Inquisitive', 480, '2026-10-10T10:30:00.000Z'),
  ('TECH15-AVGR-4055', 'Aditi Dhanawade', '2023EX0412', 'aditi@ieee-siesgst.ac.in', '+91 98204 44556', 'SIES Graduate School of Technology', 'Quantum Creators', '2', 'Vanguard', 410, '2026-10-10T11:00:00.000Z'),
  ('TECH15-SPDR-5012', 'Ayush Bhadane', '2024CS0518', 'ayush@ieee-siesgst.ac.in', '+91 98205 55667', 'SIES Graduate School of Technology', 'Web Slingers', '2', 'Squabble', 290, '2026-10-10T11:30:00.000Z')
on conflict (prn) do nothing;

insert into public.point_transactions (agent_id, event_id, points, reason, awarded_by, created_at)
values
  ('TECH15-STARK-1001', 'BUG-BLITZ', 350, 'Bug Blitz Arena — High Voltage Duel', 'Stall Coordinator', '2026-10-10T11:30:00.000Z'),
  ('TECH15-STARK-1001', 'MATRIX-MEM', 300, 'Matrix Memory Challenge', 'Stall Coordinator', '2026-10-10T14:15:00.000Z'),
  ('TECH15-PANTHER-2042', 'CTF-FLAG', 520, 'Offensive CTF Flag Capture', 'Stall Coordinator', '2026-10-10T13:00:00.000Z'),
  ('TECH15-XMEN-3091', 'ROBO-WARS', 380, 'Robo Wars Arena Survival', 'Stall Coordinator', '2026-10-10T15:30:00.000Z'),
  ('TECH15-AVGR-4055', 'UI-JAM', 310, 'Speed UI Design Jam', 'Stall Coordinator', '2026-10-10T16:00:00.000Z')
on conflict do nothing;
