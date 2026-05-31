-- =========================================================
-- Auth + roles
-- =========================================================
-- Three roles in this system:
--   citizen — files complaints, sees own reports + cases derived
--             from them.
--   officer — investigates cases. Linked to an officer record.
--   admin   — manages reference data (ranks, departments).
--
-- We use Supabase Auth for identity. Each auth.users row maps
-- 1:1 to an app_user row that carries the role and optional
-- links to a domain entity (person for citizens, officer for
-- officers). A CHECK constraint enforces the relationship.
-- =========================================================

create type user_role as enum ('citizen', 'officer', 'admin');

create table app_user (
    user_id    uuid primary key references auth.users(id) on delete cascade,
    role       user_role   not null default 'citizen',
    person_id  text references person(person_id)   on delete set null,
    officer_id text references officer(officer_id) on delete set null,
    created_at timestamptz not null default now(),

    -- Each role has a specific shape:
    --   citizen → must be linked to a person, never to an officer.
    --   officer → must be linked to an officer, never to a person.
    --   admin   → neither link is required.
    constraint app_user_role_link_chk check (
        (role = 'citizen' and person_id  is not null and officer_id is null) or
        (role = 'officer' and officer_id is not null and person_id  is null) or
        (role = 'admin')
    )
);

create index on app_user (role);
create index on app_user (person_id);
create index on app_user (officer_id);

-- ---------- Optional email column on officer for invite mapping ----------
-- (no FK to auth.users — an officer record can exist before the human
-- is invited; admin links them later by setting app_user.officer_id)
alter table officer add column if not exists email text unique;

-- ---------- Auto-provision profile + person row on signup ----------
--
-- When someone signs up via Supabase Auth we create:
--   1. a person row (so they can be a complainant), and
--   2. an app_user row with role = 'citizen' linked to that person.
--
-- Officer / admin promotion is a separate manual step performed by
-- an existing admin (see /admin/users in the app, or SQL in README).

create or replace function handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    new_person_id text;
    display_name  text;
begin
    display_name := coalesce(
        new.raw_user_meta_data ->> 'name',
        split_part(new.email, '@', 1)
    );

    new_person_id := 'PER-U' || substr(replace(new.id::text, '-', ''), 1, 8);

    insert into person (person_id, name, phone)
    values (new_person_id, display_name, null)
    on conflict (person_id) do nothing;

    insert into app_user (user_id, role, person_id)
    values (new.id, 'citizen', new_person_id)
    on conflict (user_id) do nothing;

    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function handle_new_auth_user();

-- ---------- Helper functions used by RLS policies ----------

create or replace function current_app_user()
returns app_user
language sql
stable
security definer
set search_path = public
as $$
    select * from app_user where user_id = auth.uid();
$$;

create or replace function current_role_name()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
    select role from app_user where user_id = auth.uid();
$$;

create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select coalesce(current_role_name() = 'admin', false);
$$;

create or replace function is_officer_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select coalesce(current_role_name() in ('officer','admin'), false);
$$;
