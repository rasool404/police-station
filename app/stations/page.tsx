import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

export default async function StationsPage() {
  await requireRole(["officer", "chef"]);
  const supabase = await createClient();
  const { data: stations, error } = await supabase
    .from("police_station")
    .select(
      `station_id, name, address, phone,
       department:department(department_id, name),
       officer:officer(officer_id)`,
    )
    .order("station_id");

  if (error) return <div className="notice">{error.message}</div>;

  return (
    <>
      <div className="page-head">
        <h1>Stations</h1>
      </div>

      <div className="dossier" style={{ padding: 0 }}>
        <table className="ledger">
          <thead>
            <tr>
              <th>Station No.</th>
              <th>Name</th>
              <th>Address</th>
              <th>Phone</th>
              <th>Departments</th>
              <th>Officers</th>
            </tr>
          </thead>
          <tbody>
            {stations?.map((s: any) => (
              <tr key={s.station_id}>
                <td className="id">{s.station_id}</td>
                <td>{s.name}</td>
                <td className="muted">{s.address ?? "—"}</td>
                <td className="mono muted">{s.phone ?? "—"}</td>
                <td className="mono">{s.department?.length ?? 0}</td>
                <td className="mono">{s.officer?.length ?? 0}</td>
              </tr>
            ))}
            {!stations?.length && (
              <tr><td colSpan={6} className="empty">No stations registered.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
