"use client";

import { useActionState } from "react";
import { createRank, type RankFormState } from "@/app/actions/rank";

export function NewRankForm() {
  const [state, action, pending] = useActionState<RankFormState, FormData>(
    createRank,
    null,
  );

  return (
    <>
      {state?.error && <div className="error">{state.error}</div>}
      <form action={action} className="stack card">
        <label>
          Rank ID
          <input name="rank_id" placeholder="e.g. R6" required />
        </label>
        <label>
          Title
          <input name="title" placeholder="e.g. Major" required />
        </label>
        <label>
          Level
          <input
            name="level"
            type="number"
            min={1}
            placeholder="6"
            required
          />
        </label>
        <div className="row">
          <button type="submit" disabled={pending}>
            {pending ? "Adding…" : "Add rank"}
          </button>
        </div>
      </form>
    </>
  );
}
