"use server";
import { signIn, signOut } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { hash } from "bcryptjs";
import { redirect } from "next/navigation";
export async function login(formData: FormData) { await signIn("credentials", { email: String(formData.get("email") || ""), password: String(formData.get("password") || ""), redirectTo: "/" }); }
export async function registerPassword(formData: FormData) { const email = String(formData.get("email") || "").trim().toLowerCase(); const password = String(formData.get("password") || ""); const username = String(formData.get("username") || "").trim(); if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 6) throw new Error("Use a valid email and a password of at least 6 characters."); if (!/^[A-Za-z0-9 _.-]{2,24}$/.test(username)) throw new Error("Callsigns must be 2–24 characters and use letters, numbers, spaces, _, -, or ."); const existingName = await db.execute(sql`select id from users where lower(username) = lower(${username})`); if (existingName.rows.length) throw new Error("That callsign is already taken."); const passwordHash = await hash(password, 12); const created = await db.insert(users).values({ email, username, passwordHash }).onConflictDoNothing().returning({ id: users.id }); if (!created.length) throw new Error("An account with that email already exists. Sign in instead."); redirect("/signin"); }
export async function logout() { await signOut({ redirectTo: "/signin" }); }
