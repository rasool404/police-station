import { createClient } from "@/lib/supabase/server";

export default async function StationsPage() {
  const supabase = await createClient();
  const { data: stations, error } = await supabase
    .from("police_station")
    .select(
      `station_id, name, address, phone,
       department:department(department_id, name),
       officer:officer(officer_id)`,
    )
    .order("station_id");

  if (error) return <div className="error">{error.message}</div>;

  return (
    <>
      <h1>Police Stations</h1>
      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
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
                <td className="muted">{s.station_id}</td>
                <td>{s.name}</td>
                <td>{s.address ?? "—"}</td>
                <td>{s.phone ?? "—"}</td>
                <td>{s.department?.length ?? 0}</td>
                <td>{s.officer?.length ?? 0}</td>
              </tr>
            ))}
            {!stations?.length && (
              <tr><td colSpan={6} className="empty">No stations</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
