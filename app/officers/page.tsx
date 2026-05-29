import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";

export default async function OfficersPage() {
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

  if (error) return <div className="error">{error.message}</div>;

  return (
    <>
      <h1>Officers</h1>
      <div className="card" style={{ padding: 0 }}>
        <table>
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
                <td className="muted">{o.badge_number}</td>
                <td>{o.name}</td>
                <td>{o.rank?.title ?? "—"}</td>
                <td>{o.station?.name ?? "—"}</td>
                <td>{o.department?.name ?? "—"}</td>
                <td>{o.phone ?? "—"}</td>
                <td>{formatDate(o.join_date)}</td>
              </tr>
            ))}
            {!officers?.length && (
              <tr><td colSpan={7} className="empty">No officers</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
