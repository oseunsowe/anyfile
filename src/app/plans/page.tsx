import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { getDemoCredentials, readDemoSession } from "@/lib/auth/demoSession";
import { PLANS } from "@/lib/plans";
import { pageMetadata } from "@/lib/seo";
import { cn } from "@/lib/cn";

export const metadata: Metadata = pageMetadata({
  title: "Plans",
  description:
    "Compare AnyFileKits plans — Free, Daily, Weekly, Pro and Business — and see what each one actually unlocks.",
  path: "/plans",
});

export default async function PlansPage({
  searchParams,
}: {
  searchParams: Promise<{ "plan-set"?: string }>;
}) {
  const session = await readDemoSession();
  const params = await searchParams;
  const creds = getDemoCredentials();
  const justSet = params["plan-set"];

  return (
    <section className="py-12 sm:py-16">
      <Container>
        <h1 className="text-3xl font-semibold text-ink sm:text-4xl">Plans</h1>
        <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-ink-muted">
          There is no payment processor wired up yet — this is a demo build. Every
          plan below sets a real session attribute you can preview while signed
          in: it genuinely turns off ads, unlocks background removal and raises
          the upload limit. Nothing is charged.
        </p>

        {justSet ? (
          <div className="mt-6 flex items-center gap-2 rounded-card bg-success-soft p-3.5 text-[0.8125rem] text-ink">
            <Icon name="shieldCheck" className="size-4 text-success" />
            Plan set to {justSet}. Entitlements are active for this session.
          </div>
        ) : null}

        {session ? (
          <p className="mt-6 text-[0.8125rem] text-ink-muted">
            Signed in as <span className="font-mono text-ink">{session.sub}</span>,
            currently on the <span className="font-medium text-ink">{PLANS.find((p) => p.id === session.plan)?.name}</span> plan.
          </p>
        ) : (
          <p className="mt-6 text-[0.8125rem] text-ink-muted">
            Not signed in — choosing a plan below will ask you to sign in first.
          </p>
        )}

        <div className="mt-8 grid gap-4 lg:grid-cols-5">
          {PLANS.map((plan) => {
            const isCurrent = session?.plan === plan.id;

            return (
              <article
                key={plan.id}
                className={cn(
                  "flex flex-col rounded-card border p-5",
                  isCurrent ? "border-brand bg-brand-soft/40" : "border-line bg-surface",
                )}
              >
                <h2 className="text-xl font-semibold text-ink">{plan.name}</h2>
                <p className="mt-1 text-sm font-medium text-brand-ink">
                  {plan.price}
                  {plan.cadence ? <span className="text-ink-muted"> {plan.cadence}</span> : null}
                </p>
                <p className="mt-1 text-[0.8125rem] text-ink-muted">{plan.tagline}</p>

                <ul className="mt-4 space-y-2 text-[0.8125rem] text-ink-muted">
                  {plan.features.map((point) => (
                    <li key={point} className="flex items-start gap-1.5">
                      <Icon name="check" className="mt-0.5 size-3.5 shrink-0 text-success" />
                      {point}
                    </li>
                  ))}
                </ul>

                {plan.comingSoon.length > 0 ? (
                  <div className="mt-4 border-t border-line pt-3">
                    <p className="text-[0.6875rem] font-medium uppercase tracking-wider text-ink-subtle">
                      Coming soon
                    </p>
                    <ul className="mt-1.5 space-y-1.5 text-[0.8125rem] text-ink-subtle">
                      {plan.comingSoon.map((point) => (
                        <li key={point}>• {point}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="mt-5">
                  {isCurrent ? (
                    <span className="inline-flex h-10 w-full items-center justify-center rounded-control bg-surface-muted text-[0.8125rem] font-medium text-ink-muted">
                      Current plan
                    </span>
                  ) : plan.selectable ? (
                    <form action="/api/account/set-plan" method="post">
                      <input type="hidden" name="plan" value={plan.id} />
                      <input type="hidden" name="next" value="/plans" />
                      <button
                        type="submit"
                        className="inline-flex h-10 w-full items-center justify-center rounded-control bg-solid text-[0.8125rem] font-medium text-ink-inverse hover:bg-solid-hover"
                      >
                        Preview this plan
                      </button>
                    </form>
                  ) : (
                    <span className="inline-flex h-10 w-full items-center justify-center rounded-control border border-line text-[0.8125rem] font-medium text-ink-muted">
                      Contact sales
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-10 rounded-card border border-line bg-surface-muted p-5">
          <h2 className="text-lg font-semibold text-ink">Demo login credentials</h2>
          <p className="mt-2 text-[0.875rem] leading-relaxed text-ink-muted">
            Email: <span className="font-mono text-ink">{creds.email}</span>
            <br />
            Password: <span className="font-mono text-ink">{creds.password}</span>
            <br />
            Use these on the <Link href="/login" className="text-brand hover:underline">demo login page</Link>,
            then come back here to preview a paid plan.
          </p>
        </div>
      </Container>
    </section>
  );
}
