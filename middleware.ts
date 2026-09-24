import NextAuth from "next-auth";
import authConfig from "@/auth.config";
export const { auth: middleware } = NextAuth(authConfig);
// All /api routes are excluded here and instead enforce auth themselves
// (see each route handler / server action) — this lets public GET endpoints
// like /api/image-scale (used to render intel/pilot images) work for
// signed-out visitors without opening up the write endpoints, which already
// check the session internally.
export const config = { matcher: ["/((?!signin|api|_next/static|_next/image|favicon.ico).*)"] };
