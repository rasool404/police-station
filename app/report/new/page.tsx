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
      <h1>File a report</h1>
      <p className="muted">
        Describe what happened. Your report will be assigned to an officer
        for review. You can check the status under <strong>My reports</strong>.
      </p>
      {state?.error && <div className="error">{state.error}</div>}
      <form action={action} className="stack card">
        <label>
          Description
          <textarea
            name="description"
            placeholder="What happened? Where? When? Anything else you remember…"
            minLength={10}
            required
          />
        </label>
        <div className="row">
          <button type="submit" disabled={pending}>
            {pending ? "Submitting…" : "Submit report"}
          </button>
        </div>
      </form>
    </>
  );
}
