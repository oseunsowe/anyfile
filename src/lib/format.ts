/** Shared formatters. U.S.-first locale per plan.md positioning. */

const UNITS = ["B", "KB", "MB", "GB", "TB"] as const;

/**
 * Human file size using decimal units, matching what upload limits and mail
 * providers quote ("under 2 MB" means 2,000,000 bytes to a user, not 2^21).
 */
export function formatBytes(bytes: number, fractionDigits = 1): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes === 0) return "0 B";

  const exponent = Math.min(Math.floor(Math.log10(bytes) / 3), UNITS.length - 1);
  const value = bytes / 1000 ** exponent;
  // Whole bytes never need a decimal place.
  const digits = exponent === 0 ? 0 : fractionDigits;

  return `${value.toFixed(digits)} ${UNITS[exponent]}`;
}

/**
 * "7.8 MB → 1.9 MB (76% smaller)" for the success screen (§4.5).
 *
 * Most tools shrink the file, but some (background removal's transparent
 * PNG, format conversions) legitimately grow it — say so instead of
 * reporting a negative "% smaller", which reads as broken.
 */
export function formatReduction(before: number, after: number): string {
  if (before <= 0) return formatBytes(after);

  if (after === before) return `${formatBytes(before)} → ${formatBytes(after)} (no change)`;

  if (after > before) {
    const percent = Math.round((after / before - 1) * 100);
    return `${formatBytes(before)} → ${formatBytes(after)} (${percent}% larger)`;
  }

  const percent = Math.round((1 - after / before) * 100);
  return `${formatBytes(before)} → ${formatBytes(after)} (${percent}% smaller)`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function fileExtension(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot === -1 ? "" : filename.slice(dot + 1).toLowerCase();
}
