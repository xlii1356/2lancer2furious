import "./globals.css"; import type { Metadata } from "next";
export const metadata: Metadata = { title: "2 Lancer 2 Furious", description: "Mission briefings and faction intel" };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html>; }
