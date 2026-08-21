import { db } from "./index";
import { allowedEmails, users } from "./schema";
import { eq } from "drizzle-orm";
async function main() { const email = process.env.ADMIN_EMAIL?.trim().toLowerCase(); if (!email) throw new Error("ADMIN_EMAIL is required"); await db.insert(allowedEmails).values({ email }).onConflictDoNothing(); await db.insert(users).values({ email, role: "admin" }).onConflictDoUpdate({ target: users.email, set: { role: "admin" } }); }
main().then(() => process.exit(0)).catch((error) => { console.error(error); process.exit(1); });
