"use server";
import { db } from "@/db"; import { users } from "@/db/schema"; import { currentUser } from "./helpers"; import { eq, isNull } from "drizzle-orm"; import { pilotSheets } from "@/db/schema"; import { generateAvatarFor } from "@/lib/autoAvatar"; import { revalidatePath } from "next/cache";

export async function setAvatarUrl(formData: FormData) {
  const user = await currentUser();
  const targetUserId = String(formData.get("userId") || user.id);
  if (targetUserId !== user.id && user.role !== "admin") throw new Error("Not authorized to set this pilot's avatar");
  const avatarUrl = String(formData.get("avatarUrl") || "").trim();
  if (!avatarUrl) throw new Error("No cropped image provided");
  await db.update(users).set({ avatarUrl }).where(eq(users.id, targetUserId));
  revalidatePath(`/roster/${targetUserId}`);
  revalidatePath("/roster");
  revalidatePath("/");
}

// Builds (or rebuilds) one pilot's avatar from their pilot art.
export async function autoGenerateAvatar(formData: FormData) {
  const user = await currentUser();
  const targetUserId = String(formData.get("userId") || user.id);
  if (targetUserId !== user.id && user.role !== "admin") throw new Error("Not authorized to set this pilot's avatar");
  const result = await generateAvatarFor(targetUserId, { force: true });
  if (result === "failed") throw new Error("Couldn't build an avatar from that pilot art — the image may be unreachable or not a supported format. Try uploading the art as a Pilot art override first.");
  if (result === "skipped") throw new Error("This pilot has no pilot art yet");
  revalidatePath(`/roster/${targetUserId}`);
  revalidatePath("/roster");
  revalidatePath("/");
}

// Admin backfill: makes avatars for pilots who have art but no avatar yet (up to 10 per click).
export async function generateMissingAvatars() {
  const user = await currentUser();
  if (user.role !== "admin") throw new Error("Admins only");
  const missing = await db
    .select({ id: users.id })
    .from(users)
    .innerJoin(pilotSheets, eq(pilotSheets.userId, users.id))
    .where(isNull(users.avatarUrl))
    .limit(10);
  await Promise.allSettled(missing.map((m) => generateAvatarFor(m.id)));
  revalidatePath("/roster");
  revalidatePath("/");
}
