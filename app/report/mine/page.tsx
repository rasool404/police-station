import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { formatDateTime, statusBadgeClass } from "@/lib/format";

export default async function MyReportsPage() {
  await requireRole("citizen");
  const supabase = await createClient();

  // RLS handles filtering — citizens only see their own complaints.
  const { data: complaints, error } = await supabase
    .from("complaint")
    .select("complaint_id, filed_at, description, status")
    .order("filed_at", { ascending: false });

  if (error) return <div className="error">{error.message}</div>;

  return (
    <>
      <div className="row">
        <h1>My reports</h1>
        <Link href="/report/new"><button>File new report</button></Link>
      </div>

      {!complaints?.length ? (
        <div className="card empty">
          You haven&apos;t filed any reports yet.
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Filed</th>
                <th>Description</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c.complaint_id}>
                  <td className="muted">{c.complaint_id}</td>
                  <td>{formatDateTime(c.filed_at)}</td>
                  <td>{c.description}</td>
                  <td>
                    <span className={statusBadgeClass(c.status)}>{c.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
