"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

const CASE_STATUSES = ["open", "investigating", "closed"] as const;
const COMPLAINT_STATUSES = ["open", "under_review", "converted", "rejected"] as const;

type CaseStatus = (typeof CASE_STATUSES)[number];
type ComplaintStatus = (typeof COMPLAINT_STATUSES)[number];

export async function updateCaseStatus(formData: FormData) {
  await requireRole(["officer", "chef"]);

  const caseId = String(formData.get("case_id") ?? "");
  const status = String(formData.get("status")  ?? "") as CaseStatus;

  if (!caseId) throw new Error("Case is required.");
  if (!CASE_STATUSES.includes(status)) throw new Error("Invalid status.");

  // Auto-set / clear closed_date based on the new status.
  const patch: Record<string, unknown> = { status };
  if (status === "closed") {
    patch.closed_date = new Date().toISOString().slice(0, 10);
  } else if (status === "open" || status === "investigating") {
    patch.closed_date = null;
  }

  const supabase = await createClient();
  const { error } = await supabase.from("case").update(patch).eq("case_id", caseId);
  if (error) throw new Error(error.message);

  revalidatePath(`/cases/${caseId}`);
  revalidatePath("/cases");
  revalidatePath("/");
}

export async function updateComplaintStatus(formData: FormData) {
  await requireRole(["officer", "chef"]);

  const complaintId = String(formData.get("complaint_id") ?? "");
  const status      = String(formData.get("status")       ?? "") as ComplaintStatus;

  if (!complaintId) throw new Error("Complaint is required.");
  if (!COMPLAINT_STATUSES.includes(status)) throw new Error("Invalid status.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("complaint")
    .update({ status })
    .eq("complaint_id", complaintId);
  if (error) throw new Error(error.message);

  revalidatePath(`/complaints/${complaintId}`);
  revalidatePath("/complaints");
  revalidatePath("/");
}
