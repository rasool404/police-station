import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AppRole = "citizen" | "officer" | "chef";

export const SESSION_COOKIE = "session_user_id";

export type CurrentUser = {
  userId: string;
  username: string;
  role: AppRole;
  personId: string | null;
  officerId: string | null;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!userId) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_account")
    .select("user_id, username, role, person_id, officer_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;

  return {
    userId: data.user_id,
    username: data.username,
    role: data.role as AppRole,
    personId: data.person_id ?? null,
    officerId: data.officer_id ?? null,
  };
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(
  allowed: AppRole | AppRole[],
): Promise<CurrentUser> {
  const user = await requireUser();
  const allowedList = Array.isArray(allowed) ? allowed : [allowed];
  if (!allowedList.includes(user.role)) redirect("/");
  return user;
}
