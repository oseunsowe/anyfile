# AnyFileKits

**Anything in. Ready for anywhere.**

Competitors give you tools. AnyFileKits figures out what needs to be done.
See [plan.md](plan.md) §0 for the full USP and [todo.md](todo.md) for status.

```bash
npm run dev       # http://localhost:3000
npm run build     # production build + typecheck
npm run lint
npm test          # vitest unit tests
npm run test:e2e  # drives the real pipeline in Chromium — needs `npm run dev` running

node scripts/build-icons.mjs   # regenerate the icon subset after editing its list
```

## Where things are

```text
src/
  app/
    page.tsx       homepage
    [slug]/        SEO tool landing pages, one per live tool
    tools/         directory
    robots.ts sitemap.ts
  components/
    brand/      logo mark
    layout/     header, footer
    motion/     Reveal / Stagger primitives
    ui/         Button, Input, Card, Chip, Badge, Progress, ProgressRing,
                Icon (+ generated icon-data.ts), Container
    tools/      FileDrop, DiagnosisPanel, PlanPreview, ProofPanel,
                TaskSurface (shared task loop), ToolWorkspace, ToolCard
    seo/        JsonLd, Breadcrumbs, FaqSection, RelatedTools
    ads/        AdSlot (reserved dimensions)
    home/       Hero, SmartFixConsole, FlowBand, marketing sections
  workers/
    pipeline.worker.ts   chaining engine: runs the plan off the main thread
  lib/
    analyze.ts      Smart Diagnosis — signature sniffing, EXIF/GPS detection
    intent.ts       plain English → Requirement + actions (deterministic)
    requirement.ts  Exact Requirement Mode — the PASS/FAIL contract
    planner.ts      diagnosis + requirement → ordered operation plan
    workflows.ts    destination Workflows
    tools.ts        tool registry (drives directory, links, sitemap)
    toolContent.ts  per-tool page copy, FAQs and preset configuration
    useFilePipeline.ts  the whole task loop as one hook
    seo.ts          metadata + structured-data builders
    ops/
      protocol.ts      main ↔ worker message contract
      client.ts        runPipeline(file, steps, {onProgress, signal})
      capabilities.ts  what this browser can actually execute
      image.ts         decode / encode / resize / compressToTarget
      quality.ts       binary search for the largest quality that fits
      resize.ts        resize arithmetic (pure)
tests/e2e/
  pipeline.mjs    real-browser run: intent → plan → process → proof → download
```

## The five ideas worth knowing

**`requirement.ts` is the contract.** A `Requirement` is a machine-checkable
statement of what a destination accepts. The planner works backwards from it and
`ProofPanel` proves the output satisfies it. A constraint we could not measure
returns `unknown`, never `pass` — claiming an unverified pass is the exact
failure the feature exists to prevent.

**`intent.ts` is deterministic.** Rules first, model second. An LLM belongs
behind `confidence === "none"`, not in front of it.

**`planner.ts` step order is load-bearing.** `convert → background → resize →
strip metadata → compress`. Compression runs last because achievable quality
depends on the final format and pixel count. This is covered by tests.

**Exact-size compression is two stages, in this order.** `quality.ts` binary
searches for the *highest* quality that still fits — probing max quality first,
so a file that already fits costs one encode and is never degraded. Only when
quality alone cannot reach the ceiling does `image.ts` walk a downscale ladder.
If nothing fits, it returns its best attempt with `metTarget: false` rather than
throwing: the user still gets the file, and `ProofPanel` shows an honest FAIL.

**Honesty rules encoded in code, not convention:**

- `tools.ts` — a tool is `planned` until its operation actually runs. Only
  `live` tools link out and enter the sitemap.
- `workflows.ts` — `source: "platform"` workflows are withheld from the UI until
  someone researches and dates the real requirement.
- `Badge.tsx` — `PrivacyBadge` is the only sanctioned way to claim where
  processing happens, and it reads from the registry.
- `site.ts` — nav hrefs must resolve; add a nav item in the same commit as its
  page.
