"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";

const EVIDENCE_BUCKET = "complaint-evidence";

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

  const title       = String(formData.get("title")       ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const evidence    = formData.get("evidence");

  if (title.length < 3)        return { error: "Please give your report a short title (at least 3 characters)." };
  if (description.length < 10) return { error: "Please describe the incident in at least 10 characters." };

  const supabase = await createClient();

  // Pick the first officer by badge number to receive the report.
  const { data: receivingOfficer, error: pickErr } = await supabase
    .from("officer")
    .select("officer_id")
    .order("badge_number")
    .limit(1)
    .maybeSingle();

  if (pickErr || !receivingOfficer) {
    return { error: "No officer available to receive the report." };
  }

  let evidenceUrl: string | null = null;
  if (evidence instanceof File && evidence.size > 0) {
    const ext = evidence.name.includes(".")
      ? evidence.name.split(".").pop()!.toLowerCase()
      : "bin";
    const path = `${user.userId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase
      .storage
      .from(EVIDENCE_BUCKET)
      .upload(path, evidence, { contentType: evidence.type || undefined });
    if (upErr) return { error: `Evidence upload failed: ${upErr.message}` };
    evidenceUrl = supabase.storage.from(EVIDENCE_BUCKET).getPublicUrl(path).data.publicUrl;
  }

  const { error } = await supabase.from("complaint").insert({
    complaint_id:   newId("CMP"),
    complainant_id: user.personId,
    officer_id:     receivingOfficer.officer_id,
    title,
    description,
    evidence_url:   evidenceUrl,
    status:         "open",
  });

  if (error) return { error: error.message };

  revalidatePath("/report/mine");
  revalidatePath("/");
  redirect("/report/mine");
}
