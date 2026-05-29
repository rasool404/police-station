import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime, statusBadgeClass } from "@/lib/format";

export default async function ComplaintsPage() {
  const supabase = await createClient();
  const { data: complaints, error } = await supabase
    .from("complaint")
    .select(
      `complaint_id, filed_at, description, status,
       complainant:person!complaint_complainant_id_fkey(person_id, name),
       officer:officer!complaint_officer_id_fkey(officer_id, name, badge_number)`,
    )
    .order("filed_at", { ascending: false });

  if (error) return <div className="error">{error.message}</div>;

  return (
    <>
      <div className="row">
        <h1>Complaints</h1>
        <Link href="/complaints/new"><button>New complaint</button></Link>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
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
                <td className="muted">{c.complaint_id}</td>
                <td>{formatDateTime(c.filed_at)}</td>
                <td>{c.complainant?.name ?? "—"}</td>
                <td>
                  {c.officer?.name ?? "—"}{" "}
                  <span className="muted">({c.officer?.badge_number})</span>
                </td>
                <td>{c.description}</td>
                <td><span className={statusBadgeClass(c.status)}>{c.status}</span></td>
              </tr>
            ))}
            {!complaints?.length && (
              <tr><td colSpan={6} className="empty">No complaints</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