- `capabilities.ts` — the console will not offer to run a step this browser
  cannot execute. Users are told up front, not after a failure.
- `Progress.tsx` — `value` is required. An operation that cannot report real
  progress must use the indeterminate variant and say so (§4.4 bans fake
  progress bars).

## Design system

**Colour.** All of it lives in `src/app/globals.css` as `--afk-*` variables,
exposed to Tailwind via `@theme inline` so light/dark stay in lockstep.
Components use semantic utilities (`bg-surface`, `text-ink-muted`,
`border-line`) — never raw palette values. The brand accent is one variable:
`--afk-brand`.

**Icons.** Phosphor, via a generated offline subset (`icon-data.ts`, ~16 KB for
29 icons). Not `@iconify/react` at runtime: that fetches from a CDN and needs
hydration, whereas emitting the SVG body directly keeps icons server-rendered
and costs no client JS. Regular weight for controls, duotone for feature tiles
at 18px+. Add one to `scripts/build-icons.mjs` and re-run it.

**Motion.** `motion/react`, wrapped in `components/motion/Reveal.tsx`. Two
rules, enforced in the primitives rather than left to callers: everything
collapses to a plain fade under `prefers-reduced-motion`, and reveals fire
`once` — re-animating on every scroll pass makes a long page feel unstable.
House easing is a soft cubic-out; nothing bounces. `MOTION_TAGS` is a static map
because `motion.create()` during render returns a new component type each pass,
remounting the subtree and resetting its state.

## What actually runs today

End-to-end, in the browser, no upload: **diagnose → plan → convert, resize,
strip metadata, compress → prove → download**, with determinate progress and
working cancellation.

Ten tool landing pages are live and statically generated, each with its own
copy, FAQs and preset: `/heic-to-jpg`, `/compress-image`, `/image-under-1mb`,
`/image-under-2mb`, `/reduce-photo-size-for-email`, `/resize-image`,
`/jpg-to-png`, `/png-to-jpg`, `/webp-converter`,
`/remove-location-from-photo`.

A page exists only where a `live` registry entry and hand-written content in
`toolContent.ts` both exist. That pairing is the §8.3 thin-page guardrail in
code: no page without a working tool *and* something unique to say.

Verified by `npm run test:e2e` — 6 scenarios, 36 checks, in Chromium. The HEIC
scenario is meaningful precisely because Chromium *cannot* decode HEIC natively,
so reaching a JPG proves the WebAssembly fallback genuinely runs.

## HEIC needs a licence decision before launch

HEIC works — `/heic-to-jpg` decodes real iPhone-style files via libheif
compiled to WebAssembly, lazy-loaded only when a HEIC is actually dropped, and
never at all on Safari/iOS (which decode natively).

But `libheif-js` is **LGPL-3.0**, and HEIC is **HEVC-coded**, which is
patent-encumbered separately from the copyright licence. Neither obligation is
settled by the code. Read [THIRD-PARTY-LICENCES.md](THIRD-PARTY-LICENCES.md)
before shipping commercially.

The dependency is isolated in `src/lib/ops/heic.ts` and gated by one flag —
`NEXT_PUBLIC_ENABLE_HEIC=false` turns it off cleanly, leaving Safari's native
path intact.

## Known gaps

- **PDF operations do nothing yet** — no PDF engine. `capabilities.ts` reports
  this rather than letting a user start a job that cannot finish.
- **Cloud steps (background removal, upscale) are not enabled** — no backend.
- Homepage initial JS is ~790 KB uncompressed. Fine for now, but §14 wants a
  budget enforced in CI, and `motion` is a meaningful slice of it.
- Pricing, auth and the signed-in app shell are unbuilt.
- Batch processing, Workflows execution and saved presets are unbuilt.
- Crop/rotate and resize-by-percentage are not implemented.
- `anyfile_logo.png` is a ~1 MB raster on a white plate; the header uses a
  redrawn inline SVG. Replace with an official vector export when available.
