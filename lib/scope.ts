import { createClient } from "@/lib/supabase/server";
import type { CurrentUser } from "@/lib/auth";

/**
 * Scope helpers. Convention:
 *   return null  → unrestricted (chef sees everything)
 *   return []    → user has no access
 *   return [a,b] → restrict to these IDs
 */

async function getMyOfficer(
  user: CurrentUser,
): Promise<{ department_id: string | null; station_id: string | null } | null> {
  if (user.role !== "officer" || !user.officerId) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("officer")
    .select("department_id, station_id")
    .eq("officer_id", user.officerId)
    .maybeSingle();
  return data ?? null;
}

/** Officer IDs in the user's department — used for the /officers list. */
export async function departmentOfficerIds(
  user: CurrentUser,
): Promise<string[] | null> {
  if (user.role === "chef") return null;
  if (user.role !== "officer") return [];
  if (!user.officerId) return [];

  const me = await getMyOfficer(user);
  if (!me?.department_id) return [user.officerId];

  const supabase = await createClient();
  const { data: dept } = await supabase
    .from("officer")
    .select("officer_id")
    .eq("department_id", me.department_id);

  const ids = (dept ?? []).map((o) => o.officer_id);
  if (!ids.includes(user.officerId)) ids.push(user.officerId);
  return ids;
}

/** Officer IDs in the user's station — used for the complaint scope. */
export async function stationOfficerIds(
  user: CurrentUser,
): Promise<string[] | null> {
  if (user.role === "chef") return null;
  if (user.role !== "officer") return [];
  if (!user.officerId) return [];

  const me = await getMyOfficer(user);
  if (!me?.station_id) return [user.officerId];

  const supabase = await createClient();
  const { data: station } = await supabase
    .from("officer")
    .select("officer_id")
    .eq("station_id", me.station_id);

  const ids = (station ?? []).map((o) => o.officer_id);
  if (!ids.includes(user.officerId)) ids.push(user.officerId);
  return ids;
}

/** Complaint scope = officers at the same station. */
export const visibleComplaintOfficerIds = stationOfficerIds;

/** Departments the user can see — own dept only for officer, all for chef. */
export async function visibleDepartmentIds(
  user: CurrentUser,
): Promise<string[] | null> {
  if (user.role === "chef") return null;
  if (user.role !== "officer") return [];
  const me = await getMyOfficer(user);
  return me?.department_id ? [me.department_id] : [];
}

/** Case IDs the user is personally involved in — lead or assigned. */
export async function visibleCaseIds(
  user: CurrentUser,
): Promise<string[] | null> {
  if (user.role === "chef") return null;
  if (user.role !== "officer") return [];
  if (!user.officerId) return [];

  const supabase = await createClient();
  const [{ data: lead }, { data: assigned }] = await Promise.all([
    supabase.from("case").select("case_id").eq("lead_officer_id", user.officerId),
    supabase.from("case_assignment").select("case_id").eq("officer_id", user.officerId),
  ]);

  const ids = new Set<string>();
  (lead ?? []).forEach((c: any) => ids.add(c.case_id));
  (assigned ?? []).forEach((c: any) => ids.add(c.case_id));
  return [...ids];
}
