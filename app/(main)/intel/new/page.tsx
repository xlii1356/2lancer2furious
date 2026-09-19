import { requireAdmin } from "@/app/actions/helpers"; import { saveIntelEntry } from "@/app/actions/intel"; import { RichTextEditor } from "@/components/RichTextEditor"; import { ImageUpload } from "@/components/ImageUpload"; import { db } from "@/db"; import { intelEntries } from "@/db/schema"; import { eq } from "drizzle-orm"; import { notFound } from "next/navigation";

const SUGGESTED_CATEGORIES = ["Location", "Contact", "Population", "Organization", "Event", "Person"];

export default async function NewIntelEntry({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  await requireAdmin();
  const id = (await searchParams).id;
  const entry = id ? await db.query.intelEntries.findFirst({ where: eq(intelEntries.id, id) }) : null;
  if (id && !entry) notFound();
  return (
    <>
      <h1 className="text-3xl font-bold">{entry ? "Edit intel entry" : "New intel entry"}</h1>
      <form action={saveIntelEntry} className="mt-6 space-y-4">
        {entry && <input type="hidden" name="id" value={entry.id} />}
        <label>Name<input name="name" required defaultValue={entry?.name} /></label>
        <label>
          Category
          <input name="category" list="intel-categories" required defaultValue={entry?.category} placeholder="Location, Contact, Faction..." />
          <datalist id="intel-categories">
            {SUGGESTED_CATEGORIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>
        <label>Picture<ImageUpload name="imageUrl" defaultValue={entry?.imageUrl} /></label>
        <div>Write-up<RichTextEditor name="body" defaultValue={entry?.body as object} /></div>
        <button>{entry ? "Save changes" : "Post"}</button>
      </form>
    </>
  );
}
