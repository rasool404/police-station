"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

export type RankFormState = { error: string } | null;

export async function createRank(
  _prev: RankFormState,
  formData: FormData,
): Promise<RankFormState> {
  await requireRole("admin");

  const rankId = String(formData.get("rank_id") ?? "").trim();
  const title  = String(formData.get("title")   ?? "").trim();
  const level  = Number(formData.get("level"));

  if (!rankId || !title) return { error: "Rank ID and title are required." };
  if (!Number.isInteger(level) || level < 1) {
    return { error: "Level must be a positive integer." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("rank").insert({
    rank_id: rankId,
    title,
    level,
  });
  if (error) return { error: error.message };

  revalidatePath("/admin/ranks");
  return null;
}

export async function deleteRank(rankId: string) {
  await requireRole("admin");
  const supabase = await createClient();
  const { error } = await supabase.from("rank").delete().eq("rank_id", rankId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/ranks");
}
