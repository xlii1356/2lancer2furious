import Link from "next/link"; import Image from "next/image"; import { logout } from "@/app/actions/auth";
export function Header({ username, admin }: { username: string; admin: boolean }) {
  return (
    <header className="relative flex h-24 items-center bg-surface-translucent">
      <div className="z-[1] flex h-full items-center gap-4 bg-primary pl-6 pr-10">
        <Image src="/faction-logos/silvershard_outline.webp" alt="" width={56} height={80} className="h-20 w-auto" />
        <div className="flex flex-col justify-center">
          <span className="font-display text-2xl font-extrabold uppercase leading-none tracking-[0.15em] text-void">
            FiCo Corp
          </span>
          <span className="font-eyebrow text-xs font-bold uppercase tracking-[0.1em] text-void/70">
            Mission Briefing Terminal
          </span>
        </div>
      </div>
      <div className="rhombus-accent -ml-8 h-full w-10" aria-hidden="true" />

      <div className="ml-auto flex h-full items-end gap-6 px-6 py-2 text-text-hi">
        <div className="flex flex-col items-end border-l border-separator pl-4">
          <h4 className="m-0 font-eyebrow text-[10px] font-bold uppercase tracking-[3px] text-text-mid">Callsign</h4>
          <span className="font-display text-lg font-extrabold uppercase tracking-[0.1em]">{username}</span>
        </div>
        {admin && (
          <div className="flex flex-col items-end border-l border-separator pl-4">
            <h4 className="m-0 font-eyebrow text-[10px] font-bold uppercase tracking-[3px] text-text-mid">Clearance</h4>
            <span className="font-display text-lg font-extrabold uppercase tracking-[0.1em] text-primary">Admin</span>
          </div>
        )}
        {admin && (
          <Link href="/events/new" className="border-l border-separator pl-4 font-eyebrow text-xs font-bold uppercase tracking-[0.15em] text-text-mid hover:text-white">
            New mission
          </Link>
        )}
        <form action={logout} className="border-l border-separator pl-4">
          <button className="bg-transparent px-0 py-0 font-eyebrow text-xs font-bold uppercase tracking-[0.15em] text-text-mid hover:bg-transparent hover:text-white">
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
