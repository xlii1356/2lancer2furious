import type { NextAuthConfig } from "next-auth";

export default {
  providers: [],
  pages: { signIn: "/signin" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isSignedIn = !!auth?.user;
      const isSignInPage = nextUrl.pathname === "/signin";
      if (isSignInPage) return true;
      return isSignedIn;
    },
  },
} satisfies NextAuthConfig;
