import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";

export default async function PersonsPage() {
  const supabase = await createClient();
  const { data: persons, error } = await supabase
    .from("person")
    .select("*")
    .order("person_id");

  if (error) return <div className="error">{error.message}</div>;

  return (
    <>
      <h1>Persons</h1>
      <p className="muted">
        Individuals known to the system — complainants, victims, witnesses,
        suspects.
      </p>
      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>National ID</th>
              <th>Gender</th>
              <th>DOB</th>
              <th>Phone</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>
            {persons?.map((p) => (
              <tr key={p.person_id}>
                <td className="muted">{p.person_id}</td>
                <td>{p.name}</td>
                <td>{p.national_id ?? "—"}</td>
                <td>{p.gender ?? "—"}</td>
                <td>{formatDate(p.dob)}</td>
                <td>{p.phone ?? "—"}</td>
                <td>{p.address ?? "—"}</td>
              </tr>
            ))}
            {!persons?.length && (
              <tr><td colSpan={7} className="empty">No persons</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
