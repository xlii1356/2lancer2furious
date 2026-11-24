import { put } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { pilotSheets, users } from "@/db/schema";
import { fetchImageBuffer, makeAvatarBuffer } from "./avatarImage";

export type AvatarResult = "generated" | "skipped" | "failed";

// Builds a site avatar from a pilot's art (their override if set, otherwise the imported URL).
// Without `force`, it leaves any existing avatar alone.
export async function generateAvatarFor(userId: string, { force = false } = {}): Promise<AvatarResult> {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) return "failed";
  if (user.avatarUrl && !force) return "skipped";
  const sheet = await db.query.pilotSheets.findFirst({ where: eq(pilotSheets.userId, userId) });
  const source = sheet?.portraitOverrideUrl || sheet?.portraitUrl;
  if (!source) return "skipped";
  try {
    const avatar = await makeAvatarBuffer(await fetchImageBuffer(source));
    const blob = await put(`avatars/${userId}.jpg`, avatar, { access: "public", contentType: "image/jpeg", addRandomSuffix: true });
    await db.update(users).set({ avatarUrl: blob.url }).where(eq(users.id, userId));
    return "generated";
  } catch (err) {
    console.error("Auto avatar failed for", userId, err);
    return "failed";
  }
}
