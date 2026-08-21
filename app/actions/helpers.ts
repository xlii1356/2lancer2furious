import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
export async function currentUser() { const session = await auth(); if (!session?.user?.id) redirect("/signin"); const user = await db.query.users.findFirst({ where: eq(users.id, session.user.id) }); if (!user) redirect("/signin"); return user; }
export async function requireAdmin() { const user = await currentUser(); if (user.role !== "admin") throw new Error("Not authorized"); return user; }
