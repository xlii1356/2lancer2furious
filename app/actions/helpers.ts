import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
export async function currentUser() { const session = await auth(); if (!session?.user?.id) redirect("/signin"); const user = await db.query.users.findFirst({ where: eq(users.id, session.user.id) }); if (!user) redirect("/signin"); return user; }

// Like currentUser(), but for pages that are readable while signed out. Returns
// null instead of redirecting so pages can render public/read-only content and
// only gate the write affordances (forms, uploads, edit buttons) on the result.
export async function getOptionalUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await db.query.users.findFirst({ where: eq(users.id, session.user.id) });
  return user ?? null;
}
export async function requireAdmin() { const user = await currentUser(); if (user.role !== "admin") throw new Error("Not authorized"); return user; }
