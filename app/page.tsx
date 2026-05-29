import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

async function count(table: string) {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });
  if (error) return null;
  return count ?? 0;
}

export default async function DashboardPage() {
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

  const dbConfigured =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return (
    <>
      <h1>Dashboard</h1>

      {!dbConfigured && (
        <div className="error">
          Supabase env vars missing. Copy <code>.env.local.example</code> to
          <code> .env.local</code> and fill in your project URL + anon key.
        </div>
      )}

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
          <span>File a new complaint</span>
          <Link href="/complaints/new"><button>New complaint</button></Link>
        </div>
      </div>
      <div className="card">
        <div className="row">
          <span>Open a case from a complaint</span>
          <Link href="/cases/new"><button>New case</button></Link>
        </div>
      </div>
    </>
  );
}
