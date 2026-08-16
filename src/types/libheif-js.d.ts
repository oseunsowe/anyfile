/**
 * Minimal typings for `libheif-js`, which ships no types of its own.
 *
 * Only the surface we use is declared. See the decode flow in
 * `@/lib/ops/heic` for how these fit together.
 */
declare module "libheif-js/wasm-bundle" {
  /** A canvas-compatible target: libheif writes RGBA straight into `data`. */
  type DisplayTarget = {
    data: Uint8ClampedArray;
    width: number;
    height: number;
  };

  export type HeifImage = {
    get_width(): number;
    get_height(): number;
    /** Calls back with the filled target, or with a falsy value on failure. */
    display(target: DisplayTarget, callback: (result: DisplayTarget | null) => void): void;
    /** Present on some builds; release native memory when available. */
    free?(): void;
  };

  export class HeifDecoder {
    /** Returns every image in the container — HEIC files may hold several. */
    decode(buffer: Uint8Array): HeifImage[];
  }

  const libheif: { HeifDecoder: typeof HeifDecoder };
  export default libheif;
}
