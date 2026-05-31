"use client";

import { useActionState } from "react";
import { fileReport, type ReportState } from "@/app/actions/report";

export default function NewReportPage() {
  const [state, action, pending] = useActionState<ReportState, FormData>(
    fileReport,
    null,
  );

  return (
    <>
      <div className="page-head">
        <h1>New report</h1>
      </div>

      {state?.error && <div className="notice">{state.error}</div>}

      <div className="dossier" style={{ padding: 32, maxWidth: 700 }}>
        <form action={action} className="stack">
          <label>
            What happened?
            <textarea
              name="description"
              placeholder="Be specific. When, where, what, and who else was present…"
              minLength={10}
              required
              style={{ minHeight: 180, fontSize: 15, lineHeight: 1.6 }}
            />
          </label>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" disabled={pending}>
              {pending ? "Submitting…" : "Submit →"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
