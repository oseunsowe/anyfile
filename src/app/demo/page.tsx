import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { pageMetadata } from "@/lib/seo";
import { readDemoSession } from "@/lib/auth/demoSession";
import { formatBytes } from "@/lib/format";
import { getPlan, isPaidPlan } from "@/lib/plans";

export const metadata: Metadata = pageMetadata({
  title: "Demo Workspace",
  description: "Preview account-layer capabilities currently in development.",
  path: "/demo",
});

const upcoming = [
  {
    title: "Saved workflows",
    detail: "Persist repeatable operation chains across sessions.",
  },
  {
    title: "History and re-run",
    detail: "Open prior jobs and rerun them without rebuilding steps.",
  },
  {
    title: "Team sharing",
    detail: "Shared workflow libraries and role-based controls for teams.",
  },
] as const;

export default async function DemoPage() {
  const session = await readDemoSession();
  if (!session) redirect("/login?next=/demo");

  const plan = getPlan(session.plan);
  const paid = isPaidPlan(session.plan);

  return (
    <section className="py-12 sm:py-16">
      <Container>
        <h1 className="text-3xl font-semibold text-ink sm:text-4xl">Demo workspace</h1>
        <p className="mt-3 max-w-3xl text-[0.9375rem] leading-relaxed text-ink-muted">
          Signed in as {session.sub}, on the {plan.name} plan.
        </p>

        <div className="mt-8 rounded-card border border-line bg-surface p-5">
          <h2 className="text-lg font-semibold text-ink">What&apos;s active right now</h2>
          <ul className="mt-3 space-y-2 text-[0.8125rem] text-ink-muted">
            <li>• Ads are {paid ? "turned off" : "on"} for this session.</li>
            <li>
              • Background removal is {paid ? "unlocked" : "locked — upgrade to use it"}.
            </li>
            <li>• Upload limit: {formatBytes(plan.maxInputBytes, 0)} per file.</li>
          </ul>
          <p className="mt-3 text-[0.8125rem] text-ink-muted">
            <Link href="/plans" className="text-brand hover:underline">
              Change plan →
            </Link>
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {upcoming.map((card) => (
            <article key={card.title} className="rounded-card border border-line bg-surface p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-ink">{card.title}</h2>
                <span className="rounded-full border border-line px-2.5 py-1 text-xs text-ink-muted">
                  Planned
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{card.detail}</p>
            </article>
          ))}
        </div>

        <form action="/api/auth/logout" method="post" className="mt-8">
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-control border border-line bg-surface px-5 text-sm font-medium text-ink"
          >
            Sign out
          </button>
        </form>

        <p className="mt-4 text-sm text-ink-muted">
          Return to <Link href="/" className="text-brand hover:underline">homepage</Link>.
        </p>
      </Container>
    </section>
  );
}
