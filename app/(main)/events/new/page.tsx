import { requireAdmin } from "@/app/actions/helpers"; import { saveEvent } from "@/app/actions/events";
export default async function NewEvent() {
  await requireAdmin();
  return (
    <>
      <h1 className="text-3xl font-bold">New mission</h1>
      <form action={saveEvent} className="mt-6 space-y-4">
        <label>Title<input name="title" required /></label>
        <label>Description<textarea name="description" rows={6} placeholder="Briefing details, objectives, meeting point..." /></label>
        <label>Date<input name="eventDate" type="date" /></label>
        <label>Slots <input name="slotCount" type="number" min="1" /></label>
        <button>Create mission</button>
      </form>
    </>
  );
}
