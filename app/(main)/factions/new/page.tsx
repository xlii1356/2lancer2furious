import { requireAdmin } from "@/app/actions/helpers"; import { saveFaction } from "@/app/actions/factions"; import { RichTextEditor } from "@/components/RichTextEditor"; import { ImageUpload } from "@/components/ImageUpload"; import { db } from "@/db"; import { factions } from "@/db/schema"; import { eq } from "drizzle-orm"; import { notFound } from "next/navigation";
export default async function NewFaction({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  await requireAdmin();
  const id = (await searchParams).id;
  const faction = id ? await db.query.factions.findFirst({ where: eq(factions.id, id) }) : null;
  if (id && !faction) notFound();
  return (
    <>
      <h1 className="text-3xl font-bold">{faction ? "Edit faction" : "New faction"}</h1>
      <form action={saveFaction} className="mt-6 space-y-4">
        {faction && <input type="hidden" name="id" value={faction.id} />}
        <label>Name<input name="name" required defaultValue={faction?.name} /></label>
        <label>Picture<ImageUpload name="imageUrl" defaultValue={faction?.imageUrl} /></label>
        <label>Description<RichTextEditor name="body" defaultValue={faction?.body as object} /></label>
        <button>{faction ? "Save changes" : "Post"}</button>
      </form>
    </>
  );
}
