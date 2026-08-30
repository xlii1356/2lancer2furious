import Link from "next/link"; import Image from "next/image"; import { notFound } from "next/navigation"; import { db } from "@/db"; import { factions } from "@/db/schema"; import { eq } from "drizzle-orm"; import { currentUser } from "@/app/actions/helpers"; import { deleteFaction } from "@/app/actions/factions"; import { TiptapRenderer } from "@/components/TiptapRenderer"; import { DeleteButton } from "@/components/DeleteButton";
export default async function FactionPage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await currentUser();
  const slug = (await params).slug;
  const faction = await db.query.factions.findFirst({ where: eq(factions.slug, slug) });
  if (!faction) notFound();
  const isAdmin = user.role === "admin";
  return (
    <article>
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-3xl font-bold text-text-hi">{faction.name}</h1>
        {isAdmin && <div className="flex shrink-0 gap-2"><Link className="button" href={`/factions/new?id=${faction.id}`}>Edit</Link><DeleteButton action={deleteFaction.bind(null, faction.id)} label="faction" /></div>}
      </div>
      {faction.imageUrl && (
        <Image src={faction.imageUrl} alt={faction.name} width={320} height={320} className="mt-6 w-full max-w-xs border border-separator object-cover" unoptimized />
      )}
      <div className="prose-content mt-8 text-text-hi"><TiptapRenderer document={faction.body as never} /></div>
    </article>
  );
}
