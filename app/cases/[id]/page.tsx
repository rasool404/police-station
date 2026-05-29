import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatDateTime, statusBadgeClass, severityBadgeClass } from "@/lib/format";

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: c, error } = await supabase
    .from("case")
    .select(
      `case_id, opened_date, closed_date, status,
       complaint:complaint(complaint_id, filed_at, description, status),
       crime_type:crime_type(crime_type_id, name, severity, description),
       lead_officer:officer(officer_id, name, badge_number),
       assignments:case_assignment(
         assigned_date, role,
         officer:officer(officer_id, name, badge_number)
       ),
       involvements:person_involvement(
         role, notes,
         person:person(person_id, name, national_id)
       ),
       arrests:arrest(
         arrest_id, arrested_at, location,
         person:person(person_id, name),
         officer:officer(officer_id, name, badge_number),
         charges:charge(
           charge_id, description, status,
           crime_type:crime_type(name, severity)
         )
       ),
       evidence:evidence(
         evidence_id, evidence_type, description, collected_at,
         officer:officer(officer_id, name, badge_number)
       )`,
    )
    .eq("case_id", id)
    .maybeSingle();

  if (error) return <div className="error">{error.message}</div>;
  if (!c) notFound();

  const caseRow = c as any;

  return (
    <>
      <div className="row">
        <h1>Case {caseRow.case_id}</h1>
        <span className={statusBadgeClass(caseRow.status)}>{caseRow.status}</span>
      </div>

      <div className="grid">
        <div className="card">
          <div className="stat-label">Crime</div>
          <div style={{ fontSize: 18, marginTop: 4 }}>
            {caseRow.crime_type?.name ?? "—"}
          </div>
          {caseRow.crime_type?.severity && (
            <span className={severityBadgeClass(caseRow.crime_type.severity)} style={{ marginTop: 8 }}>
              {caseRow.crime_type.severity}
            </span>
          )}
        </div>
        <div className="card">
          <div className="stat-label">Lead officer</div>
          <div style={{ fontSize: 18, marginTop: 4 }}>
            {caseRow.lead_officer?.name ?? "—"}
          </div>
          <div className="muted">{caseRow.lead_officer?.badge_number}</div>
        </div>
        <div className="card">
          <div className="stat-label">Opened</div>
          <div style={{ fontSize: 18, marginTop: 4 }}>{formatDate(caseRow.opened_date)}</div>
          <div className="muted">Closed: {formatDate(caseRow.closed_date)}</div>
        </div>
      </div>

      {caseRow.complaint && (
        <>
          <h2>Originating complaint</h2>
          <div className="card">
            <div className="row">
              <strong>{caseRow.complaint.complaint_id}</strong>
              <span className="muted">{formatDateTime(caseRow.complaint.filed_at)}</span>
            </div>
            <p>{caseRow.complaint.description}</p>
          </div>
        </>
      )}

      <h2>Assigned officers</h2>
      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead><tr><th>Badge</th><th>Name</th><th>Role</th><th>Assigned</th></tr></thead>
          <tbody>
            {caseRow.assignments?.map((a: any) => (
              <tr key={a.officer.officer_id + a.assigned_date}>
                <td className="muted">{a.officer.badge_number}</td>
                <td>{a.officer.name}</td>
                <td>{a.role ?? "—"}</td>
                <td>{formatDate(a.assigned_date)}</td>
              </tr>
            ))}
            {!caseRow.assignments?.length && (
              <tr><td colSpan={4} className="empty">No assignments</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <h2>People involved</h2>
      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead><tr><th>Person</th><th>National ID</th><th>Role</th><th>Notes</th></tr></thead>
          <tbody>
            {caseRow.involvements?.map((i: any) => (
              <tr key={i.person.person_id + i.role}>
                <td>{i.person.name}</td>
                <td className="muted">{i.person.national_id ?? "—"}</td>
                <td>{i.role}</td>
                <td>{i.notes ?? "—"}</td>
              </tr>
            ))}
            {!caseRow.involvements?.length && (
              <tr><td colSpan={4} className="empty">No persons involved</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <h2>Arrests &amp; charges</h2>
      {caseRow.arrests?.length ? (
        caseRow.arrests.map((a: any) => (
          <div key={a.arrest_id} className="card">
            <div className="row">
              <strong>{a.arrest_id}</strong>
              <span className="muted">{formatDateTime(a.arrested_at)}</span>
            </div>
            <div className="muted">
              {a.person?.name} arrested by {a.officer?.name} ({a.officer?.badge_number}) @ {a.location ?? "—"}
            </div>
            <table style={{ marginTop: 12 }}>
              <thead>
                <tr><th>Charge</th><th>Crime</th><th>Description</th><th>Status</th></tr>
              </thead>
              <tbody>
                {a.charges?.map((ch: any) => (
                  <tr key={ch.charge_id}>
                    <td className="muted">{ch.charge_id}</td>
                    <td>{ch.crime_type?.name ?? "—"}</td>
                    <td>{ch.description ?? "—"}</td>
                    <td><span className={statusBadgeClass(ch.status)}>{ch.status}</span></td>
                  </tr>
                ))}
                {!a.charges?.length && (
                  <tr><td colSpan={4} className="empty">No charges filed</td></tr>
                )}
              </tbody>
            </table>
          </div>
        ))
      ) : (
        <div className="card empty">No arrests</div>
      )}

      <h2>Evidence</h2>
      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Type</th><th>Description</th><th>Collected by</th><th>Collected at</th>
            </tr>
          </thead>
          <tbody>
            {caseRow.evidence?.map((e: any) => (
              <tr key={e.evidence_id}>
                <td className="muted">{e.evidence_id}</td>
                <td>{e.evidence_type ?? "—"}</td>
                <td>{e.description ?? "—"}</td>
                <td>{e.officer?.name ?? "—"}</td>
                <td>{formatDateTime(e.collected_at)}</td>
              </tr>
            ))}
            {!caseRow.evidence?.length && (
              <tr><td colSpan={5} className="empty">No evidence logged</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
