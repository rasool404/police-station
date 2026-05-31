import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createCase } from "@/app/actions/case";
import { requireRole } from "@/lib/auth";

export default async function NewCasePage() {
  await requireRole(["officer", "admin"]);
  const supabase = await createClient();

  const [{ data: complaints }, { data: crimeTypes }, { data: officers }] =
    await Promise.all([
      supabase
        .from("complaint")
        .select("complaint_id, description, status")
        .neq("status", "converted")
        .order("filed_at", { ascending: false }),
      supabase.from("crime_type").select("crime_type_id, name").order("name"),
      supabase
        .from("officer")
        .select("officer_id, name, badge_number")
        .order("name"),
    ]);

  if (!complaints?.length) {
    return (
      <>
        <h1>Open a case</h1>
        <div className="card empty">
          No open complaints available. <Link href="/complaints/new">File one first</Link>.
        </div>
      </>
    );
  }

  return (
    <>
      <h1>Open a case from a complaint</h1>
      <form action={createCase} className="stack card">
        <label>
          Complaint
          <select name="complaint_id" required defaultValue="">
            <option value="" disabled>Select a complaint…</option>
            {complaints.map((c) => (
              <option key={c.complaint_id} value={c.complaint_id}>
                {c.complaint_id} — {(c.description ?? "").slice(0, 60)}
              </option>
            ))}
          </select>
        </label>

        <label>
          Crime type
          <select name="crime_type_id" required defaultValue="">
            <option value="" disabled>Select a crime type…</option>
            {crimeTypes?.map((ct) => (
              <option key={ct.crime_type_id} value={ct.crime_type_id}>
                {ct.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Lead officer
          <select name="lead_officer_id" required defaultValue="">
            <option value="" disabled>Select an officer…</option>
            {officers?.map((o) => (
              <option key={o.officer_id} value={o.officer_id}>
                {o.name} — {o.badge_number}
              </option>
            ))}
          </select>
        </label>

        <div className="row">
          <button type="submit">Open case</button>
        </div>
      </form>
    </>
  );
}
