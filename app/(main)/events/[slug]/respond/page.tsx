import { notFound } from "next/navigation"; import { db } from "@/db"; import { events, responses } from "@/db/schema"; import { and, eq } from "drizzle-orm"; import { currentUser } from "@/app/actions/helpers"; import { saveResponse } from "@/app/actions/responses"; import { RichTextEditor } from "@/components/RichTextEditor";
export default async function Respond({ params }: { params: Promise<{ slug: string }> }) {
  const user = await currentUser();
  const slug = (await params).slug;
  const event = await db.query.events.findFirst({ where: eq(events.slug, slug) });
  if (!event) notFound();
  const response = await db.query.responses.findFirst({ where: and(eq(responses.eventId, event.id), eq(responses.authorId, user.id)) });
  return (
    <>
      <h1 className="text-3xl font-bold">Your writeup</h1>
      <form action={saveResponse} className="mt-6 space-y-4">
        <input type="hidden" name="eventId" value={event.id} />
        <input type="hidden" name="slug" value={slug} />
        <label>Posted as<input name="byline" defaultValue={response?.byline || user.username || ""} maxLength={60} /></label>
        <label>Writeup<RichTextEditor name="body" defaultValue={response?.body as object} /></label>
        <button>{response ? "Update writeup" : "Post writeup"}</button>
      </form>
    </>
  );
}
