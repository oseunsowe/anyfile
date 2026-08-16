/**
 * Exact-size targeting (plan.md §15 MVP 4, §5 "Exact-size compression").
 *
 * The encoder is injected rather than imported, so the search is pure logic and
 * testable in Node without a canvas.
 */

export type Encoded = { size: number };

export type QualitySearchOptions<T extends Encoded> = {
  /** Encodes at a quality in [0,1] and returns the produced artefact. */
  encode: (quality: number) => Promise<T>;
  maxBytes: number;
  /** Search bounds. Below `min` the result stops being worth delivering. */
  min?: number;
  max?: number;
  /** Halvings after the initial probe. 6 gets within ~1% of optimal quality. */
  iterations?: number;
  onAttempt?: (attempt: number, total: number) => void;
  isCancelled?: () => boolean;
};

export type QualityResult<T> = { result: T; quality: number };

export class CancelledError extends Error {
  constructor() {
    super("Cancelled");
    this.name = "CancelledError";
  }
}

/**
 * Finds the *highest* quality whose output still fits under `maxBytes`.
 *
 * Size is monotonically non-decreasing in quality, so a binary search is valid.
 * We probe `max` first because most files already fit — that case should cost
 * one encode, not eight, and it avoids degrading a file that never needed it.
 *
 * Returns null when even `min` is too large; the caller then reduces pixels.
 */
export async function searchQuality<T extends Encoded>({
  encode,
  maxBytes,
  min = 0.3,
  max = 0.95,
  iterations = 6,
  onAttempt,
  isCancelled,
}: QualitySearchOptions<T>): Promise<QualityResult<T> | null> {
  const total = iterations + 1;
  let attempt = 0;

  const step = async (quality: number): Promise<T> => {
    if (isCancelled?.()) throw new CancelledError();
    attempt += 1;
    onAttempt?.(attempt, total);
    return encode(quality);
  };

  const atMax = await step(max);
  if (atMax.size <= maxBytes) return { result: atMax, quality: max };

  let low = min;
  let high = max;
  let best: QualityResult<T> | null = null;

  for (let i = 0; i < iterations; i += 1) {
    const quality = (low + high) / 2;
    const candidate = await step(quality);

    if (candidate.size <= maxBytes) {
      // Fits — record it and probe higher for better quality.
      best = { result: candidate, quality };
      low = quality;
    } else {
      high = quality;
    }
  }

  return best;
}

/**
 * Downscale factors tried when quality alone cannot reach the target.
 *
 * Each step is a ~15% linear reduction (~28% fewer pixels). Gentle enough that
 * we rarely overshoot and throw away detail we did not need to lose.
 */
export const SCALE_LADDER = [0.85, 0.72, 0.6, 0.5, 0.4, 0.3] as const;
