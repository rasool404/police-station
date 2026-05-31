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
  if (!user.personId) return { error: "Account is not linked to a person record." };

  const description = String(formData.get("description") ?? "").trim();
  if (description.length < 10) {
    return { error: "Please describe the incident in at least 10 characters." };
  }

  const supabase = await createClient();

  // Pick any officer to receive the report — in a real system this would
  // route by district. For this project we just grab the first one.
  // Citizens can't read the officer table directly (RLS), so we use an
  // RPC-style approach: call from server which still operates under the
  // user's JWT. Instead we let the database default the assignment by
  // leaving officer_id nullable? No — schema requires it. So we expose
  // a SECURITY DEFINER function… for simplicity here, the route hands
  // off to a server-side query that uses a known officer ID from env or
  // a deterministic pick. We'll allow RLS by also permitting officers
  // to be selected by citizens for now via a dedicated view; simplest
  // fix: a SECURITY DEFINER RPC.
  const { data: receivingOfficer, error: pickErr } = await supabase
    .rpc("pick_receiving_officer");

  if (pickErr || !receivingOfficer) {
    return { error: "No officer available to receive the report. Try again later." };
  }

  const { error } = await supabase.from("complaint").insert({
    complaint_id:   newId("CMP"),
    complainant_id: user.personId,
    officer_id:     receivingOfficer as string,
    description,
    status:         "open",
  });

  if (error) return { error: error.message };

  revalidatePath("/report/mine");
  revalidatePath("/");
  redirect("/report/mine");
}
