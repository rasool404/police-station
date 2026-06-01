-- Allow updating + deleting objects in the complaint-evidence bucket
-- so the seed script can re-upload over existing files (upsert).
drop policy if exists complaint_evidence_update on storage.objects;
drop policy if exists complaint_evidence_delete on storage.objects;

create policy complaint_evidence_update
    on storage.objects for update
    to anon, authenticated
    using      (bucket_id = 'complaint-evidence')
    with check (bucket_id = 'complaint-evidence');

create policy complaint_evidence_delete
    on storage.objects for delete
    to anon, authenticated
    using (bucket_id = 'complaint-evidence');
