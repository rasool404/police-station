"use client";

import { useActionState, useState } from "react";
import { fileReport, type ReportState } from "@/app/actions/report";

const MAX_BYTES = 10 * 1024 * 1024;

export default function NewReportPage() {
  const [state, action, pending] = useActionState<ReportState, FormData>(
    fileReport,
    null,
  );
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  return (
    <>
      <div className="page-head">
        <h1>New report</h1>
      </div>

      {state?.error && <div className="notice">{state.error}</div>}

      <div className="dossier" style={{ padding: 32, maxWidth: 700 }}>
        <form action={action} className="stack">
          <label>
            Title
            <input
              name="title"
              required
              minLength={3}
              maxLength={120}
              placeholder="Short summary, e.g. 'Bike stolen from outside cafe'"
            />
          </label>

          <label>
            Description
            <textarea
              name="description"
              placeholder="Be specific. When, where, what happened, and who else was present…"
              minLength={10}
              required
              style={{ minHeight: 160, fontSize: 15, lineHeight: 1.6 }}
            />
          </label>

          <label>
            Evidence (optional)
            <input
              name="evidence"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
              onChange={(e) => {
                setFileError(null);
                const f = e.currentTarget.files?.[0] ?? null;
                if (!f) { setFileName(null); return; }
                if (f.size > MAX_BYTES) {
                  setFileError("File is too large. Max 10 MB.");
                  e.currentTarget.value = "";
                  setFileName(null);
                  return;
                }
                setFileName(f.name);
              }}
              style={{
                border: "1px dashed var(--ink)",
                background: "var(--paper-2)",
                padding: "10px 12px",
                cursor: "pointer",
              }}
            />
            <span className="mono faint" style={{ fontSize: 10.5, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.18em" }}>
              {fileError ? fileError : fileName ? `Attached: ${fileName}` : "JPG · PNG · WEBP · GIF · PDF · max 10 MB"}
            </span>
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
