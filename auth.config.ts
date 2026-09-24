import type { NextAuthConfig } from "next-auth";

// Pages that render read-only content and must stay visible to signed-out
// visitors. Writing (posting, uploading, signing up, editing notes) always
// happens through server actions that call currentUser()/requireAdmin()
// themselves, so those stay protected even though the page around them is
// public. Anything not matched here falls through to "signed-in required".
const PUBLIC_EXACT_PATHS = new Set<string>(["/", "/missions", "/intel", "/roster", "/scans"]);

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT_PATHS.has(pathname)) return true;

  // /intel/[slug] is public, but /intel/new (create/edit form) is not.
  if (pathname === "/intel/new") return false;
  if (pathname.startsWith("/intel/")) return true;

  // /events/[slug] is public, but /events/new and the "write your writeup"
  // form at /events/[slug]/respond require an account.
  if (pathname === "/events/new") return false;
  if (/^\/events\/[^/]+\/respond$/.test(pathname)) return false;
  if (pathname.startsWith("/events/")) return true;

  // /roster/[userId] pilot profiles are public.
  if (pathname.startsWith("/roster/")) return true;

  // /scans/[id] scan detail pages are public.
  if (pathname.startsWith("/scans/")) return true;

  return false;
}

export default {
  providers: [],
  pages: { signIn: "/signin" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isSignedIn = !!auth?.user;
      const isSignInPage = nextUrl.pathname === "/signin";
      if (isSignInPage) return true;
      if (isPublicPath(nextUrl.pathname)) return true;
      return isSignedIn;
    },
  },
} satisfies NextAuthConfig;
