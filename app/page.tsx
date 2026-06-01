import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, type CurrentUser } from "@/lib/auth";
import { visibleComplaintOfficerIds, visibleCaseIds } from "@/lib/scope";

async function count(table: string) {
  const supabase = await createClient();
  const { count } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });
  return count ?? 0;
}

async function countScoped(table: string, column: string, scope: string[] | null) {
  const supabase = await createClient();
  let q = supabase.from(table).select("*", { count: "exact", head: true });
  if (scope !== null) q = q.in(column, scope);
  const { count } = await q;
  return count ?? 0;
}

export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div style={{ textAlign: "center", marginTop: 64 }}>
        <h1>
          <span className="display-italic">Casebook</span>
        </h1>
        <div style={{ marginTop: 28 }}>
          <Link href="/login" className="btn">Sign in →</Link>
        </div>
      </div>
    );
  }

  if (user.role === "citizen") {
    return <CitizenLobby username={user.username} />;
  }

  return <CommandDashboard user={user} />;
}

/* =========================================================
   CITIZEN LOBBY
   ========================================================= */
function CitizenLobby({ username }: { username: string }) {
  return (
    <>
      <div className="page-head">
        <h1>
          Welcome, <span className="display-italic">{username}</span>
        </h1>
      </div>

      <div className="grid-asym">
        <Link href="/report/new" className="dossier-tab" style={{ padding: 32, color: "inherit", display: "block" }}>
          <h2 style={{ margin: 0 }}>
            File a <span className="display-italic">report</span>
          </h2>
          <div style={{ marginTop: 20 }}>
            <span className="btn">Begin →</span>
          </div>
        </Link>

        <Link href="/report/mine" className="dossier-tab" style={{ padding: 24, color: "inherit", display: "block" }}>
          <h3 style={{ margin: 0 }}>My filings</h3>
          <div style={{ marginTop: 16 }}>
            <span className="btn secondary">Open →</span>
          </div>
        </Link>
      </div>
    </>
  );
}

/* =========================================================
   COMMAND DASHBOARD (officer / admin)
   ========================================================= */
async function CommandDashboard({ user }: { user: CurrentUser }) {
  const isChef = user.role === "chef";
  const caseScope = await visibleCaseIds(user);

  const [persons, cases, arrests, complaints] = await Promise.all([
    count("person"),
    countScoped("case",   "case_id", caseScope),
    countScoped("arrest", "case_id", caseScope),
    isChef ? count("complaint") : Promise.resolve(0),
  ]);

  const supabase = await createClient();

  let openCasesQuery = supabase
    .from("case")
    .select(
      `case_id, opened_date, status,
       crime_type:crime_type(name, severity),
       lead_officer:officer!case_lead_officer_id_fkey(name, badge_number)`,
    )
    .neq("status", "closed")
    .order("opened_date", { ascending: false })
    .limit(6);
  if (caseScope !== null) openCasesQuery = openCasesQuery.in("case_id", caseScope);
  const { data: openCases } = await openCasesQuery;

  const { data: recentComplaints } = isChef
    ? await supabase
        .from("complaint")
        .select(
          `complaint_id, filed_at, status, title, description,
           complainant:person!complaint_complainant_id_fkey(name)`,
        )
        .order("filed_at", { ascending: false })
        .limit(5)
    : { data: null };

  return (
    <>
      <div className="page-head">
        <h1>
          Command <span className="display-italic">desk</span>
        </h1>
      </div>

      <div className="grid-stats">
        {isChef && <MetricCard label="Complaints" value={complaints} href="/complaints" />}
        <MetricCard label={isChef ? "Cases"    : "My cases"}    value={cases}   href="/cases" />
        <MetricCard label={isChef ? "Arrests"  : "My arrests"}  value={arrests} href="/cases" />
        {isChef && <MetricCard label="People"   value={persons} href="/persons" />}
      </div>

      <div className={isChef ? "grid-asym" : ""} style={{ marginTop: 32 }}>
        <div className="dossier" style={{ padding: 24 }}>
          <div className="row-between" style={{ marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>Active caseload</h3>
            <Link href="/cases">All →</Link>
          </div>
          {openCases?.length ? (
            <table className="ledger">
              <thead>
                <tr>
                  <th>File</th>
                  <th>Crime</th>
                  <th>Lead</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {openCases.map((c: any) => (
                  <tr key={c.case_id}>
                    <td className="id"><Link href={`/cases/${c.case_id}`}>{c.case_id}</Link></td>
                    <td>{c.crime_type?.name ?? "—"}</td>
                    <td>{c.lead_officer?.name ?? "—"}</td>
                    <td><span className={`stamp stamp-${c.status}`}>{c.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="ledger empty">No active cases.</div>
          )}
        </div>

        {isChef && (
          <div className="dossier" style={{ padding: 24 }}>
            <div className="row-between" style={{ marginBottom: 12 }}>
              <h3 style={{ margin: 0 }}>Recent complaints</h3>
              <Link href="/complaints">All →</Link>
            </div>
            {recentComplaints?.length ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {recentComplaints.map((c: any) => (
                  <div key={c.complaint_id} style={{ paddingBottom: 14, borderBottom: "1px solid var(--rule)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                      <span className="mono" style={{ fontSize: 12 }}>{c.complaint_id}</span>
                      <span className={`stamp stamp-${c.status}`}>{c.status}</span>
                    </div>
                    <div style={{ marginTop: 4, fontSize: 14, fontWeight: 500 }}>
                      {c.title}
                    </div>
                    <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                      {c.description?.slice(0, 80)}{c.description?.length > 80 ? "…" : ""}
                    </div>
                  </div>
                ))}
              </div>
            ) : <div className="muted">No complaints yet.</div>}
          </div>
        )}
      </div>

      {isChef && (
        <div className="grid-stats" style={{ marginTop: 32 }}>
          <ReferenceCard label="Stations"     value={await count("police_station")} href="/stations" />
          <ReferenceCard label="Departments"  value={await count("department")}     href="/departments" />
          <ReferenceCard label="Officers"     value={await count("officer")}        href="/officers" />
          <ReferenceCard label="Evidence"     value={await count("evidence")}       href="/cases" />
          <ReferenceCard label="Charges"      value={await count("charge")}         href="/cases" />
          <ReferenceCard label="Ranks"        value="↗"                              href="/chef/ranks" />
        </div>
      )}
    </>
  );
}

function MetricCard({ label, value, href }: { label: string; value: number | string; href: string }) {
  return (
    <Link href={href} className="dossier-tab" style={{ padding: 22, color: "inherit", textDecoration: "none", display: "block" }}>
      <div className="metric">
        <span className="label">{label}</span>
        <span className="value tabular">{value}</span>
      </div>
    </Link>
  );
}

function ReferenceCard({ label, value, href }: { label: string; value: number | string; href: string }) {
  return (
    <Link href={href} style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "14px 18px",
      border: "1px solid var(--rule)",
      borderRadius: 2,
      background: "var(--paper-2)",
      color: "var(--ink)",
      textDecoration: "none",
    }}>
      <span style={{
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: "var(--ink-muted)",
      }}>{label}</span>
      <span className="mono" style={{ fontSize: 18 }}>{value}</span>
    </Link>
  );
}
