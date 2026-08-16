import { iconData, type IconName } from "@/components/ui/icon-data";
import { cn } from "@/lib/cn";

export type { IconName };

/**
 * Phosphor icons, rendered inline from a generated offline subset.
 *
 * Deliberately not `@iconify/react`: that component fetches icon data from a
 * CDN at runtime and needs hydration. Emitting the SVG body directly keeps
 * icons server-rendered, paints them on first byte, and costs no client JS.
 *
 * Icons are decorative by default. Pass `title` only when the icon is the sole
 * carrier of meaning — if there is adjacent text, leave it hidden so screen
 * readers do not announce the label twice (§12).
 */
export function Icon({
  name,
  title,
  className,
}: {
  name: IconName;
  title?: string;
  className?: string;
}) {
  const icon = iconData[name];

  return (
    <svg
      viewBox={`0 0 ${icon.width} ${icon.height}`}
      className={cn("size-[1.125rem] shrink-0", className)}
      fill="currentColor"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      // Generated at build time from the Phosphor package; never user input.
      dangerouslySetInnerHTML={{ __html: icon.body }}
    />
  );
}

/** Continuous spinner. The motion guard in globals.css stills it on request. */
export function Spinner({ className, label = "Working" }: { className?: string; label?: string }) {
  return (
    <span role="status" aria-label={label} className="inline-flex">
      <Icon name="spinner" className={cn("animate-spin", className)} />
    </span>
  );
}
