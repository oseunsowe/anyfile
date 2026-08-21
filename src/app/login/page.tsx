import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { pageMetadata } from "@/lib/seo";
import { getDemoCredentials, readDemoSession } from "@/lib/auth/demoSession";
import { redirect } from "next/navigation";

export const metadata: Metadata = pageMetadata({
  title: "Demo Login",
  description: "Sign in with demo credentials to preview account-only features.",
  path: "/login",
});

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const session = await readDemoSession();
  const params = await searchParams;
  const nextPath = params.next?.startsWith("/") ? params.next : "/demo";
  if (session) redirect(nextPath);

  const creds = getDemoCredentials();
  const invalid = params.error === "invalid";

  return (
    <section className="py-12 sm:py-16">
      <Container className="max-w-xl">
        <h1 className="text-3xl font-semibold text-ink sm:text-4xl">Demo login</h1>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-muted">
          Use the credentials below to preview account-only surfaces while the
          full auth and billing system is being finalized.
        </p>

        <div className="mt-6 rounded-card border border-line bg-surface p-5">
          <p className="text-sm text-ink-muted">Email</p>
          <p className="font-mono text-sm text-ink">{creds.email}</p>
          <p className="mt-3 text-sm text-ink-muted">Password</p>
          <p className="font-mono text-sm text-ink">{creds.password}</p>
        </div>

        <form action="/api/auth/login" method="post" className="mt-6 space-y-4 rounded-card border border-line bg-surface p-5">
          <input type="hidden" name="next" value={nextPath} />

          <label className="block">
            <span className="text-sm font-medium text-ink">Email</span>
            <input
              name="email"
              type="email"
              defaultValue={creds.email}
              required
              className="mt-1 h-11 w-full rounded-control border border-line bg-canvas px-3 text-sm text-ink"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-ink">Password</span>
            <input
              name="password"
              type="password"
              defaultValue={creds.password}
              required
              className="mt-1 h-11 w-full rounded-control border border-line bg-canvas px-3 text-sm text-ink"
            />
          </label>

          {invalid ? (
            <p role="alert" className="text-sm font-medium text-danger">
              Credentials were not accepted. Check the values and try again.
            </p>
          ) : null}

          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-control bg-solid px-5 text-sm font-medium text-ink-inverse"
          >
            Sign in to demo
          </button>
        </form>

        <p className="mt-4 text-sm text-ink-muted">
          No account yet? The core tools still work without login on the{" "}
          <Link href="/" className="text-brand hover:underline">
            homepage
          </Link>
          .
        </p>
      </Container>
    </section>
  );
}
