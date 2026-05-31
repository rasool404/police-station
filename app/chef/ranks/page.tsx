import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { deleteRank } from "@/app/actions/rank";
import { NewRankForm } from "./NewRankForm";

export default async function ChefRanksPage() {
  await requireRole("chef");
  const supabase = await createClient();

  const { data: ranks, error } = await supabase
    .from("rank")
    .select("rank_id, title, level, officer:officer(officer_id)")
    .order("level");

  if (error) return <div className="notice">{error.message}</div>;

  return (
    <>
      <div className="page-head">
        <h1>Ranks</h1>
      </div>

      <div className="grid-asym">
        <div className="dossier" style={{ padding: 0 }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--ink)", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <h3 style={{ margin: 0 }}>Existing ranks</h3>
            <span className="mono muted" style={{ fontSize: 11 }}>{ranks?.length ?? 0} records</span>
          </div>
          <table className="ledger">
            <thead>
              <tr>
                <th>Rank No.</th>
                <th>Title</th>
                <th>Level</th>
                <th>In use by</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {ranks?.map((r: any) => {
                const inUse = r.officer?.length ?? 0;
                return (
                  <tr key={r.rank_id}>
                    <td className="id">{r.rank_id}</td>
                    <td>{r.title}</td>
                    <td className="mono">L{r.level}</td>
                    <td className="mono">{inUse}</td>
                    <td>
                      <form action={async () => { "use server"; await deleteRank(r.rank_id); }}>
                        <button
                          type="submit"
                          className="secondary"
                          disabled={inUse > 0}
                          title={inUse > 0 ? "Reassign these officers first" : "Delete this rank"}
                          style={{ padding: "6px 12px", fontSize: 10 }}
                        >
                          Delete
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
              {!ranks?.length && (
                <tr><td colSpan={5} className="empty">No ranks defined.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="dossier" style={{ padding: 24 }}>
          <h3 style={{ margin: "0 0 14px" }}>Add rank</h3>
          <NewRankForm />
        </div>
      </div>
    </>
  );
}
