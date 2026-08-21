import NextAuth from "next-auth";
import authConfig from "@/auth.config";
export const { auth: middleware } = NextAuth(authConfig);
export const config = { matcher: ["/((?!signin|api/auth|_next/static|_next/image|favicon.ico).*)"] };
