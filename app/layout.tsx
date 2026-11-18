import "./globals.css"; import type { Metadata } from "next"; import { AmbientBackground } from "@/components/AmbientBackground"; import { StartupIntro } from "@/components/StartupIntro";
export const metadata: Metadata = { title: "FiCo Corps", description: "Mission briefings and faction intel" };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en"><body><StartupIntro /><AmbientBackground />{children}</body></html>; }
