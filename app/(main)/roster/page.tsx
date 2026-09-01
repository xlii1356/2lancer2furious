import Image from "next/image"; import { db } from "@/db"; import { allowedEmails, pilotSheets, users } from "@/db/schema"; import { currentUser } from "@/app/actions/helpers"; import { addMember, removeMember } from "@/app/actions/admin"; import { importPilotJson, deleteMyPilot } from "@/app/actions/pilots"; import { eq } from "drizzle-orm";
import { DeleteButton } from "@/components/DeleteButton";

type Mech = { name: string; frame: string | null };

export default async function RosterPage() {
  const user = await currentUser();
  const isAdmin = user.role === "admin";

  const roster = await db.select({ sheet: pilotSheets, user: users }).from(pilotSheets).innerJoin(users, eq(users.id, pilotSheets.userId));
  const mySheet = roster.find((r) => r.user.id === user.id)?.sheet;
  const members = isAdmin ? await db.select().from(allowedEmails) : [];

  return (
    <>
      <h1 className="text-3xl font-bold">Pilot Roster</h1>

      {isAdmin && (
        <section className="mt-8 border border-separator bg-surface p-5">
          <h2 className="font-display text-lg font-bold uppercase tracking-wide text-text-hi">Invite pilots</h2>
          <form action={addMember} className="mt-4 flex gap-2">
            <input name="email" type="email" required placeholder="name@example.com" />
            <button>Add</button>
          </form>
          <ul className="mt-4 divide-y divide-separator">
            {members.map((member) => (
              <li className="flex items-center justify-between py-3 text-text-hi" key={member.email}>
                <span>{member.email}</span>
                <form action={async () => { "use server"; await removeMember(member.email); }}>
                  <button className="bg-mission-failure text-white hover:bg-red-700">Remove</button>
                </form>
              </li>
            ))}
            {!members.length && <li className="py-3 text-text-mid">No invited emails yet.</li>}
          </ul>
        </section>
      )}

      <section className="mt-8 border border-separator bg-surface p-5">
        <h2 className="font-display text-lg font-bold uppercase tracking-wide text-text-hi">Your pilot</h2>
        {mySheet ? (
          <div className="mt-4 flex items-start gap-4">
            {mySheet.portraitUrl && <Image src={mySheet.portraitUrl} alt="" width={72} height={72} className="h-18 w-18 shrink-0 border border-separator object-cover" unoptimized />}
            <div>
              <p className="font-semibold text-text-hi">{mySheet.callsign || mySheet.name}</p>
              <p className="text-sm text-text-mid">{mySheet.name}{mySheet.background ? ` · ${mySheet.background}` : ""}</p>
              <p className="mt-1 text-sm text-text-mid">{(mySheet.mechs as Mech[]).map((m) => m.name).join(", ") || "No mechs"}</p>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-text-mid">No pilot imported yet.</p>
        )}
        <form action={importPilotJson} encType="multipart/form-data" className="mt-4 flex flex-wrap items-center gap-3">
          <input type="file" name="file" accept="application/json,.json" required />
          <button>{mySheet ? "Re-import" : "Import pilot JSON"}</button>
        </form>
        {mySheet && <div className="mt-2"><DeleteButton action={deleteMyPilot} label="pilot" /></div>}
      </section>

      <section className="mt-8">
        <h2 className="font-display text-lg font-bold uppercase tracking-wide text-text-hi">All pilots</h2>
        <div className="mt-4 divide-y divide-separator border border-separator bg-surface">
          {roster.map(({ sheet, user: pilotUser }) => (
            <div key={sheet.id} className="flex items-center gap-4 p-5 text-text-hi">
              {sheet.portraitUrl ? (
                <Image src={sheet.portraitUrl} alt="" width={56} height={56} className="h-14 w-14 shrink-0 border border-separator object-cover" unoptimized />
              ) : (
                <div className="h-14 w-14 shrink-0 border border-separator bg-void" />
              )}
              <div>
                <p className="font-semibold text-text-hi">{sheet.callsign || sheet.name || pilotUser.username}</p>
                <p className="text-sm text-text-mid">{sheet.name}{sheet.background ? ` · ${sheet.background}` : ""}{sheet.status ? ` · ${sheet.status}` : ""}</p>
                <p className="mt-1 text-sm text-text-mid">{(sheet.mechs as Mech[]).map((m) => m.name).join(", ") || "No mechs"}</p>
              </div>
            </div>
          ))}
          {!roster.length && <p className="p-5 text-text-mid">No pilots imported yet.</p>}
        </div>
      </section>
    </>
  );
}
