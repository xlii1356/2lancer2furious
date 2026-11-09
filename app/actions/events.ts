"use server";
import { db } from "@/db"; import { events, signups, pilotSheets } from "@/db/schema"; import { requireAdmin } from "./helpers"; import { eq, inArray, sql } from "drizzle-orm"; import { redirect } from "next/navigation";
const emptyDoc = { type: "doc", content: [{ type: "paragraph" }] };
function slugify(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

// Makes the event's "required" signups match the chosen pilots: pre-slots new ones,
// flags pilots who had already claimed a slot, and frees the slot of anyone un-marked.
async function syncRequiredPilots(tx: Tx, eventId: string, slotCount: number | null, requiredIds: string[]) {
  const existing = await tx.select().from(signups).where(eq(signups.eventId, eventId));
  const wanted = new Set(requiredIds);
  const toRemove = existing.filter((s) => s.required && !wanted.has(s.userId));
  const toFlag = existing.filter((s) => !s.required && wanted.has(s.userId));
  const haveIds = new Set(existing.map((s) => s.userId));
  const toAdd = requiredIds.filter((uid) => !haveIds.has(uid));
  const total = existing.length - toRemove.length + toAdd.length;
  if (slotCount && total > slotCount) throw new Error("Not enough open slots for the required pilots — raise the slot count or remove someone first");
  if (toRemove.length) await tx.delete(signups).where(inArray(signups.id, toRemove.map((s) => s.id)));
  if (toFlag.length) await tx.update(signups).set({ required: true }).where(inArray(signups.id, toFlag.map((s) => s.id)));
  if (toAdd.length) await tx.insert(signups).values(toAdd.map((userId) => ({ eventId, userId, required: true })));
}

export async function saveEvent(formData: FormData) {
  const user = await requireAdmin();
  const title = String(formData.get("title") || "").trim();
  if (!title) throw new Error("Title is required");
  const id = String(formData.get("id") || "");
  const slotRaw = String(formData.get("slotCount") || "").trim();
  const slotCount = slotRaw ? Number(slotRaw) : null;
  if (slotCount !== null && (!Number.isInteger(slotCount) || slotCount < 1)) throw new Error("Slots must be a positive number");
  let body = emptyDoc;
  const raw = String(formData.get("body") || "");
  if (raw) { try { body = JSON.parse(raw); } catch { body = emptyDoc; } }
  const eventDates = formData.getAll("eventDates").map((d) => String(d).trim()).filter(Boolean);

  const requiredIds = [...new Set(formData.getAll("requiredPilots").map((v) => String(v)).filter(Boolean))];
  if (requiredIds.length) {
    if (!slotCount) throw new Error("Set a slot count to pre-slot required pilots");
    if (requiredIds.length > slotCount) throw new Error(`${requiredIds.length} required pilots won't fit in ${slotCount} slots`);
    const onRoster = await db.select({ userId: pilotSheets.userId }).from(pilotSheets).where(inArray(pilotSheets.userId, requiredIds));
    if (onRoster.length !== requiredIds.length) throw new Error("Required pilots must be on the pilot roster");
  }

  const slug = await db.transaction(async (tx) => {
    let event;
    if (id) {
      await tx.execute(sql`SELECT 1 FROM events WHERE id = ${id} FOR UPDATE`);
      await tx.update(events).set({ title, body, eventDates, slotCount }).where(eq(events.id, id));
      event = await tx.query.events.findFirst({ where: eq(events.id, id) });
      if (!event) throw new Error("Mission not found");
    } else {
      const values = { title, slug: `${slugify(title)}-${Date.now()}`, body, eventDates, slotCount };
      [event] = await tx.insert(events).values({ ...values, createdBy: user.id }).returning();
    }
    await syncRequiredPilots(tx, event.id, slotCount, requiredIds);
    return event.slug;
  });
  redirect(`/events/${slug}`);
}
export async function deleteEvent(id: string) { await requireAdmin(); await db.delete(events).where(eq(events.id, id)); redirect("/missions"); }
