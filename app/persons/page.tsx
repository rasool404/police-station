import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { Avatar } from "@/components/Avatar";

export default async function PersonsPage() {
  await requireRole("chef");
  const supabase = await createClient();
  const { data: persons, error } = await supabase
    .from("person")
    .select("*")
    .order("person_id");

  if (error) return <div className="notice">{error.message}</div>;

  return (
    <>
      <div className="page-head">
        <h1>People</h1>
      </div>

      <div className="card-grid">
        {persons?.map((p) => (
          <Link key={p.person_id} href={`/persons/${p.person_id}`} className="person-card">
            <Avatar name={p.name} id={p.person_id} size={48} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline" }}>
                <strong style={{ fontFamily: "var(--font-display)", fontSize: 17 }}>{p.name}</strong>
                <span className="mono muted" style={{ fontSize: 11 }}>{p.person_id}</span>
              </div>
              <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>
                {p.gender ?? "—"} · {p.dob ? new Date(p.dob).toLocaleDateString() : "—"}
              </div>
              <div className="mono faint" style={{ fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", marginTop: 8 }}>
                {p.national_id ?? "—"}
              </div>
            </div>
          </Link>
        ))}
        {!persons?.length && <div className="dossier empty">No persons on file.</div>}
      </div>
    </>
  );
}
