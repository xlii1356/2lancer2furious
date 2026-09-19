import { db } from "@/db"; import { briefing } from "@/db/schema"; import { currentUser } from "@/app/actions/helpers"; import { saveBriefing } from "@/app/actions/briefing"; import { TiptapRenderer } from "@/components/TiptapRenderer"; import { RichTextEditor } from "@/components/RichTextEditor"; import { NotesToggle } from "@/components/NotesToggle";

const emptyDoc = { type: "doc", content: [{ type: "paragraph" }] };

export default async function HomePage() {
  const user = await currentUser();
  const isAdmin = user.role === "admin";

  const row = await db.select().from(briefing).then((r) => r[0]);

  return (
    <article className="border border-separator bg-void">
      <div className="border-b border-separator px-5 py-3">
        <p className="font-mono text-xs text-primary">&gt; WELCOME, {(user.username || "READER").toUpperCase()}</p>
        <p className="mt-1 font-mono text-xs text-text-mid">&gt; BRIEFING FEED :: LIVE</p>
      </div>

      <div className="p-5">
        {isAdmin ? (
          <NotesToggle
            readView={
              row ? (
                <div className="prose-content text-text-hi">
                  <TiptapRenderer document={row.body as never} />
                </div>
              ) : (
                <p className="text-text-mid">No briefing posted yet — click the pencil to write one.</p>
              )
            }
            editView={
              <div className="border border-separator bg-surface p-4">
                <form action={saveBriefing} className="space-y-3">
                  <RichTextEditor name="body" defaultValue={(row?.body as object) || emptyDoc} />
                  <button className="w-full">Save briefing</button>
                </form>
              </div>
            }
          />
        ) : row ? (
          <div className="prose-content text-text-hi">
            <TiptapRenderer document={row.body as never} />
          </div>
        ) : (
          <p className="text-text-mid">No briefing posted yet.</p>
        )}
      </div>
    </article>
  );
}
