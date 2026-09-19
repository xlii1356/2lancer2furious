import Link from "next/link"; import { db } from "@/db"; import { events, responses, signups, users } from "@/db/schema"; import { desc, eq, sql } from "drizzle-orm"; import { Avatar } from "@/components/Avatar";

export default async function EventsPage() {
  const list = await db.select({ event: events, responseCount: sql<number>`count(distinct ${responses.id})::int` }).from(events).leftJoin(responses, eq(responses.eventId, events.id)).groupBy(events.id).orderBy(desc(events.createdAt));

  const allSignups = await db.select({ signup: signups, user: users }).from(signups).innerJoin(users, eq(users.id, signups.userId));
  const signupsByEvent = new Map<string, { id: string; avatarUrl: string | null; username: string | null }[]>();
  for (const { signup, user } of allSignups) {
    const arr = signupsByEvent.get(signup.eventId) || [];
    arr.push({ id: user.id, avatarUrl: user.avatarUrl, username: user.username });
    signupsByEvent.set(signup.eventId, arr);
  }

  return (
    <>
      <h1 className="text-3xl font-bold">Missions</h1>
      <div className="mt-6 divide-y divide-separator border border-separator bg-surface">
        {list.map(({ event, responseCount }) => {
          const dates = (event.eventDates as string[]) || [];
          const claimants = signupsByEvent.get(event.id) || [];
          const openSlots = event.slotCount ? Math.max(0, event.slotCount - claimants.length) : 0;
          return (
            <Link key={event.id} href={`/events/${event.slug}`} className="block p-5 text-text-hi no-underline hover:bg-white/5">
              <h2 className="font-semibold text-text-hi">{event.title}</h2>
              <p className="mt-1 text-sm text-text-mid">
                {dates.length ? dates.join(", ") : "No date set"} · {responseCount} writeup{responseCount === 1 ? "" : "s"}
              </p>
              {event.slotCount && (
                <div className="mt-2 flex items-center gap-1">
                  {claimants.map((c) => (
                    <Avatar key={c.id} id={c.id} url={c.avatarUrl} name={c.username} size={24} />
                  ))}
                  {Array.from({ length: openSlots }).map((_, i) => (
                    <span key={i} className="h-6 w-6 shrink-0 rounded-full border border-separator bg-void" />
                  ))}
                </div>
              )}
            </Link>
          );
        })}
        {!list.length && <p className="p-5 text-text-mid">No missions yet.</p>}
      </div>
    </>
  );
}
