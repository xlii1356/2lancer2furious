"use server";
import { db } from "@/db"; import { users } from "@/db/schema"; import { currentUser } from "./helpers"; import { eq } from "drizzle-orm"; import { revalidatePath } from "next/cache";

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
