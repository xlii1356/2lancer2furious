import "next-auth";
declare module "next-auth" { interface Session { user: { id: string; role: "admin" | "member"; username: string | null } & NonNullable<Session["user"]> } }
