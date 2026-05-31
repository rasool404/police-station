import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

export default async function DepartmentsPage() {
  await requireRole(["officer", "admin"]);
  const supabase = await createClient();
  const { data: departments, error } = await supabase
    .from("department")
    .select(
      `department_id, name, description,
       station:police_station(station_id, name),
       officer:officer(officer_id)`,
    )
    .order("department_id");

  if (error) return <div className="error">{error.message}</div>;

  return (
    <>
      <h1>Departments</h1>
      <p className="muted">
        Operational units inside each police station (homicide, narcotics,
        cybercrime, …). Officers belong to one department.
      </p>
      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Station</th>
              <th>Description</th>
              <th>Officers</th>
            </tr>
          </thead>
          <tbody>
            {departments?.map((d: any) => (
              <tr key={d.department_id}>
                <td className="muted">{d.department_id}</td>
                <td>{d.name}</td>
                <td>
                  {d.station?.name ?? "—"}{" "}
                  <span className="muted">({d.station?.station_id})</span>
                </td>
                <td>{d.description ?? "—"}</td>
                <td>{d.officer?.length ?? 0}</td>
              </tr>
            ))}
            {!departments?.length && (
              <tr><td colSpan={5} className="empty">No departments</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
