"use server";
import { db } from "@/db"; import { factions } from "@/db/schema"; import { requireAdmin } from "./helpers"; import { eq } from "drizzle-orm"; import { redirect } from "next/navigation";
const emptyDoc = { type: "doc", content: [{ type: "paragraph" }] };
function slugify(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
export async function saveFaction(formData: FormData) {
  const user = await requireAdmin();
  const name = String(formData.get("name") || "").trim();
  if (!name) throw new Error("Name is required");
  const id = String(formData.get("id") || "");
  const imageUrl = String(formData.get("imageUrl") || "") || null;
  let body = emptyDoc;
  const raw = String(formData.get("body") || "");
  if (raw) { try { body = JSON.parse(raw); } catch { body = emptyDoc; } }
  const slug = `${slugify(name)}-${id ? "" : Date.now()}`.replace(/-$/, "");
  if (id) {
    await db.update(factions).set({ name, imageUrl, body }).where(eq(factions.id, id));
    const faction = await db.query.factions.findFirst({ where: eq(factions.id, id) });
    redirect(`/factions/${faction!.slug}`);
  }
  const [faction] = await db.insert(factions).values({ name, slug, imageUrl, body, createdBy: user.id }).returning();
  redirect(`/factions/${faction.slug}`);
}
export async function deleteFaction(id: string) {
  await requireAdmin();
  await db.delete(factions).where(eq(factions.id, id));
  redirect("/factions");
}
