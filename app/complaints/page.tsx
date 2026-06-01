import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { visibleComplaintOfficerIds } from "@/lib/scope";

export default async function ComplaintsPage() {
  await requireRole("chef");
  const supabase = await createClient();
  const scope = null;

  let query = supabase
    .from("complaint")
    .select(
      `complaint_id, filed_at, title, description, status, evidence_url,
       complainant:person!complaint_complainant_id_fkey(person_id, name),
       officer:officer!complaint_officer_id_fkey(officer_id, name, badge_number)`,
    )
    .order("filed_at", { ascending: false });
  if (scope !== null) query = query.in("officer_id", scope);
  const { data: complaints, error } = await query;

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
              <th></th>
              <th>File No.</th>
              <th>Title</th>
              <th>Filed</th>
              <th>Complainant</th>
              <th>Received by</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {complaints?.map((c: any) => (
              <tr key={c.complaint_id}>
                <td style={{ width: 70 }}>
                  {c.evidence_url ? (
                    <a href={c.evidence_url} target="_blank" rel="noreferrer" title="Open evidence">
                      <img src={c.evidence_url} alt="" className="thumb" />
                    </a>
                  ) : (
                    <div className="thumb" style={{ display: "grid", placeItems: "center", fontSize: 18, color: "var(--ink-faint)" }}>—</div>
                  )}
                </td>
                <td className="id"><Link href={`/complaints/${c.complaint_id}`}>{c.complaint_id}</Link></td>
                <td><Link href={`/complaints/${c.complaint_id}`} style={{ color: "inherit" }}>{c.title}</Link></td>
                <td className="mono muted">{new Date(c.filed_at).toLocaleString()}</td>
                <td>{c.complainant?.name ?? "—"}</td>
                <td>
                  {c.officer?.name ?? "—"}{" "}
                  <span className="muted mono" style={{ fontSize: 11 }}>{c.officer?.badge_number}</span>
                </td>
                <td><span className={`stamp stamp-${c.status}`}>{c.status}</span></td>
              </tr>
            ))}
            {!complaints?.length && (
              <tr><td colSpan={7} className="empty">No complaints filed.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
