"use server";
import { db } from "@/db"; import { mechScans } from "@/db/schema"; import { requireAdmin } from "./helpers"; import { eq } from "drizzle-orm"; import { revalidatePath } from "next/cache";

export async function uploadMechScans(formData: FormData) {
  const user = await requireAdmin();
  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) throw new Error("Choose one or more scan files to upload");

  for (const file of files) {
    if (file.size > 2 * 1024 * 1024) throw new Error(`${file.name} is too large (2MB limit)`);
    const content = await file.text();
    const name = file.name.replace(/\.(html?|txt)$/i, "");
    await db.insert(mechScans).values({ name, content, uploadedBy: user.id });
  }

  revalidatePath("/scans");
}

export async function deleteMechScan(id: string) {
  await requireAdmin();
  await db.delete(mechScans).where(eq(mechScans.id, id));
  revalidatePath("/scans");
}
