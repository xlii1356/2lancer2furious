import Link from "next/link"; import Image from "next/image"; import { notFound } from "next/navigation"; import { db } from "@/db"; import { mechScans, users } from "@/db/schema"; import { eq } from "drizzle-orm"; import { currentUser } from "@/app/actions/helpers"; import { deleteMechScan } from "@/app/actions/mechScans"; import { DeleteButton } from "@/components/DeleteButton"; import { FoundryContent } from "@/components/FoundryContent";

export default async function ScanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await currentUser();
  const row = await db.select({ scan: mechScans, uploader: users }).from(mechScans).innerJoin(users, eq(users.id, mechScans.uploadedBy)).where(eq(mechScans.id, id)).then((r) => r[0]);
  if (!row) notFound();

  return (
    <article className="border border-separator bg-surface">
      <div className="clip-bottom-right flex items-center gap-2 bg-primary px-4 py-2">
        <Image src="/icons/mech.svg" alt="" width={20} height={20} />
        <h2 className="font-display text-sm font-extrabold uppercase tracking-widest text-void">Scan Data</h2>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <Link href="/scans" className="text-sm text-text-mid hover:text-primary">← Mech Scans</Link>
          {user.role === "admin" && <DeleteButton action={deleteMechScan.bind(null, row.scan.id)} label="scan" />}
        </div>
        <h1 className="mt-2 border-b border-separator pb-2 font-mono text-lg text-primary">{row.scan.name}</h1>
        <p className="mt-2 text-sm text-text-mid">Uploaded by {row.uploader.username || row.uploader.name} · {row.scan.createdAt.toLocaleDateString()}</p>

        <div className="mt-4">
          <FoundryContent html={row.scan.content} />
        </div>
      </div>
    </article>
  );
}
