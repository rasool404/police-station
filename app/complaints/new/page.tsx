import { createClient } from "@/lib/supabase/server";
import { createComplaint } from "@/app/actions/complaint";
import { requireRole } from "@/lib/auth";

export default async function NewComplaintPage() {
  await requireRole(["officer", "chef"]);
  const supabase = await createClient();
  const [{ data: persons }, { data: officers }] = await Promise.all([
    supabase.from("person").select("person_id, name").order("name"),
    supabase
      .from("officer")
      .select("officer_id, name, badge_number")
      .order("name"),
  ]);

  return (
    <>
      <div className="page-head">
        <h1>New complaint</h1>
      </div>

      <div className="dossier" style={{ padding: 32, maxWidth: 680 }}>
        <form action={createComplaint} className="stack">
          <label>
            Complainant
            <select name="complainant_id" required defaultValue="">
              <option value="" disabled>Select a person…</option>
              {persons?.map((p) => (
                <option key={p.person_id} value={p.person_id}>
                  {p.name} ({p.person_id})
                </option>
              ))}
            </select>
          </label>

          <label>
            Receiving officer
            <select name="officer_id" required defaultValue="">
              <option value="" disabled>Select an officer…</option>
              {officers?.map((o) => (
                <option key={o.officer_id} value={o.officer_id}>
                  {o.name} — {o.badge_number}
                </option>
              ))}
            </select>
          </label>

          <label>
            Title
            <input
              name="title"
              required
              minLength={3}
              maxLength={120}
              placeholder="Short summary"
            />
          </label>

          <label>
            Description
            <textarea name="description" placeholder="What happened? Where? When? Anything else witnesses said?" />
          </label>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button type="submit">File complaint →</button>
          </div>
        </form>
      </div>
    </>
  );
}
