import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { deleteRank } from "@/app/actions/rank";
import { NewRankForm } from "./NewRankForm";

export default async function AdminRanksPage() {
  await requireRole("admin");
  const supabase = await createClient();

  const { data: ranks, error } = await supabase
    .from("rank")
    .select("rank_id, title, level, officer:officer(officer_id)")
    .order("level");

  if (error) return <div className="error">{error.message}</div>;

  return (
    <>
      <h1>Manage ranks</h1>
      <p className="muted">
        Ranks define the hierarchy of officers. Higher <code>level</code> =
        higher seniority. A rank that is still assigned to an officer cannot
        be deleted (foreign key restriction).
      </p>

      <h2>Existing ranks</h2>
      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Level</th>
              <th>Officers holding it</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {ranks?.map((r: any) => {
              const officerCount = r.officer?.length ?? 0;
              return (
                <tr key={r.rank_id}>
                  <td className="muted">{r.rank_id}</td>
                  <td>{r.title}</td>
                  <td>{r.level}</td>
                  <td>{officerCount}</td>
                  <td>
                    <form
                      action={async () => {
                        "use server";
                        await deleteRank(r.rank_id);
                      }}
                    >
                      <button
                        type="submit"
                        className="secondary"
                        disabled={officerCount > 0}
                        title={
                          officerCount > 0
                            ? "Reassign these officers first"
                            : "Delete this rank"
                        }
                      >
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
            {!ranks?.length && (
              <tr><td colSpan={5} className="empty">No ranks</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <h2>Add a new rank</h2>
      <NewRankForm />
    </>
  );
}
