import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

export default async function ComplaintsPage() {
  await requireRole(["officer", "chef"]);
  const supabase = await createClient();
  const { data: complaints, error } = await supabase
    .from("complaint")
    .select(
      `complaint_id, filed_at, description, status,
       complainant:person!complaint_complainant_id_fkey(person_id, name),
       officer:officer!complaint_officer_id_fkey(officer_id, name, badge_number)`,
    )
    .order("filed_at", { ascending: false });

  if (error) return <div className="notice">{error.message}</div>;

  return (
    <>
      <div className="page-head">
        <h1>Complaints</h1>
        <div className="meta">
          <Link href="/complaints/new" className="btn">New →</Link>
        </div>
      </div>

      <div className="dossier" style={{ padding: 0 }}>
        <table className="ledger">
          <thead>
            <tr>
              <th>File No.</th>
              <th>Filed</th>
              <th>Complainant</th>
              <th>Received by</th>
              <th>Description</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {complaints?.map((c: any) => (
              <tr key={c.complaint_id}>
                <td className="id">{c.complaint_id}</td>
                <td className="mono muted">{new Date(c.filed_at).toLocaleString()}</td>
                <td>{c.complainant?.name ?? "—"}</td>
                <td>
                  {c.officer?.name ?? "—"}{" "}
                  <span className="muted mono" style={{ fontSize: 11 }}>{c.officer?.badge_number}</span>
                </td>
                <td className="muted">{c.description?.slice(0, 70)}{c.description?.length > 70 ? "…" : ""}</td>
                <td><span className={`stamp stamp-${c.status}`}>{c.status}</span></td>
              </tr>
            ))}
            {!complaints?.length && (
              <tr><td colSpan={6} className="empty">No complaints filed.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
