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

const CODE_RE = /^[A-Za-z0-9]{4,20}$/;

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

async function fetchShareCode(code: string): Promise<unknown> {
  const url = `https://compcon.app/link/pilot/${code}/full/`;
  let res: Response;
  try {
    res = await fetch(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(10000), cache: "no-store" });
  } catch {
    throw new Error("Couldn't reach Comp/Con — try again in a moment");
  }
  if (res.status === 404) throw new Error("Comp/Con doesn't recognize that share code. Check it, or generate a fresh one (codes expire after 90 days).");
  if (!res.ok) throw new Error(`Comp/Con returned an error (${res.status})`);
  const text = await res.text();
  if (text.length > 5 * 1024 * 1024) throw new Error("Pilot data is too large");
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Comp/Con didn't return pilot data for that code. It may have expired — generate a fresh share code and try again.");
  }
}

export async function importPilotShareCode(formData: FormData) {
  const targetUserId = await resolveTargetUserId(formData);
  let code = String(formData.get("code") || "").trim();
  const fromLink = code.match(/link\/pilot\/([A-Za-z0-9]+)/); // also accept a pasted compcon.app link
  if (fromLink) code = fromLink[1];
  code = code.replace(/\s+/g, "");
  if (!CODE_RE.test(code)) throw new Error("Enter a valid Comp/Con share code");
  await savePilotData(targetUserId, await fetchShareCode(code), { shareCode: code });
}

// Re-pulls a pilot's info from Comp/Con using the share code saved when they were imported.
// Pilot art overrides and the site avatar are left alone.
export async function refreshPilotFromCompcon(formData: FormData) {
  const targetUserId = await resolveTargetUserId(formData);
  const sheet = await db.query.pilotSheets.findFirst({ where: eq(pilotSheets.userId, targetUserId) });
  if (!sheet?.shareCode) throw new Error("No Comp/Con share code is saved for this pilot. Import them with a share code first.");
  let parsed: unknown;
  try {
    parsed = await fetchShareCode(sheet.shareCode);
  } catch {
    throw new Error("Couldn't update from Comp/Con — the share code may have expired or been regenerated. Import again with a fresh share code.");
  }
  const returnTo = String(formData.get("returnTo") || "");
  await savePilotData(targetUserId, parsed, { redirectTo: returnTo.startsWith("/roster") ? returnTo : "/roster" });
}

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
