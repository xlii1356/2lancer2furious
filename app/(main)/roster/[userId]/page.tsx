import { notFound } from "next/navigation"; import { db } from "@/db"; import { pilotSheets, users } from "@/db/schema"; import { eq } from "drizzle-orm"; import { SplitPortrait } from "@/components/SplitPortrait";

type Skill = { id: string; rank: number; data?: { name?: string } };
type Talent = { id: string; rank: number; data?: { name?: string; description?: string; ranks?: { name?: string; description?: string }[] } };
type License = { id: string; rank: number; stub?: { name?: string; source?: string } };
type WeaponData = { name?: string; type?: string; mount?: string; damage?: { type: string; val: string }[]; range?: { type: string; val: number }[] };
type Mount = { mount_type?: string; slots?: { weapon?: { data?: WeaponData } | null }[] };
type System = { data?: { name?: string; sp?: number; description?: string } };
type Mech = {
  name?: string;
  img?: { cloud_portrait?: string; portrait?: string };
  frameData?: { name?: string; source?: string; mechtype?: string[] };
  loadouts?: { mounts?: Mount[]; systems?: System[] }[];
};
type Pilot = {
  id?: string; callsign?: string; name?: string; background?: string; level?: number;
  img?: { cloud_portrait?: string; portrait?: string };
  mechSkills?: number[];
  skills?: Skill[]; talents?: Talent[]; licenses?: License[];
  mechs?: Mech[];
};

function romanRank(n: number) {
  return "I".repeat(Math.max(0, n));
}

export default async function PilotDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const row = await db.select({ sheet: pilotSheets, user: users }).from(pilotSheets).innerJoin(users, eq(users.id, pilotSheets.userId)).where(eq(pilotSheets.userId, userId)).then((r) => r[0]);
  if (!row) notFound();

  const pilot = (row.sheet.raw as { data?: Pilot })?.data;
  if (!pilot) notFound();

  const mech = pilot.mechs?.[0];
  const loadout = mech?.loadouts?.[0];
  const [hull = 0, agi = 0, sys = 0, eng = 0] = pilot.mechSkills || [];
  const pilotPortrait = pilot.img?.cloud_portrait || pilot.img?.portrait || "/icons/portrait.svg";
  const mechPortrait = mech?.img?.cloud_portrait || mech?.img?.portrait || "/icons/clockwork.svg";

  const weapons = (loadout?.mounts || [])
    .flatMap((m) => m.slots || [])
    .map((s) => s.weapon?.data)
    .filter((w): w is NonNullable<typeof w> => Boolean(w));

  const systems = (loadout?.systems || []).map((s) => s.data).filter((s): s is NonNullable<typeof s> => Boolean(s));

  return (
    <article className="border border-separator bg-surface">
      <div className="flex items-center justify-between gap-4 bg-primary px-5 py-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold uppercase tracking-wide text-void">
            Tactical Profile // {pilot.callsign || row.user.username}
          </h1>
          <p className="font-eyebrow text-xs font-bold uppercase tracking-widest text-void/70">({pilot.name})</p>
        </div>
      </div>

      <div className="p-5">
        <p className="eyebrow">Union Administrative RM-4 Pilot Identification Protocol (IDENT) Record {pilot.id}</p>

        <div className="mt-6 flex flex-wrap gap-6">
          <SplitPortrait pilotSrc={pilotPortrait} mechSrc={mechPortrait} />

          <div className="min-w-[280px] flex-1 space-y-5">
            <div>
              <p className="text-text-mid">
                Callsign: <b className="text-primary">{pilot.callsign}</b><br />
                Name (or legal alias): <b className="text-primary">{pilot.name}</b><br />
                Background: <b className="text-primary">{pilot.background}</b>
              </p>
            </div>

            <div>
              <p className="eyebrow">Frame Configuration Options</p>
              <p className="mt-1 font-mono text-lg text-text-hi">
                [ HULL: <span className="text-primary">{hull}</span>{" "}
                AGI: <span className="text-primary">{agi}</span>{" "}
                SYS: <span className="text-primary">{sys}</span>{" "}
                ENG: <span className="text-primary">{eng}</span> ]
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <p className="eyebrow">Pilot Skill Trigger Audit</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(pilot.skills || []).map((s) => (
                    <span key={s.id} className="border border-separator bg-void px-2 py-1 text-xs text-text-hi">
                      {s.data?.name || s.id} +{s.rank * 2}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="eyebrow">Pilot Talent Audit</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(pilot.talents || []).map((t) => (
                    <div key={t.id} className="group relative">
                      <span className="cursor-default border border-separator bg-void px-2 py-1 text-xs text-text-hi">
                        {t.data?.name || t.id} {romanRank(t.rank)}
                      </span>
                      {t.data?.description && (
                        <div className="invisible absolute left-0 top-full z-30 mt-1 w-80 border border-separator bg-void p-3 text-xs text-text-hi opacity-0 shadow-lg transition-opacity group-hover:visible group-hover:opacity-100">
                          <p className="font-semibold text-primary">{t.data.name}</p>
                          <p className="mt-1 text-text-mid">{t.data.description}</p>
                          {(t.data.ranks || []).slice(0, t.rank).map((r, i) => (
                            <p key={i} className="mt-2">
                              <b className="text-text-hi">{r.name}:</b> <span className="text-text-mid">{r.description}</span>
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {(pilot.level ?? 0) > 0 && (
              <div>
                <p className="eyebrow">Procurement License Audit: Level {pilot.level}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(pilot.licenses || []).map((l) => (
                    <span key={l.id} className="border border-separator bg-void px-2 py-1 text-xs text-text-hi">
                      {l.stub?.source} {l.stub?.name} {romanRank(l.rank)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {mech && (
          <div className="mt-8 border-t border-separator pt-6">
            <p className="eyebrow">Active Frame</p>
            <h2 className="mt-1 font-display text-xl font-bold uppercase tracking-wide text-text-hi">
              {mech.frameData?.name} <span className="text-text-mid">// {mech.frameData?.source}</span>
            </h2>
            <p className="text-sm text-text-mid">{(mech.frameData?.mechtype || []).join(" // ")}</p>

            {weapons.length > 0 && (
              <div className="mt-4">
                <p className="eyebrow">Mounted Weapons</p>
                <ul className="mt-2 space-y-1 text-sm text-text-hi">
                  {weapons.map((w, i) => (
                    <li key={i}>
                      <b>{w?.name}</b>
                      {w?.mount ? ` (${w.mount})` : ""}
                      {w?.damage?.length ? ` — ${w.damage.map((d) => `${d.val} ${d.type}`).join(", ")}` : ""}
                      {w?.range?.length ? ` — ${w.range.map((r) => `${r.type} ${r.val}`).join(", ")}` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {systems.length > 0 && (
              <div className="mt-4">
                <p className="eyebrow">Systems</p>
                <ul className="mt-2 space-y-1 text-sm text-text-hi">
                  {systems.map((s, i) => (
                    <li key={i}>
                      <b>{s?.name}</b>{s?.sp ? ` (${s.sp} SP)` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <p className="mt-8 border-t border-separator pt-4 text-[10px] uppercase tracking-wide text-text-low">
          Improper use of this IDENT record by the record holder or any other party is subject to Union
          Administrative review. This record is transmitted for authorized personnel only and must be kept
          current to retain standing procurement rights. Contact your local Administrative liaison with
          questions regarding this record.
        </p>
      </div>
    </article>
  );
}
