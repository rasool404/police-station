import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

async function count(table: string) {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });
  if (error) return null;
  return count ?? 0;
}

export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div style={{ maxWidth: 520, margin: "60px auto", textAlign: "center" }}>
        <h1>Police Station Reporting System</h1>
        <p className="muted">
          Sign in to file a report or to access the case management
          dashboard.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24 }}>
          <Link href="/login"><button>Sign in</button></Link>
          <Link href="/signup"><button className="secondary">Create account</button></Link>
        </div>
      </div>
    );
  }

  if (user.role === "citizen") {
    return (
      <>
        <h1>Welcome</h1>
        <p className="muted">
          As a citizen you can file a report and check the status of reports
          you have submitted.
        </p>
        <div className="grid">
          <Link href="/report/new" className="card" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="stat-label">File a new report</div>
            <div className="stat">📝</div>
          </Link>
          <Link href="/report/mine" className="card" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="stat-label">My reports</div>
            <div className="stat">📋</div>
          </Link>
        </div>
      </>
    );
  }

  // Officer / admin dashboard.
  const [stations, officers, persons, complaints, cases, arrests] =
    await Promise.all([
      count("police_station"),
      count("officer"),
      count("person"),
      count("complaint"),
      count("case"),
      count("arrest"),
    ]);

  const stats = [
    { label: "Stations",   value: stations,   href: "/stations" },
    { label: "Officers",   value: officers,   href: "/officers" },
    { label: "Persons",    value: persons,    href: "/persons" },
    { label: "Complaints", value: complaints, href: "/complaints" },
    { label: "Cases",      value: cases,      href: "/cases" },
    { label: "Arrests",    value: arrests,    href: "/cases" },
  ];

  return (
    <>
      <h1>Dashboard</h1>
      <div className="grid">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="card"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div className="stat-label">{s.label}</div>
            <div className="stat">{s.value ?? "—"}</div>
          </Link>
        ))}
      </div>

      <h2>Quick actions</h2>
      <div className="card">
        <div className="row">
          <span>File a complaint on behalf of a citizen</span>
          <Link href="/complaints/new"><button>New complaint</button></Link>
        </div>
      </div>
      <div className="card">
        <div className="row">
          <span>Open a case from a complaint</span>
          <Link href="/cases/new"><button>New case</button></Link>
        </div>
      </div>
      {user.role === "admin" && (
        <div className="card">
          <div className="row">
            <span>Manage ranks</span>
            <Link href="/admin/ranks"><button>Open</button></Link>
          </div>
        </div>
      )}
    </>
  );
}
