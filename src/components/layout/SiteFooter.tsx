import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Container";
import { footerNav, site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <Container className="py-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_2fr]">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-3 text-[0.8125rem] leading-relaxed text-ink-muted">
              {site.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {footerNav.map((group) => (
              <nav key={group.title} aria-label={group.title}>
                <h2 className="text-[0.8125rem] font-semibold text-ink">
                  {group.title}
                </h2>
                <ul className="mt-3 space-y-2.5">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="rounded text-[0.8125rem] text-ink-muted transition-colors hover:text-ink"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 text-[0.8125rem] text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p>
            Most tools run entirely in your browser. Files used by cloud tools are
            deleted automatically.
          </p>
        </div>
      </Container>
    </footer>
  );
}
