import { requireAdmin } from "@/app/actions/helpers"; import { saveFactionPost } from "@/app/actions/factionPosts"; import { RichTextEditor } from "@/components/RichTextEditor"; import { db } from "@/db"; import { factionPosts } from "@/db/schema"; import { eq } from "drizzle-orm"; import { notFound } from "next/navigation";
export default async function NewFactionPost({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  await requireAdmin();
  const id = (await searchParams).id;
  const post = id ? await db.query.factionPosts.findFirst({ where: eq(factionPosts.id, id) }) : null;
  if (id && !post) notFound();
  return (
    <>
      <h1 className="text-3xl font-bold">{post ? "Edit faction post" : "New faction post"}</h1>
      <form action={saveFactionPost} className="mt-6 space-y-4">
        {post && <input type="hidden" name="id" value={post.id} />}
        <label>Title<input name="title" required defaultValue={post?.title} /></label>
        <label>Details<RichTextEditor name="body" defaultValue={post?.body as object} /></label>
        <button>{post ? "Save changes" : "Post"}</button>
      </form>
    </>
  );
}
