-- =========================================================
-- Complaints now have a title and an optional evidence file.
-- Files live in a public Supabase Storage bucket; the URL is
-- stored on the complaint row.
-- =========================================================

-- 1. Schema changes.

alter table complaint add column if not exists title         text;
alter table complaint add column if not exists evidence_url  text;

-- Backfill existing rows with a sensible title derived from
-- the first line of the description (or a placeholder).
update complaint
set title = coalesce(
    nullif(left(regexp_replace(description, E'\\s+', ' ', 'g'), 60), ''),
    'Untitled report'
)
where title is null;

alter table complaint alter column title set not null;

-- 2. Storage bucket for citizen-supplied evidence.
--    Public so the URL works without signed-URL fetches.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'complaint-evidence',
    'complaint-evidence',
    true,
    10485760,                                    -- 10 MB
    array['image/jpeg','image/png','image/webp','image/gif','application/pdf']
)
on conflict (id) do update
   set public             = excluded.public,
       file_size_limit    = excluded.file_size_limit,
       allowed_mime_types = excluded.allowed_mime_types;

-- 3. Storage policies. Anyone can read; anyone can insert
--    into this bucket (course project — no auth gating).
--    Drop-then-create so the migration is idempotent.

drop policy if exists complaint_evidence_read   on storage.objects;
drop policy if exists complaint_evidence_insert on storage.objects;

create policy complaint_evidence_read
    on storage.objects for select
    to anon, authenticated
    using (bucket_id = 'complaint-evidence');

create policy complaint_evidence_insert
    on storage.objects for insert
    to anon, authenticated
    with check (bucket_id = 'complaint-evidence');
