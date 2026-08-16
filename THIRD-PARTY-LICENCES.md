# Third-party licences

Runtime dependencies shipped to the browser, and what each one obliges us to do.

Regenerate the dependency list with `npm ls --omit=dev --depth=0`.

---

## libheif-js — LGPL-3.0 ⚠️ needs a decision

**Used for:** decoding HEIC/HEIF photos in browsers that cannot do it natively
(everything except Safari/iOS). Loaded only when a HEIC file is actually
dropped — see `src/lib/ops/heic.ts`.

**Upstream:** [catdad-experiments/libheif-js](https://github.com/catdad-experiments/libheif-js),
an Emscripten build of [strukturag/libheif](https://github.com/strukturag/libheif).

There are two separate obligations here, and **neither is resolved by the
code**. Both need a decision before commercial launch.

### 1. LGPL-3.0 copyleft

The LGPL permits use in a proprietary application, but a recipient must be able
to replace the library with their own build. What we do to support that:

- The library is loaded as a **separate, unmodified chunk** via dynamic import,
  not inlined into or minified together with our application logic.
- It is attributed here, with a link to upstream source.
- We have made no modifications to it.

What still needs doing before launch:

- [ ] Ship the LGPL-3.0 licence text with the distributed application.
- [ ] Publish a note telling users how to substitute their own libheif build.
- [ ] Have counsel confirm that dynamic loading of a WASM chunk in a bundled
      web app satisfies §4 of the LGPL. This is a genuinely unsettled area —
      the licence was written for native dynamic linking, and a JavaScript
      bundle is not obviously the same thing.

### 2. HEVC patents

HEIC images are HEVC-coded, and **HEVC is patent-encumbered independently of
libheif's copyright licence**. Patent pools exist (Access Advance, MPEG LA), and
some vendors ship HEVC support only as a paid add-on — Microsoft charges for the
HEVC extension on Windows, and Apple licenses it directly.

Whether a browser-side decoder inside a commercial, ad-supported or subscription
product requires a patent licence is a question for counsel. Many web products
ship this without one; that is a description of common practice, not advice, and
not a defence.

### If the answer is no

The whole dependency is isolated behind one flag. Set:

```
NEXT_PUBLIC_ENABLE_HEIC=false
```

`/heic-to-jpg` then reports HEIC as unsupported rather than failing, Safari and
iOS keep working via their native decoder, and nothing else in the product
changes. Removing `libheif-js` from `package.json` drops it entirely.

---

## Phosphor Icons — MIT

**Used for:** the entire icon set. Icon paths are extracted at build time by
`scripts/build-icons.mjs` into `src/components/ui/icon-data.ts`.

**Upstream:** [phosphor-icons/core](https://github.com/phosphor-icons/core),
obtained via `@iconify-json/ph`.

MIT permits this freely. Attribution is carried in the header of the generated
file. No further action needed.

---

## motion — MIT

**Used for:** UI animation. **Upstream:** [motiondivision/motion](https://github.com/motiondivision/motion).
No further action needed.

## clsx — MIT · tailwind-merge — MIT

Class-name utilities. No further action needed.

## Next.js, React, React DOM — MIT

Framework and runtime. No further action needed.

---

## Test-only assets (not distributed)

`tests/e2e/.fixtures/sample.heic` is downloaded on demand from
[nokiatech/heif_conformance](https://github.com/nokiatech/heif_conformance),
Nokia's public HEIF conformance suite. It is **git-ignored and never shipped**;
it exists so the HEIC decode path is tested against a real camera-style file
rather than a synthetic one.
