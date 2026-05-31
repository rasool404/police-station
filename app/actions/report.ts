"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

export type ReportState = { error: string } | null;

export async function fileReport(
  _prev: ReportState,
  formData: FormData,
): Promise<ReportState> {
  const user = await requireRole("citizen");
  if (!user.personId) {
    return { error: "Account is not linked to a person record." };
  }

  const description = String(formData.get("description") ?? "").trim();
  if (description.length < 10) {
    return { error: "Please describe the incident in at least 10 characters." };
  }

  const supabase = await createClient();

  // Pick the first officer by badge number to receive the report.
  // A real system would route by district / case load.
  const { data: receivingOfficer, error: pickErr } = await supabase
    .from("officer")
    .select("officer_id")
    .order("badge_number")
    .limit(1)
    .maybeSingle();

  if (pickErr || !receivingOfficer) {
    return { error: "No officer available to receive the report." };
  }

  const { error } = await supabase.from("complaint").insert({
    complaint_id:   newId("CMP"),
    complainant_id: user.personId,
    officer_id:     receivingOfficer.officer_id,
    description,
    status:         "open",
  });

  if (error) return { error: error.message };

  revalidatePath("/report/mine");
  revalidatePath("/");
  redirect("/report/mine");
}
