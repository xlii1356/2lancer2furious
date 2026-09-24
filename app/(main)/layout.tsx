import { getOptionalUser } from "@/app/actions/helpers"; import { Header } from "@/components/Header"; import { Sidebar } from "@/components/Sidebar";
export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const user = await getOptionalUser();
  const admin = user?.role === "admin";
  return (
    <>
      <Header username={user?.username || null} admin={admin} loggedIn={!!user} />
      <Sidebar admin={admin} />
      <main className="mx-auto max-w-4xl px-4 py-8 pb-24 md:ml-[90px] md:pb-8">{children}</main>
    </>
  );
}
