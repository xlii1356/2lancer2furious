import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { intelEntries, intelNotes, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { currentUser } from "@/app/actions/helpers";
import { deleteIntelEntry } from "@/app/actions/intel";
import { saveIntelNotes } from "@/app/actions/intelNotes";
import { TiptapRenderer } from "@/components/TiptapRenderer";
import { RichTextEditor } from "@/components/RichTextEditor";
import { NotesToggle } from "@/components/NotesToggle";
import { DeleteButton } from "@/components/DeleteButton";

const emptyDoc = { type: "doc", content: [{ type: "paragraph" }] };

export default async function IntelEntryPage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await currentUser();
  const slug = (await params).slug;
  const entry = await db.query.intelEntries.findFirst({ where: eq(intelEntries.slug, slug) });
  if (!entry) notFound();
  const isAdmin = user.role === "admin";

  const notesRow = await db.select({ note: intelNotes, editor: users }).from(intelNotes).leftJoin(users, eq(users.id, intelNotes.updatedBy)).where(eq(intelNotes.entryId, entry.id)).then((r) => r[0]);

  return (
    <article>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">{entry.category}</p>
          <h1 className="mt-1 text-3xl font-bold text-text-hi">{entry.name}</h1>
        </div>
        {isAdmin && <div className="flex shrink-0 gap-2"><Link className="button" href={`/intel/new?id=${entry.id}`}>Edit</Link><DeleteButton action={deleteIntelEntry.bind(null, entry.id)} label="intel entry" /></div>}
      </div>

      <div className="mt-6 flex flex-col items-start gap-6 sm:flex-row">
        {entry.imageUrl && (
          <Image
            src={entry.imageUrl}
            alt={entry.name}
            width={240}
            height={240}
            className="w-48 shrink-0 border border-separator object-cover sm:w-60"
            unoptimized
          />
        )}
        <div className="prose-content min-w-0 flex-1 text-text-hi">
          <TiptapRenderer document={entry.body as never} />
        </div>
      </div>

      <section className="mt-10 border-t border-separator pt-6">
        <h2 className="font-display text-xl font-bold uppercase tracking-wide text-text-hi">Notes</h2>
        {notesRow?.note.updatedBy && (
          <p className="mt-1 text-xs text-text-mid">
            Last edited by {notesRow.editor?.username || notesRow.editor?.name} · {notesRow.note.updatedAt.toLocaleString()}
          </p>
        )}
        <NotesToggle
          readView={
            notesRow ? (
              <div className="prose-content text-text-hi">
                <TiptapRenderer document={notesRow.note.body as never} />
              </div>
            ) : (
              <p className="text-text-mid">No notes yet — click the pencil to add some.</p>
            )
          }
          editView={
            <div className="border border-separator bg-void p-4">
              <p className="text-xs text-text-mid">Shared notes any pilot can add to or edit.</p>
              <form action={saveIntelNotes} className="mt-3 space-y-3">
                <input type="hidden" name="entryId" value={entry.id} />
                <input type="hidden" name="slug" value={slug} />
                <RichTextEditor name="body" defaultValue={(notesRow?.note.body as object) || emptyDoc} />
                <button className="w-full">Save notes</button>
              </form>
            </div>
          }
        />
      </section>
    </article>
  );
}