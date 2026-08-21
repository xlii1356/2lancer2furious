"use server";
import { signIn, signOut } from "@/auth";
export async function requestMagicLink(formData: FormData) { await signIn("resend", { email: String(formData.get("email") || ""), redirectTo: "/" }); }
export async function logout() { await signOut({ redirectTo: "/signin" }); }
