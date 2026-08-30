"use server";
import { db } from "@/db"; import { factionResponses } from "@/db/schema"; import { eq } from "drizzle-orm"; import { currentUser } from "./helpers"; import { revalidatePath } from "next/cache"; import { redirect } from "next/navigation";
export async function saveFactionResponse(formData: FormData) {
  const user = await currentUser();
  const postId = String(formData.get("postId"));
  const slug = String(formData.get("slug"));
  const byline = String(formData.get("byline") || "").trim().slice(0, 60) || null;
  const body = JSON.parse(String(formData.get("body")));
  await db.insert(factionResponses).values({ postId, authorId: user.id, byline, body }).onConflictDoUpdate({ target: [factionResponses.postId, factionResponses.authorId], set: { byline, body, updatedAt: new Date() } });
  revalidatePath(`/factions/${slug}`);
  redirect(`/factions/${slug}`);
}
export async function deleteFactionResponse(id: string, slug: string) {
  const user = await currentUser();
  const response = await db.query.factionResponses.findFirst({ where: eq(factionResponses.id, id) });
  if (!response || (response.authorId !== user.id && user.role !== "admin")) throw new Error("Not authorized");
  await db.delete(factionResponses).where(eq(factionResponses.id, id));
  revalidatePath(`/factions/${slug}`);
}
