"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", icon: "/icons/campaign.svg", label: "Missions" },
  { href: "/factions", icon: "/icons/factions.svg", label: "Factions" },
  { href: "/roster", icon: "/icons/squad.svg", label: "Pilot Roster" },
  { href: "/profile", icon: "/icons/portrait.svg", label: "Profile" },
];

const ADMIN_NAV_ITEMS: { href: string; icon: string; label: string }[] = [];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function Sidebar({ admin }: { admin: boolean }) {
  const pathname = usePathname();
  const items = admin ? [...NAV_ITEMS, ...ADMIN_NAV_ITEMS] : NAV_ITEMS;

  return (
    <>
      {/* Desktop fixed sidebar */}
      <nav className="fixed left-0 top-0 z-40 hidden h-full w-[90px] flex-col items-stretch bg-surface pt-24 md:flex">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`clip-bottom-right mb-4 flex flex-col items-center gap-1 py-3 text-[11px] font-bold uppercase tracking-wide no-underline transition-colors ${
                active ? "bg-primary text-void" : "bg-transparent text-text-mid hover:bg-white/10 hover:text-white"
              }`}
            >
              <Image src={item.icon} alt="" width={28} height={28} className={active ? "" : "opacity-80"} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 z-40 flex w-full items-center justify-around bg-surface-translucent py-2 md:hidden">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-wide no-underline ${
                active ? "text-primary" : "text-text-mid"
              }`}
            >
              <Image src={item.icon} alt="" width={22} height={22} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
