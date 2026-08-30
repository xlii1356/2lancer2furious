import Link from "next/link"; import Image from "next/image"; import { db } from "@/db"; import { factions } from "@/db/schema"; import { desc } from "drizzle-orm"; import { currentUser } from "@/app/actions/helpers";
export default async function FactionsPage() {
  const user = await currentUser();
  const list = await db.select().from(factions).orderBy(desc(factions.createdAt));
  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Factions</h1>
        {user.role === "admin" && <Link className="button" href="/factions/new">New faction</Link>}
      </div>
      <div className="mt-6 divide-y divide-separator border border-separator bg-surface">
        {list.map((faction) => (
          <Link key={faction.id} href={`/factions/${faction.slug}`} className="flex items-center gap-4 p-5 text-text-hi no-underline hover:bg-white/5">
            {faction.imageUrl ? (
              <Image src={faction.imageUrl} alt="" width={56} height={56} className="h-14 w-14 shrink-0 border border-separator object-cover" unoptimized />
            ) : (
              <div className="h-14 w-14 shrink-0 border border-separator bg-void" />
            )}
            <h2 className="font-semibold text-text-hi">{faction.name}</h2>
          </Link>
        ))}
        {!list.length && <p className="p-5 text-text-mid">No factions posted yet.</p>}
      </div>
    </>
  );
}
