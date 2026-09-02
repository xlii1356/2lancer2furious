import Link from "next/link"; import { notFound } from "next/navigation"; import { db } from "@/db"; import { mechScans, users } from "@/db/schema"; import { eq } from "drizzle-orm"; import { currentUser } from "@/app/actions/helpers"; import { deleteMechScan } from "@/app/actions/mechScans"; import { DeleteButton } from "@/components/DeleteButton";

export default async function ScanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await currentUser();
  const row = await db.select({ scan: mechScans, uploader: users }).from(mechScans).innerJoin(users, eq(users.id, mechScans.uploadedBy)).where(eq(mechScans.id, id)).then((r) => r[0]);
  if (!row) notFound();

  return (
    <article>
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/scans" className="text-sm text-text-mid hover:text-primary">← Mech Scans</Link>
          <h1 className="mt-1 text-3xl font-bold text-text-hi">{row.scan.name}</h1>
          <p className="mt-1 text-sm text-text-mid">Uploaded by {row.uploader.username || row.uploader.name} · {row.scan.createdAt.toLocaleDateString()}</p>
        </div>
        {user.role === "admin" && <DeleteButton action={deleteMechScan.bind(null, row.scan.id)} label="scan" />}
      </div>
      <div className="scan-content mt-6 border border-separator bg-surface p-5" dangerouslySetInnerHTML={{ __html: row.scan.content }} />
    </article>
  );
}
