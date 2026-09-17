"use server";
import { db } from "@/db"; import { intelNotes } from "@/db/schema"; import { currentUser } from "./helpers"; import { revalidatePath } from "next/cache";

export async function saveIntelNotes(formData: FormData) {
  const user = await currentUser();
  const entryId = String(formData.get("entryId"));
  const slug = String(formData.get("slug"));
  const raw = String(formData.get("body") || "");
  let body: object = { type: "doc", content: [{ type: "paragraph" }] };
  if (raw) { try { body = JSON.parse(raw); } catch { /* keep empty doc */ } }

  await db
    .insert(intelNotes)
    .values({ entryId, body, updatedBy: user.id })
    .onConflictDoUpdate({ target: intelNotes.entryId, set: { body, updatedBy: user.id, updatedAt: new Date() } });

  revalidatePath(`/intel/${slug}`);
}
