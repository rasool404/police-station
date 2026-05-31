import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

export default async function MyReportsPage() {
  const user = await requireRole("citizen");
  const supabase = await createClient();

  const { data: complaints, error } = await supabase
    .from("complaint")
    .select("complaint_id, filed_at, description, status")
    .eq("complainant_id", user.personId ?? "")
    .order("filed_at", { ascending: false });

  if (error) return <div className="notice">{error.message}</div>;

  return (
    <>
      <div className="page-head">
        <h1>My reports</h1>
        <div className="meta">
          <Link href="/report/new" className="btn">New →</Link>
        </div>
      </div>

      {!complaints?.length ? (
        <div className="dossier" style={{ padding: 36, textAlign: "center" }}>
          <span className="muted" style={{ fontStyle: "italic" }}>
            You haven&apos;t filed any reports yet.
          </span>
          <div style={{ marginTop: 14 }}>
            <Link href="/report/new" className="btn">File your first report →</Link>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {complaints.map((c) => (
            <div key={c.complaint_id} className="dossier" style={{ padding: 24 }}>
              <div className="row-between" style={{ marginBottom: 12 }}>
                <div>
                  <span className="mono" style={{ fontSize: 13 }}>{c.complaint_id}</span>
                  <div className="muted mono" style={{ fontSize: 11, marginTop: 4 }}>
                    Filed {new Date(c.filed_at).toLocaleString()}
                  </div>
                </div>
                <span className={`stamp stamp-${c.status}`}>{c.status}</span>
              </div>
              <hr className="rule" />
              <p style={{ margin: 0, fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 16, lineHeight: 1.55, color: "var(--ink-2)" }}>
                “{c.description}”
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
