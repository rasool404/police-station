import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["officer", "chef"]);
  const { id } = await params;
  const supabase = await createClient();

  const { data: c, error } = await supabase
    .from("case")
    .select(
      `case_id, opened_date, closed_date, status,
       complaint:complaint(complaint_id, filed_at, description, status,
         complainant:person!complaint_complainant_id_fkey(person_id, name)
       ),
       crime_type:crime_type(crime_type_id, name, severity, description),
       lead_officer:officer!case_lead_officer_id_fkey(officer_id, name, badge_number),
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

  if (error) return <div className="notice">{error.message}</div>;
  if (!c) notFound();

  const k = c as any;
  const totalArrests = k.arrests?.length ?? 0;
  const totalCharges = (k.arrests ?? []).reduce((acc: number, a: any) => acc + (a.charges?.length ?? 0), 0);
  const totalEvidence = k.evidence?.length ?? 0;

  return (
    <>
      {/* HERO HEADER */}
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", top: 0, right: 0 }}>
          {totalArrests > 0 && <span className="wax-stamp">Arrest filed</span>}
        </div>
        <span className="mono muted" style={{ fontSize: 12 }}>{k.case_id}</span>
        <h1 style={{ marginTop: 4 }}>
          {k.crime_type?.name ?? "Unclassified"}
        </h1>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 14 }}>
          <span className={`stamp stamp-${k.status}`}>{k.status}</span>
          {k.crime_type?.severity && (
            <span className={`stamp severity-${k.crime_type.severity}`}>{k.crime_type.severity}</span>
          )}
          <span className="mono muted" style={{ fontSize: 12 }}>
            opened {new Date(k.opened_date).toLocaleDateString()}
            {k.closed_date && ` · closed ${new Date(k.closed_date).toLocaleDateString()}`}
          </span>
        </div>
      </div>

      <hr className="rule" style={{ marginTop: 28 }} />

      {/* META GRID */}
      <div className="grid-stats" style={{ marginBottom: 8 }}>
        <MetaCard label="Lead officer" value={k.lead_officer?.name ?? "—"} sub={k.lead_officer?.badge_number} />
        <MetaCard label="Officers assigned" value={String(k.assignments?.length ?? 0)} />
        <MetaCard label="Persons involved" value={String(k.involvements?.length ?? 0)} />
        <MetaCard label="Arrests · Charges" value={`${totalArrests} · ${totalCharges}`} />
        <MetaCard label="Evidence items" value={String(totalEvidence)} />
      </div>

      {/* ORIGINATING COMPLAINT */}
      {k.complaint && (
        <>
          <div className="section-rule">
            <span className="label">Complaint</span>
          </div>
          <div className="dossier" style={{ padding: 24 }}>
            <div className="row-between">
              <div>
                <div className="mono" style={{ fontSize: 13 }}>{k.complaint.complaint_id}</div>
                <div className="muted" style={{ fontSize: 13 }}>
                  Filed by {k.complaint.complainant?.name ?? "anon"}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span className={`stamp stamp-${k.complaint.status}`}>{k.complaint.status}</span>
                <div className="mono muted" style={{ fontSize: 11, marginTop: 6 }}>{new Date(k.complaint.filed_at).toLocaleString()}</div>
              </div>
            </div>
            <hr className="rule" />
            <p style={{ marginBottom: 0, fontFamily: "var(--font-display)", fontSize: 17, lineHeight: 1.5, fontStyle: "italic", color: "var(--ink-2)" }}>
              “{k.complaint.description}”
            </p>
          </div>
        </>
      )}

      {/* ASSIGNMENTS */}
      <div className="section-rule">
        <span className="label">Officers</span>
      </div>
      <div className="dossier" style={{ padding: 0 }}>
        <table className="ledger">
          <thead>
            <tr><th>Badge</th><th>Officer</th><th>Role</th><th>Assigned</th></tr>
          </thead>
          <tbody>
            {k.assignments?.map((a: any) => (
              <tr key={a.officer.officer_id + a.assigned_date}>
                <td className="id">{a.officer.badge_number}</td>
                <td>{a.officer.name}</td>
                <td><span className="mono" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.18em" }}>{a.role ?? "—"}</span></td>
                <td className="mono muted">{new Date(a.assigned_date).toLocaleDateString()}</td>
              </tr>
            )) ?? null}
            {!k.assignments?.length && <tr><td colSpan={4} className="empty">No assignments</td></tr>}
          </tbody>
        </table>
      </div>

      {/* INVOLVEMENTS */}
      <div className="section-rule">
        <span className="label">Persons</span>
      </div>
      <div className="dossier" style={{ padding: 0 }}>
        <table className="ledger">
          <thead>
            <tr><th>Name</th><th>National ID</th><th>Role</th><th>Notes</th></tr>
          </thead>
          <tbody>
            {k.involvements?.map((i: any) => (
              <tr key={i.person.person_id + i.role}>
                <td>{i.person.name}</td>
                <td className="id">{i.person.national_id ?? "—"}</td>
                <td><span className={`stamp stamp-${i.role === "suspect" ? "convicted" : i.role === "victim" ? "open" : "filed"}`}>{i.role}</span></td>
                <td className="muted">{i.notes ?? "—"}</td>
              </tr>
            )) ?? null}
            {!k.involvements?.length && <tr><td colSpan={4} className="empty">No persons recorded</td></tr>}
          </tbody>
        </table>
      </div>

      {/* ARRESTS & CHARGES */}
      <div className="section-rule">
        <span className="label">Arrests</span>
      </div>
      {k.arrests?.length ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {k.arrests.map((a: any) => (
            <div key={a.arrest_id} className="dossier" style={{ padding: 24 }}>
              <div className="row-between">
                <div>
                  <div className="mono" style={{ fontSize: 13 }}>{a.arrest_id}</div>
                  <h3 style={{ margin: "6px 0 4px" }}>
                    {a.person?.name} <span className="display-italic" style={{ color: "var(--ink-muted)" }}>arrested</span>
                  </h3>
                  <div className="muted" style={{ fontSize: 13 }}>
                    by {a.officer?.name} <span className="mono">({a.officer?.badge_number})</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="mono" style={{ fontSize: 11, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.18em" }}>{new Date(a.arrested_at).toLocaleString()}</div>
                  <div className="mono muted" style={{ fontSize: 11, marginTop: 4 }}>{a.location ?? "—"}</div>
                </div>
              </div>
              <hr className="rule" />
              <span className="eyebrow">Charges</span>
              <table className="ledger" style={{ marginTop: 8 }}>
                <thead>
                  <tr><th>Charge</th><th>Crime</th><th>Description</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {a.charges?.map((ch: any) => (
                    <tr key={ch.charge_id}>
                      <td className="id">{ch.charge_id}</td>
                      <td>{ch.crime_type?.name ?? "—"}</td>
                      <td>{ch.description ?? "—"}</td>
                      <td><span className={`stamp stamp-${ch.status}`}>{ch.status}</span></td>
                    </tr>
                  ))}
                  {!a.charges?.length && <tr><td colSpan={4} className="empty">No charges filed</td></tr>}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      ) : (
        <div className="dossier" style={{ padding: 24, textAlign: "center" }}>
          <span className="muted" style={{ fontStyle: "italic" }}>No arrests recorded for this case.</span>
        </div>
      )}

      {/* EVIDENCE */}
      <div className="section-rule">
        <span className="label">Evidence</span>
      </div>
      <div className="dossier" style={{ padding: 0 }}>
        <table className="ledger">
          <thead>
            <tr><th>Tag No.</th><th>Type</th><th>Description</th><th>Collected by</th><th>Logged at</th></tr>
          </thead>
          <tbody>
            {k.evidence?.map((e: any) => (
              <tr key={e.evidence_id}>
                <td className="id">{e.evidence_id}</td>
                <td><span className="mono" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.18em" }}>{e.evidence_type ?? "—"}</span></td>
                <td>{e.description ?? "—"}</td>
                <td>{e.officer?.name ?? "—"}</td>
                <td className="mono muted">{new Date(e.collected_at).toLocaleString()}</td>
              </tr>
            )) ?? null}
            {!k.evidence?.length && <tr><td colSpan={5} className="empty">No evidence on file</td></tr>}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: 32 }}>
        <Link href="/cases">← Back to cases</Link>
      </p>
    </>
  );
}

function MetaCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{
      border: "1px solid var(--rule)",
      borderRadius: 2,
      padding: 16,
      background: "var(--paper-2)",
      display: "flex",
      flexDirection: "column",
      gap: 6,
    }}>
      <span style={{
        fontFamily: "var(--font-mono)",
        fontSize: 10.5,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: "var(--ink-muted)",
      }}>{label}</span>
      <span style={{ fontFamily: "var(--font-display)", fontSize: 22, lineHeight: 1.1 }}>{value}</span>
      {sub && <span className="mono muted" style={{ fontSize: 11 }}>{sub}</span>}
    </div>
  );
}
