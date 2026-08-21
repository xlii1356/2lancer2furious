"use server";
import { signIn, signOut } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hash } from "bcryptjs";
import { redirect } from "next/navigation";
export async function login(formData: FormData) { await signIn("credentials", { email: String(formData.get("email") || ""), password: String(formData.get("password") || ""), redirectTo: "/" }); }
export async function registerPassword(formData: FormData) { const email = String(formData.get("email") || "").trim().toLowerCase(); const password = String(formData.get("password") || ""); if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 12) throw new Error("Use a valid email and a password of at least 12 characters."); const passwordHash = await hash(password, 12); await db.insert(users).values({ email, passwordHash }).onConflictDoUpdate({ target: users.email, set: { passwordHash } }); redirect("/signin"); }
export async function logout() { await signOut({ redirectTo: "/signin" }); }
