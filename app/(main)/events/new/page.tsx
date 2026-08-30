import { requireAdmin } from "@/app/actions/helpers"; import { saveEvent } from "@/app/actions/events"; import { RichTextEditor } from "@/components/RichTextEditor"; import { db } from "@/db"; import { events } from "@/db/schema"; import { eq } from "drizzle-orm"; import { notFound } from "next/navigation";
export default async function NewEvent({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  await requireAdmin();
  const id = (await searchParams).id;
  const event = id ? await db.query.events.findFirst({ where: eq(events.id, id) }) : null;
  if (id && !event) notFound();
  return (
    <>
      <h1 className="text-3xl font-bold">{event ? "Edit mission" : "New mission"}</h1>
      <form action={saveEvent} className="mt-6 space-y-4">
        {event && <input type="hidden" name="id" value={event.id} />}
        <label>Title<input name="title" required defaultValue={event?.title} /></label>
        <label>Description<RichTextEditor name="body" defaultValue={event?.body as object} /></label>
        <label>Date<input name="eventDate" type="date" defaultValue={event?.eventDate || ""} /></label>
        <label>Slots <input name="slotCount" type="number" min="1" defaultValue={event?.slotCount ?? ""} /></label>
        <button>{event ? "Save changes" : "Create mission"}</button>
      </form>
    </>
  );
}
