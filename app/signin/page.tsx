import { login, registerPassword } from "@/app/actions/auth";
export default async function SignInPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const error = (await searchParams).error;
  return (
    <main className="mx-auto mt-24 max-w-md px-5">
      <h1 className="font-display text-3xl font-extrabold uppercase tracking-wide text-text-hi">Establishing Uplink...</h1>
      <p className="mt-3 text-text-mid">Please verify pilot credentials.</p>
      {error === "invalid" && <p className="mt-4 border border-mission-failure bg-mission-failure/20 p-3 text-sm text-text-hi">Email or password is incorrect.</p>}
      <form action={login} className="mt-8 space-y-4">
        <label>Email<input type="email" name="email" required autoComplete="email" /></label>
        <label>Password<input type="password" name="password" required autoComplete="current-password" /></label>
        <button className="w-full">Sign in</button>
      </form>
      <details className="mt-8">
        <summary className="cursor-pointer font-eyebrow text-xs font-bold uppercase tracking-[0.15em] text-primary">Register New Pilot</summary>
        <form action={registerPassword} className="mt-4 space-y-3">
          <label>Callsign<input name="username" required minLength={2} maxLength={24} placeholder="Your callsign" autoComplete="nickname" /></label>
          <label>Email<input type="email" name="email" required placeholder="Email" autoComplete="email" /></label>
          <label>Password<input type="password" name="password" required minLength={6} placeholder="Password (6+ characters)" autoComplete="new-password" /></label>
          <button>Create account</button>
        </form>
      </details>
    </main>
  );
}
