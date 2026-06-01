import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { Avatar } from "@/components/Avatar";
import { departmentOfficerIds } from "@/lib/scope";

export default async function OfficersPage() {
  const user = await requireRole(["officer", "chef"]);
  const supabase = await createClient();
  const scope = await departmentOfficerIds(user);
  const isChef = user.role === "chef";

  // Officers visible to this user (scoped to dept for officer, all for chef).
  let officersQ = supabase
    .from("officer")
    .select(
      `officer_id, badge_number, name, phone, join_date,
       station:police_station(name),
       department:department(department_id, name),
       rank:rank(title, level)`,
    )
    .order("officer_id");
  if (scope !== null) officersQ = officersQ.in("officer_id", scope);
  const { data: officers, error } = await officersQ;

  if (error) return <div className="notice">{error.message}</div>;

  // Department name for the page heading (officer scope only).
  let deptName: string | null = null;
  if (!isChef && officers?.length) {
    deptName = (officers[0] as any).department?.name ?? null;
  }

  // Cases / complaints / people only make sense in scoped view. For
  // chef the global lists are reachable from the nav.
  let cases: any[] = [];
  let complaints: any[] = [];
  let people: any[] = [];

  if (!isChef && scope?.length) {
    const [{ data: cs }, { data: cms }] = await Promise.all([
      supabase
        .from("case")
        .select(
          `case_id, opened_date, status,
           crime_type:crime_type(name, severity),
           lead_officer:officer!case_lead_officer_id_fkey(officer_id, name, badge_number)`,
        )
        .in("lead_officer_id", scope)
        .order("opened_date", { ascending: false }),
      supabase
        .from("complaint")
        .select(
          `complaint_id, filed_at, title, status, evidence_url,
           complainant:person!complaint_complainant_id_fkey(person_id, name),
           officer:officer!complaint_officer_id_fkey(officer_id, name, badge_number)`,
        )
        .in("officer_id", scope)
        .order("filed_at", { ascending: false }),
    ]);
    cases      = cs ?? [];
    complaints = cms ?? [];

    if (cases.length) {
      const caseIds = cases.map((c) => c.case_id);
      const { data: ppl } = await supabase
        .from("person_involvement")
        .select(
          `role, notes, case_id,
           person:person(person_id, name, national_id)`,
        )
        .in("case_id", caseIds);
      people = ppl ?? [];
    }
  }

  return (
    <>
      <div className="page-head">
        <h1>{isChef ? "Officers" : `${deptName ?? "My"} department`}</h1>
      </div>

      {!isChef && (
        <div className="section-rule" style={{ marginTop: 12 }}>
          <span className="label">Officers</span>
        </div>
      )}

      <div className="card-grid">
        {officers?.map((o: any) => (
          <Link key={o.officer_id} href={`/officers/${o.officer_id}`} className="person-card">
            <Avatar name={o.name} id={o.officer_id} size={48} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline" }}>
                <strong style={{ fontFamily: "var(--font-display)", fontSize: 17 }}>{o.name}</strong>
                <span className="mono muted" style={{ fontSize: 11 }}>{o.badge_number}</span>
              </div>
              <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>
                {o.rank?.title ?? "Officer"} · {o.department?.name ?? "—"}
              </div>
              <div className="mono faint" style={{ fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", marginTop: 8 }}>
                {o.station?.name ?? "—"}
              </div>
            </div>
          </Link>
        ))}
        {!officers?.length && <div className="dossier empty">No officers.</div>}
      </div>

      {!isChef && (
        <>
          <div className="section-rule"><span className="label">Department cases</span></div>
          <div className="dossier" style={{ padding: 0 }}>
            <table className="ledger">
              <thead>
                <tr>
                  <th>File</th><th>Crime</th><th>Lead</th><th>Opened</th><th>Status</th>
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
                {!cases.length && <tr><td colSpan={5} className="empty">No cases led by this department.</td></tr>}
              </tbody>
            </table>
          </div>

          <div className="section-rule"><span className="label">Department complaints</span></div>
          <div className="dossier" style={{ padding: 0 }}>
            <table className="ledger">
              <thead>
                <tr>
                  <th></th><th>File</th><th>Title</th><th>Complainant</th><th>Received by</th><th>Filed</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c.complaint_id}>
                    <td style={{ width: 56 }}>
                      {c.evidence_url ? (
                        <img src={c.evidence_url} alt="" className="thumb thumb-sm" />
                      ) : (
                        <div className="thumb thumb-sm" style={{ display: "grid", placeItems: "center", color: "var(--ink-faint)" }}>—</div>
                      )}
                    </td>
                    <td className="id"><Link href={`/complaints/${c.complaint_id}`}>{c.complaint_id}</Link></td>
                    <td><Link href={`/complaints/${c.complaint_id}`} style={{ color: "inherit" }}>{c.title}</Link></td>
                    <td>{c.complainant?.name ?? "—"}</td>
                    <td>{c.officer?.name ?? "—"}</td>
                    <td className="mono muted">{new Date(c.filed_at).toLocaleDateString()}</td>
                    <td><span className={`stamp stamp-${c.status}`}>{c.status}</span></td>
                  </tr>
                ))}
                {!complaints.length && <tr><td colSpan={7} className="empty">No complaints in this department.</td></tr>}
              </tbody>
            </table>
          </div>

          <div className="section-rule"><span className="label">People involved in department cases</span></div>
          <div className="dossier" style={{ padding: 0 }}>
            <table className="ledger">
              <thead>
                <tr>
                  <th>Name</th><th>National ID</th><th>Case</th><th>Role</th><th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {people.map((p, idx) => (
                  <tr key={(p.case_id ?? "x") + (p.person?.person_id ?? "") + p.role + idx}>
                    <td>
                      <Link href={`/persons/${p.person?.person_id}`} style={{ color: "inherit", display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
                        <Avatar name={p.person?.name ?? "?"} id={p.person?.person_id} size={28} />
                        {p.person?.name ?? "—"}
                      </Link>
                    </td>
                    <td className="id">{p.person?.national_id ?? "—"}</td>
                    <td className="id"><Link href={`/cases/${p.case_id}`}>{p.case_id}</Link></td>
                    <td><span className={`stamp stamp-${p.role === "suspect" ? "convicted" : p.role === "victim" ? "open" : "filed"}`}>{p.role}</span></td>
                    <td className="muted">{p.notes ?? "—"}</td>
                  </tr>
                ))}
                {!people.length && <tr><td colSpan={5} className="empty">Nobody recorded against department cases yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
