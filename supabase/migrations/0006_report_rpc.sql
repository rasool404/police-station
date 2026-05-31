-- =========================================================
-- pick_receiving_officer()
-- =========================================================
-- Citizens cannot read the officer table directly (RLS blocks
-- them). But they still need an officer_id to file a complaint.
-- This SECURITY DEFINER function picks one server-side and
-- returns it without exposing the table.
--
-- For now it just returns the lowest-badge officer. A real
-- system would route by district / case load.
-- =========================================================

create or replace function pick_receiving_officer()
returns text
language sql
stable
security definer
set search_path = public
as $$
    select officer_id
    from officer
    order by badge_number
    limit 1;
$$;

grant execute on function pick_receiving_officer() to authenticated;
