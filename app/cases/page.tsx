import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate, statusBadgeClass, severityBadgeClass } from "@/lib/format";
import { requireRole } from "@/lib/auth";

export default async function CasesPage() {
  await requireRole(["officer", "admin"]);
  const supabase = await createClient();
  const { data: cases, error } = await supabase
    .from("case")
    .select(
      `case_id, opened_date, closed_date, status,
       crime_type:crime_type(name, severity),
       lead_officer:officer!case_lead_officer_id_fkey(name, badge_number)`,
    )
    .order("opened_date", { ascending: false });

  if (error) return <div className="error">{error.message}</div>;

  return (
    <>
      <div className="row">
        <h1>Cases</h1>
        <Link href="/cases/new"><button>New case</button></Link>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
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
                <td className="muted">{c.case_id}</td>
                <td>{c.crime_type?.name ?? "—"}</td>
                <td>
                  {c.crime_type?.severity ? (
                    <span className={severityBadgeClass(c.crime_type.severity)}>
                      {c.crime_type.severity}
                    </span>
                  ) : "—"}
                </td>
                <td>
                  {c.lead_officer?.name ?? "—"}{" "}
                  <span className="muted">({c.lead_officer?.badge_number})</span>
                </td>
                <td>{formatDate(c.opened_date)}</td>
                <td>{formatDate(c.closed_date)}</td>
                <td><span className={statusBadgeClass(c.status)}>{c.status}</span></td>
                <td><Link href={`/cases/${c.case_id}`}>View →</Link></td>
              </tr>
            ))}
            {!cases?.length && (
              <tr><td colSpan={8} className="empty">No cases</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
