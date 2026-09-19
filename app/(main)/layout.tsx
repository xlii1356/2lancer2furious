import { currentUser } from "@/app/actions/helpers"; import { Header } from "@/components/Header"; import { Sidebar } from "@/components/Sidebar";
export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  const admin = user.role === "admin";
  return (
    <>
      <Header username={user.username || "Pilot"} admin={admin} />
      <Sidebar admin={admin} />
      <main className="mx-auto max-w-4xl px-4 py-8 pb-24 md:ml-[90px] md:pb-8">{children}</main>
    </>
  );
}
