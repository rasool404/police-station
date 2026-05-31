import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

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

      <div className="dossier" style={{ padding: 0 }}>
        <table className="ledger">
          <thead>
            <tr>
              <th>Badge</th>
              <th>Name</th>
              <th>Rank</th>
              <th>Station</th>
              <th>Department</th>
              <th>Phone</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {officers?.map((o: any) => (
              <tr key={o.officer_id}>
                <td className="id">{o.badge_number}</td>
                <td>{o.name}</td>
                <td>
                  {o.rank?.title ?? "—"}{" "}
                  <span className="muted mono" style={{ fontSize: 11 }}>L{o.rank?.level ?? "?"}</span>
                </td>
                <td className="muted">{o.station?.name ?? "—"}</td>
                <td className="muted">{o.department?.name ?? "—"}</td>
                <td className="mono muted">{o.phone ?? "—"}</td>
                <td className="mono muted">{o.join_date ? new Date(o.join_date).toLocaleDateString() : "—"}</td>
              </tr>
            ))}
            {!officers?.length && (
              <tr><td colSpan={7} className="empty">No officers on roster.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
