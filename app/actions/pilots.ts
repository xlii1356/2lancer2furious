"use server";
import { db } from "@/db"; import { pilotSheets } from "@/db/schema"; import { currentUser } from "./helpers"; import { eq } from "drizzle-orm"; import { revalidatePath } from "next/cache"; import { generateAvatarFor } from "@/lib/autoAvatar"; import { redirect } from "next/navigation";

type RawMech = { name?: string; frame?: string };

async function resolveTargetUserId(formData: FormData) {
  const user = await currentUser();
  const requested = String(formData.get("userId") || "").trim();
  if (!requested || requested === user.id) return user.id;
  if (user.role !== "admin") throw new Error("Not authorized to act on behalf of another pilot");
  return requested;
}

// Accepts a Comp/Con export ({ data: pilot }) or the pilot object itself.
function extractPilot(parsed: unknown): Record<string, unknown> | undefined {
  const root = parsed as { data?: unknown; pilot?: unknown } | null;
  for (const candidate of [root?.data, root?.pilot, root]) {
    if (candidate && typeof candidate === "object" && ("callsign" in candidate || "name" in candidate) && "mechs" in candidate) return candidate as Record<string, unknown>;
  }
  return undefined;
}

async function savePilotData(targetUserId: string, parsed: unknown, opts: { shareCode?: string; redirectTo?: string } = {}) {
  const pilot = extractPilot(parsed);
  if (!pilot) throw new Error("Unrecognized pilot data — expected a COMP/CON pilot");

  const callsign = typeof pilot.callsign === "string" ? pilot.callsign.trim() || null : null;
  const name = typeof pilot.name === "string" ? pilot.name.trim() || null : null;
  const background = typeof pilot.background === "string" ? pilot.background.trim() || null : null;
  const status = typeof pilot.status === "string" ? pilot.status.trim() || null : null;
  const img = pilot.img as { cloud_portrait?: string; portrait?: string } | undefined;
  const portraitUrl = img?.cloud_portrait || img?.portrait || null;
  const mechsRaw = Array.isArray(pilot.mechs) ? (pilot.mechs as RawMech[]) : [];
  const mechs = mechsRaw.map((m) => ({ name: m?.name || "Unnamed mech", frame: m?.frame || null }));

  await db
    .insert(pilotSheets)
    .values({ userId: targetUserId, callsign, name, background, status, portraitUrl, mechs, raw: parsed as object, shareCode: opts.shareCode ?? null })
    .onConflictDoUpdate({
      target: pilotSheets.userId,
      set: { callsign, name, background, status, portraitUrl, mechs, raw: parsed as object, ...(opts.shareCode ? { shareCode: opts.shareCode } : {}), updatedAt: new Date() },
    });

  // New avatar from the imported art, unless this pilot already has one. Never blocks the import.
  try { await generateAvatarFor(targetUserId); } catch { /* ignore */ }

  revalidatePath("/roster");
  revalidatePath(`/roster/${targetUserId}`);
  redirect(opts.redirectTo || "/roster");
}

// Where a share code is looked up. {code} is replaced with the share code. Set COMPCON_SHARE_URL in
// your environment to point at a different endpoint without changing code.
export async function importPilotJson(formData: FormData) {
  const targetUserId = await resolveTargetUserId(formData);
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) throw new Error("Choose a pilot JSON file to import");
  if (file.size > 5 * 1024 * 1024) throw new Error("File is too large");

  const text = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("That file isn't valid JSON");
  }

  await savePilotData(targetUserId, parsed);
}

export async function setPilotArt(formData: FormData) {
  const targetUserId = await resolveTargetUserId(formData);
  const portraitOverrideUrl = String(formData.get("portraitOverrideUrl") || "") || null;
  const mechPortraitOverrideUrl = String(formData.get("mechPortraitOverrideUrl") || "") || null;

  const existing = await db.query.pilotSheets.findFirst({ where: eq(pilotSheets.userId, targetUserId) });
  if (!existing) throw new Error("Import a pilot JSON for this pilot first");

  await db.update(pilotSheets).set({ portraitOverrideUrl, mechPortraitOverrideUrl, updatedAt: new Date() }).where(eq(pilotSheets.userId, targetUserId));

  revalidatePath(`/roster/${targetUserId}`);
  revalidatePath("/roster");
  redirect(`/roster/${targetUserId}`);
}

export async function deleteMyPilot() {
  const user = await currentUser();
  await db.delete(pilotSheets).where(eq(pilotSheets.userId, user.id));
  revalidatePath("/roster");
}

export async function deletePilot(targetUserId: string) {
  const user = await currentUser();
  if (targetUserId !== user.id && user.role !== "admin") throw new Error("Not authorized");
  await db.delete(pilotSheets).where(eq(pilotSheets.userId, targetUserId));
  revalidatePath("/roster");
  redirect("/roster");
}
