"use server";
import { db } from "@/db"; import { allowedEmails } from "@/db/schema"; import { requireAdmin } from "./helpers"; import { eq } from "drizzle-orm"; import { revalidatePath } from "next/cache";
export async function addMember(formData: FormData) { await requireAdmin(); const email = String(formData.get("email") || "").trim().toLowerCase(); if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("Enter a valid email address"); await db.insert(allowedEmails).values({ email }).onConflictDoNothing(); revalidatePath("/admin/members"); }
export async function removeMember(email: string) { await requireAdmin(); await db.delete(allowedEmails).where(eq(allowedEmails.email, email)); revalidatePath("/admin/members"); }
