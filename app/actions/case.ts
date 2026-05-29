"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

export async function createCase(formData: FormData) {
  const complaintId   = String(formData.get("complaint_id"));
  const crimeTypeId   = String(formData.get("crime_type_id"));
  const leadOfficerId = String(formData.get("lead_officer_id"));

  if (!complaintId || !crimeTypeId || !leadOfficerId) {
    throw new Error("complaint, crime type and lead officer are required");
  }

  const supabase = await createClient();
  const caseId = newId("CSE");

  const { error: caseErr } = await supabase.from("case").insert({
    case_id:         caseId,
    complaint_id:    complaintId,
    crime_type_id:   crimeTypeId,
    lead_officer_id: leadOfficerId,
    status:          "open",
  });
  if (caseErr) throw new Error(caseErr.message);

  // Auto-assign the lead officer.
  const { error: assignErr } = await supabase.from("case_assignment").insert({
    case_id:    caseId,
    officer_id: leadOfficerId,
    role:       "lead",
  });
  if (assignErr) throw new Error(assignErr.message);

  // Mark the complaint as converted.
  const { error: updErr } = await supabase
    .from("complaint")
    .update({ status: "converted" })
    .eq("complaint_id", complaintId);
  if (updErr) throw new Error(updErr.message);

  revalidatePath("/cases");
  revalidatePath("/complaints");
  revalidatePath("/");
  redirect(`/cases/${caseId}`);
}
