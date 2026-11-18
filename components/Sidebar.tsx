"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import "./hud.css";

const NAV_ITEMS = [
  { href: "/", icon: "/icons/protocol.svg", label: "Home" },
  { href: "/missions", icon: "/icons/campaign.svg", label: "Missions" },
  { href: "/intel", icon: "/icons/factions.svg", label: "Intel" },
  { href: "/roster", icon: "/icons/squad.svg", label: "Pilot Roster" },
  { href: "/scans", icon: "/icons/mech.svg", label: "OpFor Intel" },
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
      <nav className="hud-ticks fixed left-0 top-0 z-40 hidden h-full w-[90px] flex-col items-stretch border-r border-dashed border-[#ff6b61]/35 bg-void/60 pt-24 backdrop-blur-sm md:flex">
        {items.map((item, i) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative ml-1.5 flex flex-col items-center gap-1 border-b border-dashed border-[#ff6b61]/20 py-3.5 text-[11px] font-bold uppercase tracking-wide no-underline transition-colors ${
                active ? "hud-active text-white" : "bg-transparent text-text-mid hover:bg-[#ff6b61]/10 hover:text-white"
              }`}
            >
              <span className="absolute left-2 top-1.5 font-mono text-[9px] font-normal text-white/35">{String(i + 1).padStart(2, "0")}</span>
              <Image
                src={item.icon}
                alt=""
                width={28}
                height={28}
                className={`brightness-0 invert ${active ? "drop-shadow-[0_0_5px_#ff6b61]" : "opacity-70"}`}
              />
              <span className="text-center leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 z-40 flex w-full items-center justify-around border-t border-[#ff6b61]/40 bg-void/80 py-2 backdrop-blur-sm md:hidden">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-wide no-underline ${
                active ? "text-[#ff6b61]" : "text-text-mid"
              }`}
            >
              <Image src={item.icon} alt="" width={22} height={22} className={`brightness-0 invert ${active ? "" : "opacity-70"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
