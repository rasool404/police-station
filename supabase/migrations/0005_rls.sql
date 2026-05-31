-- =========================================================
-- Row Level Security policies
-- =========================================================
-- Anonymous users see nothing. Authenticated users see what
-- their role permits:
--
--   citizen : own person row, own complaints, cases derived
--             from own complaints (read-only), reference data
--             (rank, crime_type) for choosing a crime type
--             when filing a report.
--   officer : full read on operational tables, can update
--             complaints/cases/etc. Cannot drop reference data.
--   admin   : everything.
-- =========================================================

-- ---------- Enable RLS on every table ----------
alter table app_user           enable row level security;
alter table police_station     enable row level security;
alter table department         enable row level security;
alter table rank               enable row level security;
alter table officer            enable row level security;
alter table person             enable row level security;
alter table crime_type         enable row level security;
alter table complaint          enable row level security;
alter table "case"             enable row level security;
alter table case_assignment    enable row level security;
alter table person_involvement enable row level security;
alter table arrest             enable row level security;
alter table charge             enable row level security;
alter table evidence           enable row level security;

-- =========================================================
-- app_user
-- =========================================================
-- Every authenticated user can read their own row (so the app
-- can fetch their role on every request). Admins can read and
-- update every row.
create policy app_user_select_self
    on app_user for select to authenticated
    using ((select auth.uid()) = user_id);

create policy app_user_select_admin
    on app_user for select to authenticated
    using (is_admin());

create policy app_user_update_admin
    on app_user for update to authenticated
    using (is_admin())
    with check (is_admin());

-- =========================================================
-- Reference data: rank, crime_type
-- =========================================================
-- Anyone signed in can read; only admins can mutate.
create policy rank_select_authn
    on rank for select to authenticated using (true);
create policy rank_admin_write
    on rank for all to authenticated
    using (is_admin()) with check (is_admin());

create policy crime_type_select_authn
    on crime_type for select to authenticated using (true);
create policy crime_type_admin_write
    on crime_type for all to authenticated
    using (is_admin()) with check (is_admin());

-- =========================================================
-- Org data: police_station, department, officer
-- =========================================================
-- Citizens see nothing (they file reports through a generic
-- form, no need to browse the org chart). Officers and admins
-- can read; only admins mutate.
create policy police_station_select_staff
    on police_station for select to authenticated using (is_officer_or_admin());
create policy police_station_admin_write
    on police_station for all to authenticated
    using (is_admin()) with check (is_admin());

create policy department_select_staff
    on department for select to authenticated using (is_officer_or_admin());
create policy department_admin_write
    on department for all to authenticated
    using (is_admin()) with check (is_admin());

create policy officer_select_staff
    on officer for select to authenticated using (is_officer_or_admin());
create policy officer_admin_write
    on officer for all to authenticated
    using (is_admin()) with check (is_admin());

-- =========================================================
-- person
-- =========================================================
-- A citizen can read their own person row (linked via
-- app_user.person_id). Officers and admins read everyone.
-- Officers can create new person rows (e.g. when adding a
-- suspect or witness during investigation). Admins can do
-- anything.
create policy person_select_self
    on person for select to authenticated
    using (
        person_id = (select person_id from app_user where user_id = (select auth.uid()))
    );

create policy person_select_staff
    on person for select to authenticated using (is_officer_or_admin());

create policy person_insert_staff
    on person for insert to authenticated
    with check (is_officer_or_admin());

create policy person_update_staff
    on person for update to authenticated
    using (is_officer_or_admin()) with check (is_officer_or_admin());

create policy person_delete_admin
    on person for delete to authenticated using (is_admin());

-- =========================================================
-- complaint
-- =========================================================
-- A citizen sees their own complaints (where they are the
-- complainant) and can insert new ones with themselves as
-- the complainant. Officers and admins see all complaints
-- and can update them.
create policy complaint_select_own
    on complaint for select to authenticated
    using (
        complainant_id = (select person_id from app_user where user_id = (select auth.uid()))
    );

create policy complaint_select_staff
    on complaint for select to authenticated using (is_officer_or_admin());

create policy complaint_insert_citizen
    on complaint for insert to authenticated
    with check (
        complainant_id = (select person_id from app_user where user_id = (select auth.uid()))
    );

create policy complaint_insert_staff
    on complaint for insert to authenticated
    with check (is_officer_or_admin());

create policy complaint_update_staff
    on complaint for update to authenticated
    using (is_officer_or_admin()) with check (is_officer_or_admin());

create policy complaint_delete_admin
    on complaint for delete to authenticated using (is_admin());

-- =========================================================
-- case (and related operational tables)
-- =========================================================
-- A citizen can read cases that originated from one of their
-- own complaints (read-only). Officers and admins have full
-- access.
create policy case_select_own_complaint
    on "case" for select to authenticated
    using (
        complaint_id in (
            select complaint_id from complaint
            where complainant_id = (select person_id from app_user where user_id = (select auth.uid()))
        )
    );

create policy case_select_staff
    on "case" for select to authenticated using (is_officer_or_admin());

create policy case_write_staff
    on "case" for all to authenticated
    using (is_officer_or_admin()) with check (is_officer_or_admin());

-- The remaining operational tables follow the same pattern:
-- staff (officer + admin) read/write, no citizen access.

create policy case_assignment_staff
    on case_assignment for all to authenticated
    using (is_officer_or_admin()) with check (is_officer_or_admin());

create policy person_involvement_staff
    on person_involvement for all to authenticated
    using (is_officer_or_admin()) with check (is_officer_or_admin());

create policy arrest_staff
    on arrest for all to authenticated
    using (is_officer_or_admin()) with check (is_officer_or_admin());

create policy charge_staff
    on charge for all to authenticated
    using (is_officer_or_admin()) with check (is_officer_or_admin());

create policy evidence_staff
    on evidence for all to authenticated
    using (is_officer_or_admin()) with check (is_officer_or_admin());
