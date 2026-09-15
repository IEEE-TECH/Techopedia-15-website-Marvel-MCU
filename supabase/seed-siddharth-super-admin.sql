-- ============================================================================
-- TECHOPEDIA LEVEL 15 // IEEE SIESGST
-- SEED SUPER ADMIN: Siddharth Patil (Technical Head)
-- ============================================================================

-- Step 1: Insert or update Siddharth Patil in team_members table
insert into public.team_members (
    name,
    email,
    role,
    department,
    active,
    created_at,
    updated_at
)
values (
    'Siddharth Patil',
    'siddharth.patil@ieee-siesgst.ac.in', -- Replace with your desired email address if different
    'super_admin',
    'Technical Head',
    true,
    now(),
    now()
)
on conflict (email) do update set
    name = 'Siddharth Patil',
    role = 'super_admin',
    department = 'Technical Head',
    active = true,
    updated_at = now();

-- Step 2 (Optional): If an auth account already exists for this email in auth.users,
-- automatically link the user_id right now:
update public.team_members tm
set user_id = au.id
from auth.users au
where lower(tm.email) = lower(au.email)
  and tm.email = 'siddharth.patil@ieee-siesgst.ac.in';

-- Confirmation query to verify status:
select id, user_id, name, email, role, department, active, last_login 
from public.team_members 
where email = 'siddharth.patil@ieee-siesgst.ac.in';
