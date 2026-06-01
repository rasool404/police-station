"use client";

import { useActionState } from "react";
import { updateOfficerAssignment, type OfficerFormState } from "@/app/actions/officer";

type Rank = { rank_id: string; title: string; level: number };
type Station = { station_id: string; name: string };
type Department = { department_id: string; name: string; station_id: string | null };

export function ReassignForm({
  officerId,
  currentRankId,
  currentStationId,
  currentDepartmentId,
  ranks,
  stations,
  departments,
}: {
  officerId: string;
  currentRankId: string | null;
  currentStationId: string | null;
  currentDepartmentId: string | null;
  ranks: Rank[];
  stations: Station[];
  departments: Department[];
}) {
  const [state, action, pending] = useActionState<OfficerFormState, FormData>(
    updateOfficerAssignment,
    null,
  );

  return (
    <>
      {state && "error" in state && <div className="notice">{state.error}</div>}
      {state && "ok" in state && (
        <div className="notice" style={{ borderLeftColor: "var(--forest)", background: "rgba(42,107,94,0.08)", color: "var(--forest-2)" }}>
          Saved.
        </div>
      )}

      <form
        action={action}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
          alignItems: "flex-end",
        }}
      >
        <input type="hidden" name="officer_id" value={officerId} />

        <label>
          Rank
          <select name="rank_id" defaultValue={currentRankId ?? ""}>
            <option value="">— none —</option>
            {ranks.map((r) => (
              <option key={r.rank_id} value={r.rank_id}>
                {r.title} (L{r.level})
              </option>
            ))}
          </select>
        </label>

        <label>
          Station
          <select name="station_id" defaultValue={currentStationId ?? ""} required>
            {stations.map((s) => (
              <option key={s.station_id} value={s.station_id}>{s.name}</option>
            ))}
          </select>
        </label>

        <label>
          Department
          <select name="department_id" defaultValue={currentDepartmentId ?? ""}>
            <option value="">— none —</option>
            {departments.map((d) => (
              <option key={d.department_id} value={d.department_id}>{d.name}</option>
            ))}
          </select>
        </label>

        <button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save →"}
        </button>
      </form>
    </>
  );
}
