import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { ReassignForm } from "./ReassignForm";

export default async function OfficerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole(["officer", "chef"]);
  const { id } = await params;
  const supabase = await createClient();

  const { data: officer, error } = await supabase
    .from("officer")
    .select(
      `officer_id, badge_number, name, phone, join_date,
       station_id, department_id, rank_id,
       station:police_station(station_id, name),
       department:department(department_id, name),
       rank:rank(title, level)`,
    )
    .eq("officer_id", id)
    .maybeSingle();

  if (error) return <div className="notice">{error.message}</div>;
  if (!officer) notFound();

  const o = officer as any;

  // Chef-only edit panel data.
  const isChef = user.role === "chef";
  const [{ data: stations }, { data: departments }, { data: ranks }] = isChef
    ? await Promise.all([
        supabase.from("police_station").select("station_id, name").order("name"),
        supabase.from("department").select("department_id, name, station_id").order("name"),
        supabase.from("rank").select("rank_id, title, level").order("level"),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }];

  // Cases where they are the lead.
  const { data: leadCases } = await supabase
    .from("case")
    .select(
      `case_id, opened_date, closed_date, status,
       crime_type:crime_type(name, severity)`,
    )
    .eq("lead_officer_id", id)
    .order("opened_date", { ascending: false });

  // Cases assigned to them (excluding lead so we don't double-list).
  const { data: assignments } = await supabase
    .from("case_assignment")
    .select(
      `assigned_date, role,
       case:case(case_id, opened_date, status,
         crime_type:crime_type(name, severity),
         lead_officer:officer!case_lead_officer_id_fkey(officer_id, name))`,
    )
    .eq("officer_id", id)
    .order("assigned_date", { ascending: false });

  const leadIds = new Set((leadCases ?? []).map((c) => c.case_id));
  const supportCases = (assignments ?? []).filter((a: any) => a.case && !leadIds.has(a.case.case_id));

  // Arrests they made.
  const { data: arrests } = await supabase
    .from("arrest")
    .select(`arrest_id, arrested_at, location,
             case:case(case_id),
             person:person(person_id, name)`)
    .eq("officer_id", id)
    .order("arrested_at", { ascending: false });

  // Evidence they collected.
  const { data: evidence } = await supabase
    .from("evidence")
    .select("evidence_id, evidence_type, description, collected_at, case_id")
    .eq("collected_by_officer_id", id)
    .order("collected_at", { ascending: false });

  return (
    <>
      <div className="page-head">
        <div>
          <span className="mono muted" style={{ fontSize: 12 }}>{o.badge_number}</span>
          <h1 style={{ marginTop: 4 }}>{o.name}</h1>
          <div className="muted" style={{ marginTop: 8 }}>
            {o.rank?.title ?? "Officer"} ·{" "}
            <Link href={`/stations/${o.station?.station_id}`}>{o.station?.name ?? "—"}</Link>
            {o.department && (
              <> · <Link href={`/departments/${o.department?.department_id}`}>{o.department?.name}</Link></>
            )}
          </div>
          <div className="mono muted" style={{ fontSize: 11, marginTop: 6 }}>
            {o.phone ?? "—"} · joined {o.join_date ? new Date(o.join_date).toLocaleDateString() : "—"}
          </div>
        </div>
      </div>

      <div className="grid-stats" style={{ marginBottom: 8 }}>
        <Stat label="Cases led"        value={leadCases?.length ?? 0} />
        <Stat label="Cases supporting" value={supportCases.length} />
        <Stat label="Arrests made"     value={arrests?.length ?? 0} />
        <Stat label="Evidence logged"  value={evidence?.length ?? 0} />
      </div>

      {isChef && (
        <>
          <div className="section-rule"><span className="label">Reassign (chief only)</span></div>
          <div className="dossier" style={{ padding: 20 }}>
            <ReassignForm
              officerId={o.officer_id}
              currentRankId={o.rank_id}
              currentStationId={o.station_id}
              currentDepartmentId={o.department_id}
              ranks={ranks ?? []}
              stations={stations ?? []}
              departments={departments ?? []}
            />
          </div>
        </>
      )}

      <div className="section-rule"><span className="label">Cases as lead</span></div>
      <CaseTable
        rows={(leadCases ?? []).map((c: any) => ({
          case_id: c.case_id, crime: c.crime_type?.name, severity: c.crime_type?.severity,
          opened: c.opened_date, status: c.status, role: "lead",
        }))}
      />

      <div className="section-rule"><span className="label">Cases supporting</span></div>
      <CaseTable
        rows={supportCases.map((a: any) => ({
          case_id: a.case.case_id, crime: a.case.crime_type?.name, severity: a.case.crime_type?.severity,
          opened: a.case.opened_date, status: a.case.status, role: a.role ?? "—",
        }))}
      />

      <div className="section-rule"><span className="label">Arrests made</span></div>
      <div className="dossier" style={{ padding: 0 }}>
        <table className="ledger">
          <thead>
            <tr><th>Arrest</th><th>Case</th><th>Person</th><th>Location</th><th>When</th></tr>
          </thead>
          <tbody>
            {arrests?.map((a: any) => (
              <tr key={a.arrest_id}>
                <td className="id">{a.arrest_id}</td>
                <td><Link href={`/cases/${a.case?.case_id}`}>{a.case?.case_id ?? "—"}</Link></td>
                <td><Link href={`/persons/${a.person?.person_id}`}>{a.person?.name ?? "—"}</Link></td>
                <td className="muted">{a.location ?? "—"}</td>
                <td className="mono muted">{new Date(a.arrested_at).toLocaleString()}</td>
              </tr>
            ))}
            {!arrests?.length && <tr><td colSpan={5} className="empty">No arrests on record.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="section-rule"><span className="label">Evidence collected</span></div>
      <div className="dossier" style={{ padding: 0 }}>
        <table className="ledger">
          <thead>
            <tr><th>Tag</th><th>Type</th><th>Description</th><th>Case</th><th>When</th></tr>
          </thead>
          <tbody>
            {evidence?.map((e: any) => (
              <tr key={e.evidence_id}>
                <td className="id">{e.evidence_id}</td>
                <td><span className="mono" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.18em" }}>{e.evidence_type ?? "—"}</span></td>
                <td>{e.description ?? "—"}</td>
                <td><Link href={`/cases/${e.case_id}`}>{e.case_id}</Link></td>
                <td className="mono muted">{new Date(e.collected_at).toLocaleString()}</td>
              </tr>
            ))}
            {!evidence?.length && <tr><td colSpan={5} className="empty">No evidence logged.</td></tr>}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: 32 }}><Link href="/officers">← Back to officers</Link></p>
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

function CaseTable({ rows }: { rows: { case_id: string; crime?: string; severity?: string; opened: string; status: string; role: string }[] }) {
  return (
    <div className="dossier" style={{ padding: 0 }}>
      <table className="ledger">
        <thead>
          <tr>
            <th>File</th><th>Crime</th><th>Severity</th><th>Role</th><th>Opened</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.case_id}>
              <td className="id"><Link href={`/cases/${r.case_id}`}>{r.case_id}</Link></td>
              <td>{r.crime ?? "—"}</td>
              <td>{r.severity ? <span className={`stamp severity-${r.severity}`}>{r.severity}</span> : "—"}</td>
              <td><span className="mono" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.18em" }}>{r.role}</span></td>
              <td className="mono muted">{new Date(r.opened).toLocaleDateString()}</td>
              <td><span className={`stamp stamp-${r.status}`}>{r.status}</span></td>
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={6} className="empty">None.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
