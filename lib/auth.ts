import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AppRole = "citizen" | "officer" | "admin";

export type CurrentUser = {
  userId: string;
  email: string | null;
  role: AppRole;
  personId: string | null;
  officerId: string | null;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile, error } = await supabase
    .from("app_user")
    .select("role, person_id, officer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !profile) return null;

  return {
    userId: user.id,
    email: user.email ?? null,
    role: profile.role as AppRole,
    personId: profile.person_id ?? null,
    officerId: profile.officer_id ?? null,
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
