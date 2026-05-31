"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SESSION_COOKIE } from "@/lib/auth";

export type AuthState = { error: string } | null;

export async function signIn(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "Username and password are required." };
  }

  const supabase = await createClient();
  const { data: account, error } = await supabase
    .from("user_account")
    .select("user_id, password")
    .eq("username", username)
    .maybeSingle();

  if (error)         return { error: error.message };
  if (!account)      return { error: "Invalid username or password." };
  if (account.password !== password) {
    return { error: "Invalid username or password." };
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, account.user_id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    // 7 days
    maxAge: 60 * 60 * 24 * 7,
  });

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  revalidatePath("/", "layout");
  redirect("/login");
}
