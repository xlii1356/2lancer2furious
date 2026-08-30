"use server";
import { db } from "@/db"; import { events } from "@/db/schema"; import { requireAdmin } from "./helpers"; import { eq } from "drizzle-orm"; import { redirect } from "next/navigation";
const emptyDoc = { type: "doc", content: [{ type: "paragraph" }] };
function textToDoc(text: string) {
  const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  if (!paragraphs.length) return emptyDoc;
  return { type: "doc", content: paragraphs.map((p) => ({ type: "paragraph", content: [{ type: "text", text: p }] })) };
}
function slugify(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
export async function saveEvent(formData: FormData) { const user = await requireAdmin(); const title = String(formData.get("title") || "").trim(); if (!title) throw new Error("Title is required"); const id = String(formData.get("id") || ""); const slotRaw = String(formData.get("slotCount") || "").trim(); const slotCount = slotRaw ? Number(slotRaw) : null; if (slotCount !== null && (!Number.isInteger(slotCount) || slotCount < 1)) throw new Error("Slots must be a positive number"); const description = String(formData.get("description") || ""); const body = textToDoc(description); const values = { title, slug: `${slugify(title)}-${id ? "" : Date.now()}`.replace(/-$/, ""), body, eventDate: String(formData.get("eventDate") || "") || null, slotCount }; if (id) { await db.update(events).set({ title, body, eventDate: values.eventDate, slotCount }).where(eq(events.id, id)); const event = await db.query.events.findFirst({ where: eq(events.id, id) }); redirect(`/events/${event!.slug}`); } const [event] = await db.insert(events).values({ ...values, createdBy: user.id }).returning(); redirect(`/events/${event.slug}`); }
export async function deleteEvent(id: string) { await requireAdmin(); await db.delete(events).where(eq(events.id, id)); redirect("/"); }
