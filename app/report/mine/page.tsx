import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

export default async function MyReportsPage() {
  const user = await requireRole("citizen");
  const supabase = await createClient();

  const { data: complaints, error } = await supabase
    .from("complaint")
    .select("complaint_id, filed_at, title, description, status, evidence_url")
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
          {complaints.map((c: any) => (
            <div key={c.complaint_id} className="dossier" style={{ padding: 24 }}>
              <div className="row-between" style={{ marginBottom: 8 }}>
                <span className="mono muted" style={{ fontSize: 11 }}>{c.complaint_id}</span>
                <span className={`stamp stamp-${c.status}`}>{c.status}</span>
              </div>
              <h3 style={{ margin: "0 0 6px" }}>{c.title}</h3>
              <div className="muted mono" style={{ fontSize: 11, marginBottom: 14 }}>
                Filed {new Date(c.filed_at).toLocaleString()}
              </div>
              <p style={{ margin: 0, fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 16, lineHeight: 1.55, color: "var(--ink-2)" }}>
                “{c.description}”
              </p>
              {c.evidence_url && (
                <a href={c.evidence_url} target="_blank" rel="noreferrer" style={{ display: "block", marginTop: 16 }}>
                  <img src={c.evidence_url} alt="Evidence" style={{ maxWidth: 320, maxHeight: 240, borderRadius: 2, border: "1px solid var(--rule)" }} />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
