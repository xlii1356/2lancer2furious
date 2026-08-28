import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, accounts, sessions, verificationTokens } from "@/db/schema";
import authConfig from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: { strategy: "jwt" },
  providers: [Credentials({ name: "Email and password", credentials: { email: {}, password: {} }, async authorize(credentials) { const email = String(credentials.email || "").trim().toLowerCase(); const password = String(credentials.password || ""); const user = await db.query.users.findFirst({ where: eq(users.email, email) }); if (!user?.passwordHash || !(await compare(password, user.passwordHash))) return null; return { id: user.id, email: user.email, name: user.name }; } })],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        const record = await db.query.users.findFirst({ where: eq(users.id, user.id as string) });
        token.role = record?.role ?? "member";
        token.username = record?.username ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      session.user.username = token.username as string | null;
      return session;
    },
  },
  pages: { signIn: "/signin" }
});
