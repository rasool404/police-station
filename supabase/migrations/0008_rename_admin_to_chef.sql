-- =========================================================
-- Rename role 'admin' → 'chef'
-- =========================================================
-- Postgres rejects an in-place enum rename while a CHECK
-- constraint compares the column to the old literal, so we
-- drop the constraint first, rename, then re-add it.
-- =========================================================

alter table user_account
    drop constraint user_account_role_link_chk;

alter type user_role rename value 'admin' to 'chef';

alter table user_account
    add constraint user_account_role_link_chk check (
        (role = 'citizen' and person_id  is not null and officer_id is null) or
        (role = 'officer' and officer_id is not null and person_id  is null) or
        (role = 'chef')
    );

-- Repoint the demo administrator account.
update user_account
set user_id  = 'U-CHEF-01',
    username = 'chef',
    password = 'chef123'
where user_id = 'U-ADM-01';
