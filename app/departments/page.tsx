import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { visibleDepartmentIds } from "@/lib/scope";

export default async function DepartmentsPage() {
  const user = await requireRole(["officer", "chef"]);
  const supabase = await createClient();
  const scope = await visibleDepartmentIds(user);

  let q = supabase
    .from("department")
    .select(
      `department_id, name, description,
       station:police_station(station_id, name),
       officer:officer(officer_id)`,
    )
    .order("department_id");
  if (scope !== null) q = q.in("department_id", scope);
  const { data: departments, error } = await q;

  if (error) return <div className="notice">{error.message}</div>;

  return (
    <>
      <div className="page-head">
        <h1>Departments</h1>
      </div>

      <div className="dossier" style={{ padding: 0 }}>
        <table className="ledger">
          <thead>
            <tr>
              <th>Dept No.</th>
              <th>Name</th>
              <th>Station</th>
              <th>Description</th>
              <th>Officers</th>
            </tr>
          </thead>
          <tbody>
            {departments?.map((d: any) => (
              <tr key={d.department_id}>
                <td className="id"><Link href={`/departments/${d.department_id}`}>{d.department_id}</Link></td>
                <td><Link href={`/departments/${d.department_id}`} style={{ color: "inherit" }}>{d.name}</Link></td>
                <td>
                  <Link href={`/stations/${d.station?.station_id}`}>{d.station?.name ?? "—"}</Link>{" "}
                  <span className="muted mono" style={{ fontSize: 11 }}>{d.station?.station_id}</span>
                </td>
                <td className="muted">{d.description ?? "—"}</td>
                <td className="mono">{d.officer?.length ?? 0}</td>
              </tr>
            ))}
            {!departments?.length && (
              <tr><td colSpan={5} className="empty">No departments registered.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
