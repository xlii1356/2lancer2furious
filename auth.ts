import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { allowedEmails, users } from "@/db/schema";
import authConfig from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db),
  providers: [Resend({ apiKey: process.env.RESEND_API_KEY, from: process.env.EMAIL_FROM })],
  callbacks: {
    async signIn({ user }) { const email = user.email?.toLowerCase(); return !!email && !!(await db.query.allowedEmails.findFirst({ where: eq(allowedEmails.email, email) })); },
    async session({ session, user }) { session.user.id = user.id; const record = await db.query.users.findFirst({ where: eq(users.id, user.id) }); session.user.role = record?.role ?? "member"; session.user.username = record?.username ?? null; return session; }
  },
  pages: { signIn: "/signin" }
});
