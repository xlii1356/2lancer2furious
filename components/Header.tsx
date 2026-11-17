import Link from "next/link"; import { logout } from "@/app/actions/auth";
export function Header({ username, admin, loggedIn }: { username: string | null; admin: boolean; loggedIn: boolean }) {
  return (
    <header className="relative z-50 flex h-24 items-center border-b border-[#ff6b61]/70 bg-void/60 backdrop-blur-sm">
      {/* Chamfered outline: top line over the title, stepping down to a mid line across the rest */}
      <svg className="pointer-events-none absolute left-0 top-0 hidden md:block" width="560" height="96" viewBox="0 0 560 96" fill="none" aria-hidden="true">
        <path d="M0 1H470L506 41H560" stroke="#ff6b61" strokeOpacity="0.8" />
      </svg>
      <div className="pointer-events-none absolute left-[560px] right-0 top-[41px] hidden border-t border-[#ff6b61]/70 md:block" aria-hidden="true" />
      <div className="z-[1] flex h-full items-center gap-4 pl-6 pr-10">
        <img src="/FiCo_Corps_Crest.webp" alt="FiCo Corps crest" className="h-[4.5rem] w-[4.5rem] shrink-0 object-contain" />
        <div className="flex flex-col justify-center">
          <span className="font-display text-3xl font-extrabold uppercase leading-none tracking-[0.3em] text-[#ffe3df]" style={{ textShadow: "0 0 14px rgba(255,90,80,0.6)" }}>
            FiCo Corps
          </span>
          <span className="mt-1 font-eyebrow text-xs font-bold uppercase tracking-[0.28em] text-[#ff6b61]">
            // Mission Briefing Terminal
          </span>
        </div>
      </div>

      <div className="ml-auto flex h-full items-end gap-6 px-6 py-2 text-text-hi">
        {loggedIn ? (
          <div className="flex flex-col items-end border-l border-separator pl-4">
            <h4 className="m-0 font-eyebrow text-[10px] font-bold uppercase tracking-[3px] text-text-mid">Callsign</h4>
            <span className="font-display text-lg font-extrabold uppercase tracking-[0.1em]">{username}</span>
          </div>
        ) : (
          <div className="flex flex-col items-end border-l border-separator pl-4">
            <h4 className="m-0 font-eyebrow text-[10px] font-bold uppercase tracking-[3px] text-text-mid">Status</h4>
            <span className="font-display text-lg font-extrabold uppercase tracking-[0.1em] text-text-mid">Read-only</span>
          </div>
        )}
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
        {loggedIn ? (
          <form action={logout} className="border-l border-separator pl-4">
            <button className="bg-transparent px-0 py-0 font-eyebrow text-xs font-bold uppercase tracking-[0.15em] text-text-mid hover:bg-transparent hover:text-white">
              Sign out
            </button>
          </form>
        ) : (
          <Link href="/signin" className="border-l border-separator pl-4 font-eyebrow text-xs font-bold uppercase tracking-[0.15em] text-text-mid hover:text-white">
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
