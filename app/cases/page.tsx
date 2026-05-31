import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

export default async function CasesPage() {
  await requireRole(["officer", "chef"]);
  const supabase = await createClient();
  const { data: cases, error } = await supabase
    .from("case")
    .select(
      `case_id, opened_date, closed_date, status,
       crime_type:crime_type(name, severity),
       lead_officer:officer!case_lead_officer_id_fkey(name, badge_number)`,
    )
    .order("opened_date", { ascending: false });

  if (error) return <div className="notice">{error.message}</div>;

  return (
    <>
      <div className="page-head">
        <h1>Cases</h1>
        <div className="meta">
          <Link href="/cases/new" className="btn">New →</Link>
        </div>
      </div>

      <div className="dossier" style={{ padding: 0, overflow: "hidden" }}>
        <table className="ledger">
          <thead>
            <tr>
              <th>File No.</th>
              <th>Crime</th>
              <th>Severity</th>
              <th>Lead officer</th>
              <th>Opened</th>
              <th>Closed</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cases?.map((c: any) => (
              <tr key={c.case_id}>
                <td className="id">{c.case_id}</td>
                <td>{c.crime_type?.name ?? "—"}</td>
                <td>
                  {c.crime_type?.severity ? (
                    <span className={`stamp severity-${c.crime_type.severity}`}>
                      {c.crime_type.severity}
                    </span>
                  ) : "—"}
                </td>
                <td>
                  {c.lead_officer?.name ?? "—"}{" "}
                  <span className="muted mono" style={{ fontSize: 11 }}>{c.lead_officer?.badge_number}</span>
                </td>
                <td className="mono muted">{new Date(c.opened_date).toLocaleDateString()}</td>
                <td className="mono muted">{c.closed_date ? new Date(c.closed_date).toLocaleDateString() : "—"}</td>
                <td><span className={`stamp stamp-${c.status}`}>{c.status}</span></td>
                <td><Link href={`/cases/${c.case_id}`}>Open file →</Link></td>
              </tr>
            ))}
            {!cases?.length && (
              <tr><td colSpan={8} className="empty">No cases on file.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
