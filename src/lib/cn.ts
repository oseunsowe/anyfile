import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Join class names, letting a caller-supplied `className` override component
 * defaults for the same Tailwind property (source order in the class attribute
 * does not decide conflicts — stylesheet order does, so we must dedupe).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
