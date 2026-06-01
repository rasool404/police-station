"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

export type OfficerFormState = { ok: true } | { error: string } | null;

export async function updateOfficerAssignment(
  _prev: OfficerFormState,
  formData: FormData,
): Promise<OfficerFormState> {
  const user = await getCurrentUser();
  if (!user)            return { error: "You are not signed in." };
  if (user.role !== "chef") return { error: "Only the chief can reassign officers." };

  const officerId    = String(formData.get("officer_id")    ?? "");
  const rankId       = String(formData.get("rank_id")       ?? "");
  const stationId    = String(formData.get("station_id")    ?? "");
  const departmentId = String(formData.get("department_id") ?? "");

  if (!officerId) return { error: "Officer is required." };
  if (!stationId) return { error: "Please select a station." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("officer")
    .update({
      rank_id:       rankId       || null,
      station_id:    stationId,
      department_id: departmentId || null,
    })
    .eq("officer_id", officerId);
  if (error) return { error: error.message };

  revalidatePath(`/officers/${officerId}`);
  revalidatePath("/officers");
  return { ok: true };
}
