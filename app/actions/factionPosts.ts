"use server";
import { db } from "@/db"; import { factionPosts } from "@/db/schema"; import { requireAdmin } from "./helpers"; import { eq } from "drizzle-orm"; import { redirect } from "next/navigation";
const emptyDoc = { type: "doc", content: [{ type: "paragraph" }] };
function slugify(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
export async function saveFactionPost(formData: FormData) {
  const user = await requireAdmin();
  const title = String(formData.get("title") || "").trim();
  if (!title) throw new Error("Title is required");
  const id = String(formData.get("id") || "");
  let body = emptyDoc;
  const raw = String(formData.get("body") || "");
  if (raw) { try { body = JSON.parse(raw); } catch { body = emptyDoc; } }
  const slug = `${slugify(title)}-${id ? "" : Date.now()}`.replace(/-$/, "");
  if (id) {
    await db.update(factionPosts).set({ title, body }).where(eq(factionPosts.id, id));
    const post = await db.query.factionPosts.findFirst({ where: eq(factionPosts.id, id) });
    redirect(`/factions/${post!.slug}`);
  }
  const [post] = await db.insert(factionPosts).values({ title, slug, body, createdBy: user.id }).returning();
  redirect(`/factions/${post.slug}`);
}
export async function deleteFactionPost(id: string) {
  await requireAdmin();
  await db.delete(factionPosts).where(eq(factionPosts.id, id));
  redirect("/factions");
}
