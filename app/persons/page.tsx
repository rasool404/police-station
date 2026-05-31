import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

export default async function PersonsPage() {
  await requireRole(["officer", "chef"]);
  const supabase = await createClient();
  const { data: persons, error } = await supabase
    .from("person")
    .select("*")
    .order("person_id");

  if (error) return <div className="notice">{error.message}</div>;

  return (
    <>
      <div className="page-head">
        <h1>Persons</h1>
      </div>

      <div className="dossier" style={{ padding: 0 }}>
        <table className="ledger">
          <thead>
            <tr>
              <th>Index No.</th>
              <th>Name</th>
              <th>National ID</th>
              <th>Sex</th>
              <th>D.O.B.</th>
              <th>Phone</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>
            {persons?.map((p) => (
              <tr key={p.person_id}>
                <td className="id">{p.person_id}</td>
                <td>{p.name}</td>
                <td className="mono muted">{p.national_id ?? "—"}</td>
                <td className="mono">{p.gender ?? "—"}</td>
                <td className="mono muted">{p.dob ? new Date(p.dob).toLocaleDateString() : "—"}</td>
                <td className="mono muted">{p.phone ?? "—"}</td>
                <td className="muted">{p.address ?? "—"}</td>
              </tr>
            ))}
            {!persons?.length && (
              <tr><td colSpan={7} className="empty">Index empty.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
