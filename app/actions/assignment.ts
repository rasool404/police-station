"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

export async function assignOfficer(formData: FormData) {
  await requireRole(["officer", "chef"]);

  const caseId    = String(formData.get("case_id")    ?? "");
  const officerId = String(formData.get("officer_id") ?? "");
  const role      = String(formData.get("role")       ?? "").trim() || null;

  if (!caseId || !officerId) throw new Error("Case and officer are required.");

  const supabase = await createClient();
  const { error } = await supabase.from("case_assignment").insert({
    case_id:    caseId,
    officer_id: officerId,
    role,
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/cases/${caseId}`);
}

export async function unassignOfficer(formData: FormData) {
  await requireRole(["officer", "chef"]);

  const caseId    = String(formData.get("case_id")    ?? "");
  const officerId = String(formData.get("officer_id") ?? "");

  if (!caseId || !officerId) throw new Error("Case and officer are required.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("case_assignment")
    .delete()
    .eq("case_id", caseId)
    .eq("officer_id", officerId);
  if (error) throw new Error(error.message);

  revalidatePath(`/cases/${caseId}`);
}
