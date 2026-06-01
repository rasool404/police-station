import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

export default async function StationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["officer", "chef"]);
  const { id } = await params;
  const supabase = await createClient();

  const { data: station, error } = await supabase
    .from("police_station")
    .select(
      `station_id, name, address, phone,
       department:department(department_id, name, description, officer:officer(officer_id)),
       officer:officer(officer_id, name, badge_number, rank:rank(title))`,
    )
    .eq("station_id", id)
    .maybeSingle();

  if (error) return <div className="notice">{error.message}</div>;
  if (!station) notFound();

  const s = station as any;

  return (
    <>
      <div className="page-head">
        <div>
          <span className="mono muted" style={{ fontSize: 12 }}>{s.station_id}</span>
          <h1 style={{ marginTop: 4 }}>{s.name}</h1>
          <div className="muted" style={{ marginTop: 8 }}>
            {s.address ?? "—"} · <span className="mono">{s.phone ?? "—"}</span>
          </div>
        </div>
      </div>

      <div className="section-rule"><span className="label">Departments</span></div>
      <div className="dossier" style={{ padding: 0 }}>
        <table className="ledger">
          <thead>
            <tr><th>ID</th><th>Name</th><th>Description</th><th>Officers</th></tr>
          </thead>
          <tbody>
            {s.department?.map((d: any) => (
              <tr key={d.department_id}>
                <td className="id"><Link href={`/departments/${d.department_id}`}>{d.department_id}</Link></td>
                <td>{d.name}</td>
                <td className="muted">{d.description ?? "—"}</td>
                <td className="mono">{d.officer?.length ?? 0}</td>
              </tr>
            ))}
            {!s.department?.length && (
              <tr><td colSpan={4} className="empty">No departments at this station.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="section-rule"><span className="label">Officers</span></div>
      <div className="dossier" style={{ padding: 0 }}>
        <table className="ledger">
          <thead>
            <tr><th>Badge</th><th>Name</th><th>Rank</th></tr>
          </thead>
          <tbody>
            {s.officer?.map((o: any) => (
              <tr key={o.officer_id}>
                <td className="id"><Link href={`/officers/${o.officer_id}`}>{o.badge_number}</Link></td>
                <td>{o.name}</td>
                <td className="muted">{o.rank?.title ?? "—"}</td>
              </tr>
            ))}
            {!s.officer?.length && (
              <tr><td colSpan={3} className="empty">No officers at this station.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: 32 }}><Link href="/stations">← Back to stations</Link></p>
    </>
  );
}
