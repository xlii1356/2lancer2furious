import Link from "next/link"; import { db } from "@/db"; import { factionPosts, factionResponses } from "@/db/schema"; import { desc, eq, sql } from "drizzle-orm";
export default async function FactionsPage() {
  const list = await db.select({ post: factionPosts, responseCount: sql<number>`count(${factionResponses.id})::int` }).from(factionPosts).leftJoin(factionResponses, eq(factionResponses.postId, factionPosts.id)).groupBy(factionPosts.id).orderBy(desc(factionPosts.createdAt));
  return (
    <>
      <h1 className="text-3xl font-bold">Factions</h1>
      <div className="mt-6 divide-y divide-separator border border-separator bg-surface">
        {list.map(({ post, responseCount }) => (
          <Link key={post.id} href={`/factions/${post.slug}`} className="block p-5 text-text-hi no-underline hover:bg-white/5">
            <h2 className="font-semibold text-text-hi">{post.title}</h2>
            <p className="mt-1 text-sm text-text-mid">{responseCount} response{responseCount === 1 ? "" : "s"}</p>
          </Link>
        ))}
        {!list.length && <p className="p-5 text-text-mid">No faction intel posted yet.</p>}
      </div>
    </>
  );
}
