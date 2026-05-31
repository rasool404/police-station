-- =========================================================
-- Replace Supabase Auth with a self-contained user_account
-- table, seeded with three demo logins so the system can be
-- explored end-to-end without any external identity provider.
--
-- This is intentionally simple for a database design course:
-- passwords are stored as plain text. In production you would
-- use pgcrypto's crypt() with a per-row salt.
-- =========================================================

-- 1. Tear down the auth.users-based scaffolding from 0004/0005.

drop trigger if exists on_auth_user_created on auth.users;

-- Policies reference the helper functions, so they have to go first.
drop policy if exists app_user_select_self          on app_user;
drop policy if exists app_user_select_admin         on app_user;
drop policy if exists app_user_update_admin         on app_user;

drop policy if exists rank_select_authn             on rank;
drop policy if exists rank_admin_write              on rank;

drop policy if exists crime_type_select_authn       on crime_type;
drop policy if exists crime_type_admin_write        on crime_type;

drop policy if exists police_station_select_staff   on police_station;
drop policy if exists police_station_admin_write    on police_station;

drop policy if exists department_select_staff       on department;
drop policy if exists department_admin_write        on department;

drop policy if exists officer_select_staff          on officer;
drop policy if exists officer_admin_write           on officer;

drop policy if exists person_select_self            on person;
drop policy if exists person_select_staff           on person;
drop policy if exists person_insert_staff           on person;
drop policy if exists person_update_staff           on person;
drop policy if exists person_delete_admin           on person;

drop policy if exists complaint_select_own          on complaint;
drop policy if exists complaint_select_staff        on complaint;
drop policy if exists complaint_insert_citizen      on complaint;
drop policy if exists complaint_insert_staff        on complaint;
drop policy if exists complaint_update_staff        on complaint;
drop policy if exists complaint_delete_admin        on complaint;

drop policy if exists case_select_own_complaint     on "case";
drop policy if exists case_select_staff             on "case";
drop policy if exists case_write_staff              on "case";

drop policy if exists case_assignment_staff         on case_assignment;
drop policy if exists person_involvement_staff      on person_involvement;
drop policy if exists arrest_staff                  on arrest;
drop policy if exists charge_staff                  on charge;
drop policy if exists evidence_staff                on evidence;

drop function if exists handle_new_auth_user();
drop function if exists current_app_user();
drop function if exists current_role_name();
drop function if exists is_admin();
drop function if exists is_officer_or_admin();

drop table if exists app_user;

-- Disable RLS on every table — access control now lives in the
-- application layer (the requireRole helper). The schema is the
-- focus for the course, not auth plumbing.
alter table police_station     disable row level security;
alter table department         disable row level security;
alter table rank               disable row level security;
alter table officer            disable row level security;
alter table person             disable row level security;
alter table crime_type         disable row level security;
alter table complaint          disable row level security;
alter table "case"             disable row level security;
alter table case_assignment    disable row level security;
alter table person_involvement disable row level security;
alter table arrest             disable row level security;
alter table charge             disable row level security;
alter table evidence           disable row level security;

-- pick_receiving_officer() is still useful — keep it.

-- 2. The new account table.

create table user_account (
    user_id    text primary key,                 -- short business id, e.g. 'U-CIT-01'
    username   text not null unique,
    password   text not null,                    -- plain text, course project only
    role       user_role not null,
    person_id  text references person(person_id)   on delete set null,
    officer_id text references officer(officer_id) on delete set null,
    created_at timestamptz not null default now(),

    -- Same CHECK as the previous app_user table: each role has
    -- a specific shape so the data model stays consistent.
    constraint user_account_role_link_chk check (
        (role = 'citizen' and person_id  is not null and officer_id is null) or
        (role = 'officer' and officer_id is not null and person_id  is null) or
        (role = 'admin')
    )
);

create index on user_account (role);
create index on user_account (person_id);
create index on user_account (officer_id);

-- 3. Demo accounts.
-- Citizen is linked to an existing person (PER-01 Hassan Reza).
-- Officer is linked to an existing officer (OFF-01 Alex Carter).
-- Admin has no domain link.

insert into user_account (user_id, username, password, role, person_id, officer_id) values
    ('U-CIT-01', 'citizen', 'citizen123', 'citizen', 'PER-01', null),
    ('U-OFF-01', 'officer', 'officer123', 'officer', null,     'OFF-01'),
    ('U-ADM-01', 'admin',   'admin123',   'admin',   null,     null)
on conflict (user_id) do nothing;
