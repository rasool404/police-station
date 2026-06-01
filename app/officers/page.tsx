import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { Avatar } from "@/components/Avatar";

export default async function OfficersPage() {
  await requireRole(["officer", "chef"]);
  const supabase = await createClient();
  const { data: officers, error } = await supabase
    .from("officer")
    .select(
      `officer_id, badge_number, name, phone, join_date,
       station:police_station(name),
       department:department(name),
       rank:rank(title, level)`,
    )
    .order("officer_id");

  if (error) return <div className="notice">{error.message}</div>;

  return (
    <>
      <div className="page-head">
        <h1>Officers</h1>
      </div>

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
        {!officers?.length && <div className="dossier empty">No officers on roster.</div>}
      </div>
    </>
  );
}
