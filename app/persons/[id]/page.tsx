import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

export default async function PersonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["officer", "chef"]);
  const { id } = await params;
  const supabase = await createClient();

  const { data: person, error } = await supabase
    .from("person")
    .select("*")
    .eq("person_id", id)
    .maybeSingle();

  if (error) return <div className="notice">{error.message}</div>;
  if (!person) notFound();

  const [{ data: complaints }, { data: involvements }, { data: arrests }] = await Promise.all([
    supabase
      .from("complaint")
      .select("complaint_id, filed_at, title, status, evidence_url")
      .eq("complainant_id", id)
      .order("filed_at", { ascending: false }),
    supabase
      .from("person_involvement")
      .select(
        `role, notes,
         case:case(case_id, opened_date, status,
           crime_type:crime_type(name, severity))`,
      )
      .eq("person_id", id),
    supabase
      .from("arrest")
      .select(
        `arrest_id, arrested_at, location,
         case:case(case_id),
         officer:officer(officer_id, name, badge_number)`,
      )
      .eq("person_id", id)
      .order("arrested_at", { ascending: false }),
  ]);

  return (
    <>
      <div className="page-head">
        <div>
          <span className="mono muted" style={{ fontSize: 12 }}>{person.person_id}</span>
          <h1 style={{ marginTop: 4 }}>{person.name}</h1>
          <div className="muted mono" style={{ fontSize: 12, marginTop: 8 }}>
            {person.national_id ?? "—"} · {person.gender ?? "—"} · {person.dob ? new Date(person.dob).toLocaleDateString() : "—"}
          </div>
          <div className="muted" style={{ fontSize: 13, marginTop: 6 }}>
            {person.address ?? "—"} · <span className="mono">{person.phone ?? "—"}</span>
          </div>
        </div>
      </div>

      <div className="grid-stats" style={{ marginBottom: 8 }}>
        <Stat label="Reports filed"     value={complaints?.length ?? 0} />
        <Stat label="Cases involved in" value={involvements?.length ?? 0} />
        <Stat label="Arrests"           value={arrests?.length ?? 0} />
      </div>

      <div className="section-rule"><span className="label">Reports filed</span></div>
      <div className="dossier" style={{ padding: 0 }}>
        <table className="ledger">
          <thead>
            <tr><th>File</th><th>Title</th><th>Filed</th><th>Status</th></tr>
          </thead>
          <tbody>
            {complaints?.map((c) => (
              <tr key={c.complaint_id}>
                <td className="id">{c.complaint_id}</td>
                <td>
                  {c.title}
                  {c.evidence_url && <span className="muted" style={{ marginLeft: 8 }}>📎</span>}
                </td>
                <td className="mono muted">{new Date(c.filed_at).toLocaleString()}</td>
                <td><span className={`stamp stamp-${c.status}`}>{c.status}</span></td>
              </tr>
            ))}
            {!complaints?.length && <tr><td colSpan={4} className="empty">No reports filed.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="section-rule"><span className="label">Cases involved in</span></div>
      <div className="dossier" style={{ padding: 0 }}>
        <table className="ledger">
          <thead>
            <tr><th>File</th><th>Crime</th><th>Role</th><th>Notes</th><th>Status</th></tr>
          </thead>
          <tbody>
            {involvements?.map((i: any, idx) => (
              <tr key={(i.case?.case_id ?? "x") + i.role + idx}>
                <td className="id"><Link href={`/cases/${i.case?.case_id}`}>{i.case?.case_id ?? "—"}</Link></td>
                <td>
                  {i.case?.crime_type?.name ?? "—"}{" "}
                  {i.case?.crime_type?.severity && <span className={`stamp severity-${i.case.crime_type.severity}`} style={{ marginLeft: 6 }}>{i.case.crime_type.severity}</span>}
                </td>
                <td><span className={`stamp stamp-${i.role === "suspect" ? "convicted" : i.role === "victim" ? "open" : "filed"}`}>{i.role}</span></td>
                <td className="muted">{i.notes ?? "—"}</td>
                <td><span className={`stamp stamp-${i.case?.status}`}>{i.case?.status ?? "—"}</span></td>
              </tr>
            ))}
            {!involvements?.length && <tr><td colSpan={5} className="empty">Not involved in any case.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="section-rule"><span className="label">Arrests</span></div>
      <div className="dossier" style={{ padding: 0 }}>
        <table className="ledger">
          <thead>
            <tr><th>Arrest</th><th>Case</th><th>By officer</th><th>Location</th><th>When</th></tr>
          </thead>
          <tbody>
            {arrests?.map((a: any) => (
              <tr key={a.arrest_id}>
                <td className="id">{a.arrest_id}</td>
                <td><Link href={`/cases/${a.case?.case_id}`}>{a.case?.case_id ?? "—"}</Link></td>
                <td><Link href={`/officers/${a.officer?.officer_id}`}>{a.officer?.name}</Link> <span className="mono muted" style={{ fontSize: 11 }}>{a.officer?.badge_number}</span></td>
                <td className="muted">{a.location ?? "—"}</td>
                <td className="mono muted">{new Date(a.arrested_at).toLocaleString()}</td>
              </tr>
            ))}
            {!arrests?.length && <tr><td colSpan={5} className="empty">Never arrested.</td></tr>}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: 32 }}><Link href="/persons">← Back to persons</Link></p>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{
      border: "1px solid var(--rule)", borderRadius: 2, padding: 16,
      background: "var(--paper-2)", display: "flex", flexDirection: "column", gap: 6,
    }}>
      <span className="mono" style={{ fontSize: 10.5, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--ink-muted)" }}>{label}</span>
      <span className="mono" style={{ fontSize: 26, lineHeight: 1 }}>{value}</span>
    </div>
  );
}
