import Link from "next/link";
import { cn } from "@/lib/cn";
import { site } from "@/lib/site";

/**
 * The AnyFileKits tri-blade mark, redrawn as inline SVG.
 *
 * The supplied anyfile_logo.png is a ~1 MB raster on an opaque white plate, so
 * it cannot sit in a header or adapt to dark mode. This traces the same mark and
 * inherits `currentColor`. Swap in the official vector export when it exists.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn("size-6", className)}
    >
      <g
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10.4 12 3.4 12" />
        <path d="M10.4 12 19 3.7" />
        <path d="M10.4 12 19 20.3" />
      </g>
    </svg>
  );
}

export function Logo({
  className,
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2.5 rounded-control text-ink",
        "transition-opacity hover:opacity-80",
        className,
      )}
      aria-label={`${site.name} home`}
    >
      <LogoMark className="size-7 text-brand" />
      <span className="text-[1.0625rem] font-semibold tracking-[-0.02em]">
        {site.name}
      </span>
    </Link>
  );
}
