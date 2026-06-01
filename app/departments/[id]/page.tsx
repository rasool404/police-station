import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

export default async function DepartmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["officer", "chef"]);
  const { id } = await params;
  const supabase = await createClient();

  // 1. Department + station + officers in it.
  const { data: dept, error } = await supabase
    .from("department")
    .select(
      `department_id, name, description,
       station:police_station(station_id, name),
       officer:officer(officer_id, badge_number, name, rank:rank(title))`,
    )
    .eq("department_id", id)
    .maybeSingle();

  if (error) return <div className="notice">{error.message}</div>;
  if (!dept) notFound();

  const d = dept as any;
  const officerIds: string[] = (d.officer ?? []).map((o: any) => o.officer_id);

  // 2. Cases led by an officer in this department.
  let cases: any[] = [];
  if (officerIds.length) {
    const { data } = await supabase
      .from("case")
      .select(
        `case_id, opened_date, closed_date, status,
         crime_type:crime_type(name, severity),
         lead_officer:officer!case_lead_officer_id_fkey(officer_id, name, badge_number)`,
      )
      .in("lead_officer_id", officerIds)
      .order("opened_date", { ascending: false });
    cases = data ?? [];
  }

  return (
    <>
      <div className="page-head">
        <div>
          <span className="mono muted" style={{ fontSize: 12 }}>{d.department_id}</span>
          <h1 style={{ marginTop: 4 }}>{d.name}</h1>
          <div className="muted" style={{ marginTop: 8 }}>
            Part of <Link href={`/stations/${d.station?.station_id}`}>{d.station?.name ?? "—"}</Link>
          </div>
          {d.description && (
            <p style={{ marginTop: 12, maxWidth: 540 }}>{d.description}</p>
          )}
        </div>
      </div>

      <div className="section-rule"><span className="label">Officers in this department</span></div>
      <div className="dossier" style={{ padding: 0 }}>
        <table className="ledger">
          <thead>
            <tr><th>Badge</th><th>Name</th><th>Rank</th></tr>
          </thead>
          <tbody>
            {d.officer?.map((o: any) => (
              <tr key={o.officer_id}>
                <td className="id"><Link href={`/officers/${o.officer_id}`}>{o.badge_number}</Link></td>
                <td>{o.name}</td>
                <td className="muted">{o.rank?.title ?? "—"}</td>
              </tr>
            ))}
            {!d.officer?.length && (
              <tr><td colSpan={3} className="empty">No officers in this department.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="section-rule"><span className="label">Cases led by this department</span></div>
      <div className="dossier" style={{ padding: 0 }}>
        <table className="ledger">
          <thead>
            <tr>
              <th>File</th>
              <th>Crime</th>
              <th>Lead officer</th>
              <th>Opened</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((c) => (
              <tr key={c.case_id}>
                <td className="id"><Link href={`/cases/${c.case_id}`}>{c.case_id}</Link></td>
                <td>
                  {c.crime_type?.name ?? "—"}{" "}
                  {c.crime_type?.severity && <span className={`stamp severity-${c.crime_type.severity}`} style={{ marginLeft: 6 }}>{c.crime_type.severity}</span>}
                </td>
                <td>{c.lead_officer?.name ?? "—"}</td>
                <td className="mono muted">{new Date(c.opened_date).toLocaleDateString()}</td>
                <td><span className={`stamp stamp-${c.status}`}>{c.status}</span></td>
              </tr>
            ))}
            {!cases.length && (
              <tr><td colSpan={5} className="empty">No cases led by this department.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: 32 }}><Link href="/departments">← Back to departments</Link></p>
    </>
  );
}
