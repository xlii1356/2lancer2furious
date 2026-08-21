import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import authConfig from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db),
  providers: [Credentials({ name: "Email and password", credentials: { email: {}, password: {} }, async authorize(credentials) { const email = String(credentials.email || "").trim().toLowerCase(); const password = String(credentials.password || ""); const user = await db.query.users.findFirst({ where: eq(users.email, email) }); if (!user?.passwordHash || !(await compare(password, user.passwordHash))) return null; return { id: user.id, email: user.email, name: user.name }; } })],
  callbacks: {
    async session({ session, user }) { session.user.id = user.id; const record = await db.query.users.findFirst({ where: eq(users.id, user.id) }); session.user.role = record?.role ?? "member"; session.user.username = record?.username ?? null; return session; }
  },
  pages: { signIn: "/signin" }
});
