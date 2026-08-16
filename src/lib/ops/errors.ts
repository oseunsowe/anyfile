/**
 * Shared operation errors.
 *
 * Split out from `image.ts` so the HEIC module can throw them without a
 * circular import — `image.ts` imports the HEIC decoder as a fallback path.
 */

/**
 * A failure with a message safe to show the user verbatim.
 *
 * Anything else that escapes an operation is reported as a generic message, so
 * internal detail never leaks into the interface (§12 error recovery).
 */
export class OperationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OperationError";
  }
}
