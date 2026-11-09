import Link from "next/link"; import Image from "next/image"; import { db } from "@/db"; import { intelEntries } from "@/db/schema"; import { desc } from "drizzle-orm"; import { getOptionalUser } from "@/app/actions/helpers";

export default async function IntelPage() {
  const user = await getOptionalUser();
  const list = await db.select().from(intelEntries).orderBy(desc(intelEntries.createdAt));

  const groups = new Map<string, typeof list>();
  for (const entry of list) {
    const arr = groups.get(entry.category) || [];
    arr.push(entry);
    groups.set(entry.category, arr);
  }
  const sortedGroups = [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([category, entries]) => [category, [...entries].sort((a, b) => a.name.localeCompare(b.name))] as const);

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Intel</h1>
        {user?.role === "admin" && <Link className="button" href="/intel/new">New entry</Link>}
      </div>

      {!list.length && <p className="mt-6 text-text-mid">No intel entries posted yet.</p>}

      {[...sortedGroups].map(([category, entries]) => (
        <section key={category} className="mt-8">
          <p className="eyebrow">{category}</p>
          <div className="mt-2 divide-y divide-separator border border-separator bg-surface">
            {entries.map((entry) => (
              <Link key={entry.id} href={`/intel/${entry.slug}`} className="flex items-center gap-4 p-5 text-text-hi no-underline hover:bg-white/5">
                {entry.imageUrl ? (
                  <Image src={entry.imageUrl} alt="" width={56} height={56} className="h-14 w-14 shrink-0 border border-separator object-cover" unoptimized />
                ) : (
                  <div className="h-14 w-14 shrink-0 border border-separator bg-void" />
                )}
                <h2 className="font-semibold text-text-hi">{entry.name}</h2>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
