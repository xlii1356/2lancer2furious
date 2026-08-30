import Link from "next/link"; import { notFound } from "next/navigation"; import { db } from "@/db"; import { factionPosts, factionResponses, users } from "@/db/schema"; import { eq } from "drizzle-orm"; import { currentUser } from "@/app/actions/helpers"; import { deleteFactionPost } from "@/app/actions/factionPosts"; import { TiptapRenderer } from "@/components/TiptapRenderer"; import { Avatar } from "@/components/Avatar"; import { DeleteButton } from "@/components/DeleteButton";
export default async function FactionPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await currentUser();
  const slug = (await params).slug;
  const post = await db.query.factionPosts.findFirst({ where: eq(factionPosts.slug, slug) });
  if (!post) notFound();
  const entries = await db.select({ response: factionResponses, user: users }).from(factionResponses).innerJoin(users, eq(users.id, factionResponses.authorId)).where(eq(factionResponses.postId, post.id));
  const isAdmin = user.role === "admin";
  return (
    <article>
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-3xl font-bold text-text-hi">{post.title}</h1>
        {isAdmin && <div className="flex shrink-0 gap-2"><Link className="button" href={`/factions/new?id=${post.id}`}>Edit</Link><DeleteButton action={deleteFactionPost.bind(null, post.id)} label="post" /></div>}
      </div>
      <div className="prose-content mt-8 text-text-hi"><TiptapRenderer document={post.body as never} /></div>
      <Link className="button mt-8 inline-block" href={`/factions/${slug}/respond`}>
        {entries.some(({ response }) => response.authorId === user.id) ? "Edit your response" : "Write your response"}
      </Link>
      <section className="mt-10 space-y-8">
        {entries.map(({ response, user: author }) => (
          <div key={response.id} className="border-t border-separator pt-6">
            <div className="mb-3 flex items-center gap-3">
              <Avatar id={author.id} url={author.avatarUrl} name={author.username} />
              <div>
                <strong className="text-text-hi">{response.byline || author.username || author.name}</strong>
                <div className="text-sm text-text-mid">{response.updatedAt.toLocaleDateString()}</div>
              </div>
            </div>
            <div className="prose-content text-text-hi"><TiptapRenderer document={response.body as never} /></div>
          </div>
        ))}
      </section>
    </article>
  );
}
