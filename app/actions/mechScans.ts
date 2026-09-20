"use server";
import { db } from "@/db"; import { mechScans } from "@/db/schema"; import { requireAdmin } from "./helpers"; import { eq } from "drizzle-orm"; import { revalidatePath } from "next/cache";

type FoundryPage = { text?: { content?: string } };
type FoundryJournalEntry = { name?: string; pages?: FoundryPage[] };

function parseScanFile(rawText: string, fallbackName: string): { name: string; content: string } {
  const trimmed = rawText.trim();
  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed) as FoundryJournalEntry;
      const pages = Array.isArray(parsed.pages) ? parsed.pages : [];
      const html = pages
        .map((p) => p.text?.content)
        .filter((c): c is string => Boolean(c))
        .join("<hr/>");
      if (html) return { name: parsed.name || fallbackName, content: html };
    } catch {
      // Not valid JSON — fall through and treat the file as raw HTML/text instead.
    }
  }
  return { name: fallbackName, content: rawText };
}

export async function uploadMechScans(formData: FormData) {
  const user = await requireAdmin();
  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) throw new Error("Choose one or more scan files to upload");

  for (const file of files) {
    if (file.size > 2 * 1024 * 1024) throw new Error(`${file.name} is too large (2MB limit)`);
    const raw = await file.text();
    const fallbackName = file.name.replace(/\.(json|html?|txt)$/i, "");
    const { name, content } = parseScanFile(raw, fallbackName);
    await db.insert(mechScans).values({ name, content, uploadedBy: user.id });
  }

  revalidatePath("/scans");
}

export async function deleteMechScan(id: string) {
  await requireAdmin();
  await db.delete(mechScans).where(eq(mechScans.id, id));
  revalidatePath("/scans");
}
