import { notFound } from "next/navigation"; import { db } from "@/db"; import { factionPosts, factionResponses } from "@/db/schema"; import { and, eq } from "drizzle-orm"; import { currentUser } from "@/app/actions/helpers"; import { saveFactionResponse } from "@/app/actions/factionResponses"; import { RichTextEditor } from "@/components/RichTextEditor";
export default async function RespondToFaction({ params }: { params: Promise<{ slug: string }> }) {
  const user = await currentUser();
  const slug = (await params).slug;
  const post = await db.query.factionPosts.findFirst({ where: eq(factionPosts.slug, slug) });
  if (!post) notFound();
  const response = await db.query.factionResponses.findFirst({ where: and(eq(factionResponses.postId, post.id), eq(factionResponses.authorId, user.id)) });
  return (
    <>
      <h1 className="text-3xl font-bold">Your response</h1>
      <form action={saveFactionResponse} className="mt-6 space-y-4">
        <input type="hidden" name="postId" value={post.id} />
        <input type="hidden" name="slug" value={slug} />
        <label>Posted as<input name="byline" defaultValue={response?.byline || user.username || ""} maxLength={60} /></label>
        <label>Response<RichTextEditor name="body" defaultValue={response?.body as object} /></label>
        <button>{response ? "Update response" : "Post response"}</button>
      </form>
    </>
  );
}
