import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { Avatar } from "@/components/Avatar";
import { updateComplaintStatus } from "@/app/actions/status";
import { visibleComplaintOfficerIds } from "@/lib/scope";

export default async function ComplaintDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole(["officer", "chef"]);
  const { id } = await params;
  const supabase = await createClient();

  const { data: c, error } = await supabase
    .from("complaint")
    .select(
      `complaint_id, filed_at, title, description, status, evidence_url,
       complainant:person!complaint_complainant_id_fkey(person_id, name, national_id, phone),
       officer:officer!complaint_officer_id_fkey(officer_id, name, badge_number)`,
    )
    .eq("complaint_id", id)
    .maybeSingle();

  if (error) return <div className="notice">{error.message}</div>;
  if (!c) notFound();

  // Officer can only see complaints assigned to them or someone in their department.
  const scope = await visibleComplaintOfficerIds(user);
  if (scope !== null && !scope.includes((c as any).officer?.officer_id)) notFound();

  const k = c as any;

  // Look up the case derived from this complaint, if any.
  const { data: derivedCase } = await supabase
    .from("case")
    .select(
      `case_id, opened_date, closed_date, status,
       crime_type:crime_type(name, severity),
       lead_officer:officer!case_lead_officer_id_fkey(officer_id, name, badge_number)`,
    )
    .eq("complaint_id", id)
    .maybeSingle();

  return (
    <>
      <div className="page-head">
        <div>
          <span className="mono muted" style={{ fontSize: 12 }}>{k.complaint_id}</span>
          <h1 style={{ marginTop: 4 }}>{k.title}</h1>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 14, alignItems: "center" }}>
            <span className={`stamp stamp-${k.status}`}>{k.status}</span>
            <span className="mono muted" style={{ fontSize: 12 }}>
              filed {new Date(k.filed_at).toLocaleString()}
            </span>
            <form action={updateComplaintStatus} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <input type="hidden" name="complaint_id" value={k.complaint_id} />
              <label style={{ display: "inline-flex", alignItems: "center", gap: 8, flexDirection: "row", textTransform: "none", letterSpacing: 0, fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--ink-muted)" }}>
                Change status
                <select name="status" defaultValue={k.status} style={{ padding: "4px 8px" }}>
                  <option value="open">open</option>
                  <option value="under_review">under review</option>
                  <option value="converted">converted</option>
                  <option value="rejected">rejected</option>
                </select>
              </label>
              <button type="submit" className="secondary" style={{ padding: "4px 10px", fontSize: 10 }}>Save</button>
            </form>
          </div>
        </div>
        {!derivedCase && k.status !== "rejected" && (
          <div className="meta">
            <Link href="/cases/new" className="btn">Open case →</Link>
          </div>
        )}
      </div>

      <div className="grid-asym">
        <div className="dossier" style={{ padding: 24 }}>
          <span className="eyebrow">Description</span>
          <p style={{ marginTop: 12, fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 18, lineHeight: 1.5, color: "var(--ink-2)" }}>
            “{k.description}”
          </p>
          {k.evidence_url && (
            <a href={k.evidence_url} target="_blank" rel="noreferrer" style={{ display: "block", marginTop: 18 }}>
              <img src={k.evidence_url} alt="Evidence" style={{ maxWidth: "100%", maxHeight: 360, borderRadius: 2, border: "1px solid var(--rule)" }} />
            </a>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="dossier" style={{ padding: 20 }}>
            <span className="eyebrow">Complainant</span>
            <Link href={`/persons/${k.complainant?.person_id}`} style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12, color: "inherit", textDecoration: "none" }}>
              <Avatar name={k.complainant?.name ?? "?"} id={k.complainant?.person_id} size={40} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 17 }}>{k.complainant?.name ?? "—"}</div>
                <div className="mono muted" style={{ fontSize: 11 }}>{k.complainant?.person_id}</div>
              </div>
            </Link>
            <div className="mono muted" style={{ fontSize: 11, marginTop: 10 }}>
              ID {k.complainant?.national_id ?? "—"} · {k.complainant?.phone ?? "—"}
            </div>
          </div>

          <div className="dossier" style={{ padding: 20 }}>
            <span className="eyebrow">Received by</span>
            <Link href={`/officers/${k.officer?.officer_id}`} style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12, color: "inherit", textDecoration: "none" }}>
              <Avatar name={k.officer?.name ?? "?"} id={k.officer?.officer_id} size={40} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 17 }}>{k.officer?.name ?? "—"}</div>
                <div className="mono muted" style={{ fontSize: 11 }}>{k.officer?.badge_number}</div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {derivedCase && (
        <>
          <div className="section-rule"><span className="label">Converted to case</span></div>
          <Link
            href={`/cases/${(derivedCase as any).case_id}`}
            className="dossier"
            style={{ display: "block", padding: 20, color: "inherit", textDecoration: "none" }}
          >
            <div className="row-between">
              <div>
                <span className="mono muted" style={{ fontSize: 12 }}>{(derivedCase as any).case_id}</span>
                <h3 style={{ margin: "4px 0 0" }}>
                  {(derivedCase as any).crime_type?.name ?? "—"}
                </h3>
                <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                  Lead: {(derivedCase as any).lead_officer?.name ?? "—"}{" "}
                  <span className="mono">{(derivedCase as any).lead_officer?.badge_number}</span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span className={`stamp stamp-${(derivedCase as any).status}`}>{(derivedCase as any).status}</span>
                <div className="mono muted" style={{ fontSize: 11, marginTop: 6 }}>
                  opened {new Date((derivedCase as any).opened_date).toLocaleDateString()}
                  {(derivedCase as any).closed_date && ` · closed ${new Date((derivedCase as any).closed_date).toLocaleDateString()}`}
                </div>
                <div className="mono muted" style={{ fontSize: 11, marginTop: 6 }}>Open file →</div>
              </div>
            </div>
          </Link>
        </>
      )}

      <p style={{ marginTop: 32 }}><Link href="/complaints">← Back to complaints</Link></p>
    </>
  );
}
