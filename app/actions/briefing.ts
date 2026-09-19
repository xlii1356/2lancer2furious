"use server";
import { db } from "@/db"; import { briefing } from "@/db/schema"; import { requireAdmin } from "./helpers"; import { eq } from "drizzle-orm"; import { revalidatePath } from "next/cache";

export async function saveBriefing(formData: FormData) {
  const user = await requireAdmin();
  const raw = String(formData.get("body") || "");
  let body: object = { type: "doc", content: [{ type: "paragraph" }] };
  if (raw) { try { body = JSON.parse(raw); } catch { /* keep empty doc */ } }

  const existing = await db.query.briefing.findFirst();
  if (existing) {
    await db.update(briefing).set({ body, updatedBy: user.id, updatedAt: new Date() }).where(eq(briefing.id, existing.id));
  } else {
    await db.insert(briefing).values({ body, updatedBy: user.id });
  }
  revalidatePath("/");
}
