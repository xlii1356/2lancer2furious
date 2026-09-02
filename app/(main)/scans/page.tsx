import { db } from "@/db"; import { mechScans, users } from "@/db/schema"; import { desc, eq } from "drizzle-orm"; import { currentUser } from "@/app/actions/helpers"; import { uploadMechScans } from "@/app/actions/mechScans"; import { ScanTable } from "@/components/ScanTable";

export default async function ScansPage() {
  const user = await currentUser();
  const isAdmin = user.role === "admin";

  const rows = await db.select({ scan: mechScans, uploader: users }).from(mechScans).innerJoin(users, eq(users.id, mechScans.uploadedBy)).orderBy(desc(mechScans.createdAt));
  const scans = rows.map(({ scan, uploader }) => ({
    id: scan.id,
    name: scan.name,
    uploadedByName: uploader.username || uploader.name || "Unknown",
    createdAt: scan.createdAt.toLocaleDateString(),
  }));

  return (
    <>
      <h1 className="text-3xl font-bold">Mech Scans</h1>

      {isAdmin && (
        <section className="mt-6 border border-separator bg-surface p-5">
          <h2 className="font-display text-lg font-bold uppercase tracking-wide text-text-hi">Upload scans</h2>
          <p className="mt-1 text-xs text-text-mid">Upload one or more HTML scan exports.</p>
          <form action={uploadMechScans} encType="multipart/form-data" className="mt-4 flex flex-wrap items-center gap-3">
            <input type="file" name="files" accept=".html,.htm,.txt" multiple required />
            <button>Upload</button>
          </form>
        </section>
      )}

      <div className="mt-8">
        <ScanTable scans={scans} />
      </div>
    </>
  );
}
