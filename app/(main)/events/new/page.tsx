import { requireAdmin } from "@/app/actions/helpers"; import { saveEvent } from "@/app/actions/events"; import { RichTextEditor } from "@/components/RichTextEditor"; import { DateListInput } from "@/components/DateListInput"; import { db } from "@/db"; import { events, pilotSheets, signups, users } from "@/db/schema"; import { and, asc, eq } from "drizzle-orm"; import { notFound } from "next/navigation";
export default async function NewEvent({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  await requireAdmin();
  const id = (await searchParams).id;
  const event = id ? await db.query.events.findFirst({ where: eq(events.id, id) }) : null;
  if (id && !event) notFound();
  const roster = await db.select({ userId: users.id, username: users.username, callsign: pilotSheets.callsign, name: pilotSheets.name }).from(pilotSheets).innerJoin(users, eq(users.id, pilotSheets.userId)).orderBy(asc(pilotSheets.callsign));
  const requiredNow = event ? await db.select({ userId: signups.userId }).from(signups).where(and(eq(signups.eventId, event.id), eq(signups.required, true))) : [];
  const requiredIds = new Set(requiredNow.map((r) => r.userId));
  return (
    <>
      <h1 className="text-3xl font-bold">{event ? "Edit mission" : "New mission"}</h1>
      <form action={saveEvent} className="mt-6 space-y-4">
        {event && <input type="hidden" name="id" value={event.id} />}
        <label>Title<input name="title" required defaultValue={event?.title} /></label>
        <div>Description<RichTextEditor name="body" defaultValue={event?.body as object} /></div>
        <label>Dates <span className="text-xs text-text-mid">(optional, add as many as needed)</span><DateListInput name="eventDates" defaultValue={event?.eventDates as string[] | undefined} /></label>
        <label>Slots <input name="slotCount" type="number" min="1" defaultValue={event?.slotCount ?? ""} /></label>
        <fieldset className="border border-separator bg-surface p-4">
          <legend className="px-2 text-sm font-bold uppercase tracking-widest text-text-hi">Required pilots <span className="text-xs font-normal normal-case tracking-normal text-text-mid">(optional)</span></legend>
          <p className="text-xs text-text-mid">Checked pilots are pre-slotted into this mission and can&apos;t release their slot. Needs a slot count above. Unchecking a pilot frees their slot.</p>
          {roster.length ? (
            <div className="mt-3 max-h-64 space-y-1 overflow-y-auto pr-2">
              {roster.map((p) => (
                <label key={p.userId} className="flex cursor-pointer items-center gap-3 px-2 py-1.5 text-text-hi hover:bg-white/5">
                  <input type="checkbox" name="requiredPilots" value={p.userId} defaultChecked={requiredIds.has(p.userId)} className="!w-4 !p-0 h-4 shrink-0 accent-[#c0403c]" />
                  <span className="font-semibold">{p.callsign || p.name || p.username}</span>
                  {p.callsign && p.username && <span className="text-sm text-text-mid">{p.username}</span>}
                </label>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-text-mid">No pilots on the roster yet.</p>
          )}
        </fieldset>
        <button>{event ? "Save changes" : "Create mission"}</button>
      </form>
    </>
  );
}
