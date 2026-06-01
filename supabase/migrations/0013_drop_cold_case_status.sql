-- Remove 'cold' from case.status. The case CHECK was defined inline
-- in 0001_init.sql with a system-generated name; the easiest stable
-- way to swap it is drop-by-conkey then re-add with the new set.

do $$
declare
    conname text;
begin
    select c.conname into conname
    from pg_constraint c
    where c.conrelid = '"case"'::regclass
      and c.contype  = 'c'
      and pg_get_constraintdef(c.oid) like '%status%'
      and pg_get_constraintdef(c.oid) like '%''cold''%';
    if conname is not null then
        execute format('alter table %I drop constraint %I', 'case', conname);
    end if;
end$$;

-- (Just in case the unlikely event a row already had 'cold'.)
update "case" set status = 'closed' where status = 'cold';

alter table "case"
    add constraint case_status_check
    check (status in ('open', 'investigating', 'closed'));
