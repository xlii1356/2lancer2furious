"use server";
import { db } from "@/db"; import { intelEntries } from "@/db/schema"; import { requireAdmin } from "./helpers"; import { eq } from "drizzle-orm"; import { redirect } from "next/navigation"; import { revalidatePath } from "next/cache";
const emptyDoc = { type: "doc", content: [{ type: "paragraph" }] };
function slugify(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }

export async function saveIntelEntry(formData: FormData) {
  const user = await requireAdmin();
  const name = String(formData.get("name") || "").trim();
  if (!name) throw new Error("Name is required");
  const category = String(formData.get("category") || "").trim() || "Other";
  const id = String(formData.get("id") || "");
  const imageUrl = String(formData.get("imageUrl") || "") || null;
  let body = emptyDoc;
  const raw = String(formData.get("body") || "");
  if (raw) { try { body = JSON.parse(raw); } catch { body = emptyDoc; } }
  const hidden = formData.get("hidden") === "on";
  const slug = `${slugify(name)}-${id ? "" : Date.now()}`.replace(/-$/, "");
  if (id) {
    await db.update(intelEntries).set({ name, category, imageUrl, body, hidden }).where(eq(intelEntries.id, id));
    const entry = await db.query.intelEntries.findFirst({ where: eq(intelEntries.id, id) });
    redirect(`/intel/${entry!.slug}`);
  }
  const [entry] = await db.insert(intelEntries).values({ name, category, slug, imageUrl, body, hidden, createdBy: user.id }).returning();
  redirect(`/intel/${entry.slug}`);
}

export async function deleteIntelEntry(id: string) {
  await requireAdmin();
  await db.delete(intelEntries).where(eq(intelEntries.id, id));
  redirect("/intel");
}

export async function setIntelHidden(id: string, hidden: boolean) {
  await requireAdmin();
  await db.update(intelEntries).set({ hidden }).where(eq(intelEntries.id, id));
  revalidatePath("/intel");
  revalidatePath("/intel/[slug]", "page");
}
