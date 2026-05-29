"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

export async function createComplaint(formData: FormData) {
  const complainantId = String(formData.get("complainant_id"));
  const officerId     = String(formData.get("officer_id"));
  const description   = String(formData.get("description") ?? "");

  if (!complainantId || !officerId) {
    throw new Error("complainant and officer are required");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("complaint").insert({
    complaint_id:   newId("CMP"),
    complainant_id: complainantId,
    officer_id:     officerId,
    description,
    status:         "open",
  });

  if (error) throw new Error(error.message);

  revalidatePath("/complaints");
  revalidatePath("/");
  redirect("/complaints");
}
