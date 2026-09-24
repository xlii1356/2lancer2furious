import NextAuth from "next-auth";
import authConfig from "@/auth.config";
export const { auth: middleware } = NextAuth(authConfig);
// All /api routes are excluded here and instead enforce auth themselves
// (see each route handler / server action) — this lets public GET endpoints
// like /api/image-scale (used to render intel/pilot images) work for
// signed-out visitors without opening up the write endpoints, which already
// check the session internally.
//
// Static files under /public (sidebar icons, faction art/logos, videos,
// audio, etc.) are also excluded by extension — they're plain assets with
// no sensitive data, and gating them made the sidebar icons (and any other
// public-facing images) 404/redirect to /signin instead of loading.
// NOTE: Next.js statically parses this matcher at build time, so it must be
// a literal array of string literals — no template strings or variables.
export const config = {
  matcher: [
    "/((?!signin|api|_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpe?g|gif|webp|avif|ico|webm|ogg|mp3|mp4|txt|css|js|map|woff2?|ttf)$).*)",
  ],
};
