import { db } from "@/db"; import { briefing, users } from "@/db/schema"; import { eq } from "drizzle-orm"; import { currentUser } from "@/app/actions/helpers"; import { saveBriefing } from "@/app/actions/briefing"; import { TiptapRenderer } from "@/components/TiptapRenderer"; import { RichTextEditor } from "@/components/RichTextEditor"; import { NotesToggle } from "@/components/NotesToggle";

const emptyDoc = { type: "doc", content: [{ type: "paragraph" }] };

export default async function HomePage() {
  const user = await currentUser();
  const isAdmin = user.role === "admin";

  const row = await db.select({ post: briefing, editor: users }).from(briefing).leftJoin(users, eq(users.id, briefing.updatedBy)).then((r) => r[0]);

  return (
    <article>
      <p className="eyebrow">Briefing</p>
      <h1 className="mt-1 text-3xl font-bold text-text-hi">Home</h1>
      {row?.post.updatedBy && (
        <p className="mt-1 text-xs text-text-mid">
          Last edited by {row.editor?.username || row.editor?.name} · {row.post.updatedAt.toLocaleString()}
        </p>
      )}

      {isAdmin ? (
        <NotesToggle
          readView={
            row ? (
              <div className="prose-content text-text-hi">
                <TiptapRenderer document={row.post.body as never} />
              </div>
            ) : (
              <p className="text-text-mid">No briefing posted yet — click the pencil to write one.</p>
            )
          }
          editView={
            <div className="border border-separator bg-void p-4">
              <form action={saveBriefing} className="space-y-3">
                <RichTextEditor name="body" defaultValue={(row?.post.body as object) || emptyDoc} />
                <button className="w-full">Save briefing</button>
              </form>
            </div>
          }
        />
      ) : row ? (
        <div className="prose-content mt-6 text-text-hi">
          <TiptapRenderer document={row.post.body as never} />
        </div>
      ) : (
        <p className="mt-6 text-text-mid">No briefing posted yet.</p>
      )}
    </article>
  );
}
