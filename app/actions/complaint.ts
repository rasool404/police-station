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
  const title         = String(formData.get("title")       ?? "").trim();
  const description   = String(formData.get("description") ?? "").trim();

  if (!complainantId || !officerId) throw new Error("Complainant and officer are required.");
  if (title.length < 3)             throw new Error("Title must be at least 3 characters.");

  const supabase = await createClient();
  const { error } = await supabase.from("complaint").insert({
    complaint_id:   newId("CMP"),
    complainant_id: complainantId,
    officer_id:     officerId,
    title,
    description,
    status:         "open",
  });

  if (error) throw new Error(error.message);

  revalidatePath("/complaints");
  revalidatePath("/");
  redirect("/complaints");
}
