import Link from "next/link"; import { logout } from "@/app/actions/auth";
export function Header({ username, admin }: { username: string; admin: boolean }) {
  return (
    <header className="relative flex h-24 items-center bg-surface-translucent">
      <div className="z-[1] flex h-full items-center gap-4 bg-primary pl-6 pr-10">
        <Link href="/" className="font-display text-2xl font-extrabold uppercase tracking-[0.15em] text-void">
          2 Lancer 2 Furious
        </Link>
      </div>
      <div className="rhombus-accent -ml-8 h-full w-10" aria-hidden="true" />
      <nav className="ml-auto flex items-center gap-6 pr-6 font-eyebrow text-xs font-bold uppercase tracking-[0.15em] text-text-mid">
        <Link href="/profile" className="hover:text-white">{username}</Link>
        {admin && (
          <>
            <Link href="/events/new" className="hover:text-white">New mission</Link>
            <Link href="/admin/members" className="hover:text-white">Members</Link>
          </>
        )}
        <form action={logout}>
          <button className="bg-transparent px-0 py-0 font-eyebrow text-xs font-bold uppercase tracking-[0.15em] text-text-mid hover:bg-transparent hover:text-white">
            Sign out
          </button>
        </form>
      </nav>
    </header>
  );
}
