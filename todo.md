# Product Build TODO

## P0 --- Product Decisions

-   [ ] Select final brand and register primary `.com` domain.
-   [ ] Check U.S. trademark/name conflicts before committing.
-   [ ] Define exact MVP promise: "Drop it. Tell us what you need.
    Done."
-   [ ] Define U.S.-first target personas.
-   [ ] Decide initial free, Pro, pass, and AI-credit packaging.
-   [ ] Define which operations are browser-only vs cloud.
-   [ ] Set maximum free file sizes and batch limits based on
    benchmarks.
-   [ ] Define privacy/retention policy before implementation.

## P0 --- Research & Validation

-   [ ] Build competitor matrix for Smallpdf, iLovePDF, TinyWow,
    remove.bg and focused converter competitors.
-   [ ] Research U.S. search demand for initial tool keywords.
-   [ ] Research long-tail "under X MB" queries.
-   [ ] Research destination queries for Etsy, Amazon, LinkedIn, YouTube
    and email.
-   [ ] Identify 20 highest-value SEO landing pages for launch.
-   [ ] Prototype homepage.
-   [ ] Prototype Exact Size task.
-   [ ] Prototype background-removal task.
-   [ ] Prototype SmartFix task.
-   [ ] Test prototypes with at least 5--10 target users.
-   [ ] Record where users hesitate or misunderstand the UI.
-   [ ] Revise flows before engineering.

## P0 --- Repository & Infrastructure

-   [x] Create monorepo/repository.
-   [x] Configure TypeScript strict mode.
-   [x] Configure Next.js production app.
-   [x] Configure linting and formatting.
-   [x] Add unit/integration/E2E test frameworks. *(Vitest — 53 unit tests on
    the intent/planner/requirement/diagnosis/quality core. Playwright E2E in
    `tests/e2e/pipeline.mjs` drives the real worker pipeline in Chromium.
    A component-test layer is still missing.)*
-   [ ] Configure CI checks.
-   [ ] Configure preview deployments.
-   [ ] Configure production deployment.
-   [ ] Set environment-secret management.
-   [ ] Add error monitoring.
-   [ ] Add uptime monitoring.
-   [ ] Add feature flags.

## P0 --- Design System

-   [x] Define typography scale.
-   [x] Define spacing tokens.
-   [x] Define radius/elevation tokens.
-   [x] Define brand accent and semantic states.
-   [x] Build Button component.
-   [x] Build Input component.
-   [x] Build FileDrop component.
-   [x] Build ToolCard component.
-   [x] Build IntentChip component.
-   [x] Build Progress component.
-   [x] Build PrivacyBadge component.
-   [x] Build ResultSummary component. *(`ProofPanel`)*
-   [ ] Build BeforeAfter component.
-   [ ] Build Paywall component.
-   [x] Build AdSlot component with reserved dimensions.
-   [x] Build responsive navigation.
-   [ ] Verify keyboard navigation. *(Built to spec; needs a real audit pass.)*
-   [ ] Verify WCAG contrast. *(Tokens chosen for it; not yet measured.)*
-   [x] Implement reduced-motion behavior.

## P0 --- Core UX Shell

-   [x] Build homepage hero.
-   [x] Add natural-language intent field.
-   [x] Add drag/drop.
-   [x] Add file browse.
-   [x] Add paste/clipboard support where compatible.
-   [x] Add popular intent shortcuts.
-   [x] Build file-analysis state.
-   [x] Build recommendation state. *(`DiagnosisPanel` + `PlanPreview`)*
-   [ ] Build processing state. *(Blocked on the worker framework.)*
-   [x] Build error/recovery state.
-   [ ] Build success/download state. *(`ProofPanel` built; needs real output.)*
-   [x] Build "Fix another" flow. *("Start over" in the console.)*
-   [ ] Preserve task state through optional signup.
-   [x] Make all basic tasks usable without an account.

## P0 --- Processing Framework

-   [x] Define normalized operation interface. *(`ops/protocol.ts` — `ExecStep`)*
-   [x] Define operation capability registry. *(`ops/capabilities.ts`)*
-   [x] Define file-type detector.
-   [x] Validate MIME and file signatures.
-   [x] Create Web Worker execution layer. *(`workers/pipeline.worker.ts`)*
-   [x] Create progress-event contract. *(Determinate only; no fake progress.)*
-   [x] Create cancellation contract. *(AbortSignal → cooperative worker checks.)*
-   [x] Create operation chaining engine.
-   [x] Create output validation layer. *(Output is re-measured, then checked
    by `evaluateRequirement` — never assumed from the plan.)*
-   [x] Add memory guards for mobile browsers. *(80 MP decode ceiling.)*
-   [x] Add safe unsupported-file handling.
-   [ ] Benchmark browser processing on representative phones/laptops.

## P0 --- Image MVP

-   [x] Implement JPG → PNG.
-   [x] Implement PNG → JPG.
-   [x] Implement WebP conversion.
-   [x] Implement HEIC → JPG. *(libheif via WebAssembly, lazy-loaded and only
    on browsers without native support. LGPL-3.0 + HEVC patent exposure needs
    a decision — see THIRD-PARTY-LICENCES.md.)*
-   [x] Implement standard image compression.
-   [x] Implement exact-target-size compression.
-   [x] Implement resize by dimensions.
-   [ ] Implement resize by percentage.
-   [ ] Implement crop/rotate.
-   [x] Implement EXIF/GPS inspector.
-   [x] Implement metadata removal. *(Canvas round trip carries pixels only.)*
-   [x] Implement image → PDF. *(`image-to-pdf` tool, via `imagesToPdf` in
    `ops/pdf.ts` — one page per image, multi-file ordered queue.)*
-   [ ] Add batch-processing architecture.
-   [ ] Add before/after image preview.
-   [~] Validate output quality and browser compatibility. *(E2E covers Chromium
    only; Safari, Firefox and mobile still to test.)*

## P0 --- PDF MVP

-   [x] Implement merge PDF. *(`merge-pdf` tool, ordered multi-file queue.)*
-   [ ] Implement split PDF.
-   [ ] Implement page extraction.
-   [ ] Implement page reorder. *(`organizePdf` in `ops/pdf.ts` supports
    keep/reorder/rotate already; no page-grid tool page yet — see
    `organize-pdf`, still `planned`.)*
-   [ ] Implement page rotation. *(Same `organizePdf` primitive as above.)*
-   [ ] Implement delete pages.
-   [ ] Implement PDF → image.
-   [x] Implement images → PDF. *(`image-to-pdf` tool.)*
-   [ ] Implement basic PDF compression. *(Deliberately not offered — pdf-lib
    cannot re-encode embedded images; see the scope note atop `ops/pdf.ts`.)*
-   [x] Implement PDF metadata removal. *(`pdf-remove-metadata` tool.)*
-   [ ] Add thumbnail/page organizer.
-   [ ] Validate large/malformed PDF behavior.

## P0 --- SmartFix

-   [x] Define supported user intents.
-   [x] Create deterministic keyword/intent rules.
-   [ ] Add lightweight AI fallback only for ambiguous intent if needed.
    *(Hook exists: `confidence === "none"`.)*
-   [x] Detect file characteristics.
-   [x] Detect likely compatibility problems.
-   [x] Detect oversize files.
-   [x] Detect image metadata/privacy risks.
-   [x] Build operation recommendation engine.
-   [x] Build multi-step execution plan.
-   [x] Show plan before processing.
-   [x] Let user disable optional steps.
-   [x] Validate final output against stated requirement.
    *(`evaluateRequirement` — contract + tests done, awaiting real output.)*
-   [x] Show "passed requirement" success state. *(`ProofPanel`)*

## P0 --- Task-Specific Interactive Onboarding

-   [ ] Create onboarding schema per operation.
-   [ ] Exact-size: ask only target size.
-   [ ] Conversion: recommend compatible output format.
-   [x] Resize: offer destination presets before raw dimensions. *(Profile
    Picture Resizer — LinkedIn/Instagram/Facebook/X/WhatsApp/YouTube/Discord/GitHub.)*
-   [ ] Metadata: explain detected private information.
-   [x] PDF merge: teach through drag-to-order interaction. *(`FileQueue` —
    numbered list with move up/down/remove, not literal drag; keyboard- and
    touch-usable.)*
-   [ ] PDF split: teach through visual page selection.
-   [ ] Background removal: teach through live before/after.
-   [ ] SmartFix: show "we found / we recommend / fix" sequence.
-   [ ] Suppress repeated helper tips after user demonstrates
    proficiency.
-   [ ] Save onboarding completion locally without requiring account.

## P0 --- Analytics

-   [ ] Define privacy-safe event taxonomy.
-   [ ] Track landing-page view.
-   [ ] Track intent selection.
-   [ ] Track upload start/completion.
-   [ ] Track analysis completion.
-   [ ] Track processing start.
-   [ ] Track processing success/failure.
-   [ ] Track download.
-   [ ] Track second task.
-   [ ] Track paywall view.
-   [ ] Track checkout.
-   [ ] Track subscription conversion.
-   [ ] Track ad impressions/revenue.
-   [ ] Track tool-level gross margin.
-   [ ] Never send file contents to analytics.

## P0 --- SEO Foundation

-   [x] Create reusable SEO tool-page template. *(`src/app/[slug]/page.tsx`,
    statically generated per live tool.)*
-   [x] Create unique title/H1/meta rules. *(`pageMetadata` is the only way to
    declare metadata, and it always emits a canonical.)*
-   [x] Add canonical tags.
-   [x] Add breadcrumbs.
-   [x] Add sitemap generation.
-   [x] Add robots configuration.
-   [x] Noindex task-result/private URLs.
-   [x] Add Open Graph metadata.
-   [x] Add relevant structured data. *(Organization, Breadcrumb,
    WebApplication, FAQ — FAQ is opt-in per page.)*
-   [x] Create related-tool internal-link component.
-   [x] Create intent-specific FAQ component.
-   [x] Build `/heic-to-jpg`.
-   [ ] Build `/compress-pdf`. *(Blocked on the PDF engine.)*
-   [ ] Build `/merge-pdf`. *(Blocked on the PDF engine.)*
-   [x] Build `/jpg-to-png`. *(Plus `/png-to-jpg` and `/webp-converter`.)*
-   [ ] Build `/remove-background`. *(Blocked on cloud processing.)*
-   [x] Build `/image-under-1mb`.
-   [x] Build `/image-under-2mb`.
-   [ ] Build `/compress-pdf-under-2mb`. *(Blocked on the PDF engine.)*
-   [x] Build `/reduce-photo-size-for-email`.
-   [x] Build `/remove-location-from-photo`.
-   [x] Also built: `/compress-image`, `/resize-image`.
-   [x] Verify each page has genuinely unique intent/content. *(Copy and FAQs
    are hand-written per tool in `toolContent.ts`.)*
-   [x] Prevent thin programmatic pages from being indexed. *(A route exists
    only where a `live` tool and hand-written content both exist.)*

## P0 --- Performance

-   [ ] Establish Core Web Vitals budgets.
-   [ ] Lazy-load tool libraries.
-   [ ] Lazy-load AI code.
-   [ ] Keep homepage bundle small.
-   [ ] Move heavy operations to Web Workers.
-   [ ] Optimize fonts.
-   [ ] Optimize icons/images.
-   [ ] Reserve ad-slot dimensions.
-   [ ] Test low-memory mobile devices.
-   [ ] Run Lighthouse in CI on key templates.

## P0 --- Security

-   [x] Validate file extensions, MIME and signatures. *(Client-side signature
    sniffing + extension-mismatch detection. Server-side validation pending.)*
-   [ ] Enforce file/page/pixel limits.
-   [ ] Protect against decompression bombs.
-   [ ] Sandbox cloud processors.
-   [ ] Configure CSP.
-   [ ] Add CSRF protection where relevant.
-   [ ] Add rate limits.
-   [ ] Use signed temporary object URLs.
-   [ ] Add short deletion TTL for cloud files.
-   [ ] Verify billing webhooks.
-   [ ] Scan dependencies.
-   [~] Review third-party library licenses. *(Audited in
    THIRD-PARTY-LICENCES.md. Everything is MIT except `libheif-js`, which is
    LGPL-3.0 and decodes patent-encumbered HEVC — that one needs counsel.)*
-   [ ] **Decide on HEIC**: confirm LGPL-3.0 compliance for a bundled web app
    and whether HEVC decoding needs a patent licence. Disable with
    `NEXT_PUBLIC_ENABLE_HEIC=false` if the answer is no.
-   [ ] Write incident/deletion procedures.

## P1 --- Advertising

-   [ ] Select ad provider after eligibility/policy review.
-   [ ] Implement reusable reserved-size AdSlot.
-   [ ] Test one ad below tool hero.
-   [ ] Test one ad below result/download section.
-   [ ] Test desktop side-rail placement.
-   [ ] Ensure no ad resembles a download button.
-   [ ] Ensure no ad interrupts upload → process → download.
-   [ ] Disable ads for paid users.
-   [ ] Measure CLS from ads.
-   [ ] Measure completion-rate impact.
-   [ ] Optimize for revenue per successful session, not raw
    impressions.

## P1 --- Accounts & Billing

-   [ ] Implement anonymous session.
-   [ ] Implement optional account creation.
-   [ ] Implement authentication.
-   [ ] Implement Stripe customer creation.
-   [ ] Implement monthly subscription.
-   [ ] Implement annual subscription.
-   [ ] Evaluate 24-hour/7-day pass.
-   [ ] Implement entitlement middleware.
-   [ ] Implement subscription webhook handling.
-   [ ] Implement billing portal.
-   [ ] Implement upgrade/downgrade/cancel states.
-   [ ] Preserve current task when entering checkout.
-   [ ] Add ad-free entitlement.
-   [ ] Add Pro batch limits.
-   [ ] Add Pro file-size limits.

## P1 --- AI / Cloud Jobs

-   [ ] Select background-removal approach after cost/quality benchmark.
-   [ ] Implement secure temporary upload.
-   [ ] Implement job queue.
-   [ ] Implement background removal.
-   [ ] Add preview mode.
-   [ ] Add HD output entitlement/credit cost.
-   [ ] Add automatic deletion.
-   [ ] Implement credit ledger.
-   [ ] Show credit cost before running.
-   [ ] Add abuse/rate controls.
-   [ ] Track per-operation compute cost.
-   [ ] Do not advertise unlimited AI until unit economics support it.

## P1 --- Workflows

-   [ ] Define Workflow schema.
-   [ ] Build Workflow runner.
-   [ ] Build Workflow editor.
-   [ ] Build "save current workflow" action.
-   [ ] Implement Etsy Product Workflow.
-   [ ] Implement Email Ready Workflow.
-   [ ] Implement Privacy Clean Workflow.
-   [ ] Implement Web Optimize Workflow.
-   [ ] Implement Job Application Workflow.
-   [ ] Add batch Workflow processing for Pro.
-   [ ] Add recent/favorite Workflows.

## P1 --- Destination Presets

-   [ ] Research current platform requirements before publishing
    presets.
-   [ ] Add LinkedIn presets.
-   [ ] Add YouTube presets.
-   [ ] Add Etsy presets.
-   [ ] Add Amazon seller image presets where appropriate.
-   [ ] Add email attachment preset.
-   [ ] Store requirement versions and last-reviewed date.
-   [ ] Create process for updating changed external requirements.

## P1 --- Conversion UX

-   [ ] Add contextual Pro prompt only after value is visible.
-   [ ] Add "Save this Workflow" conversion prompt.
-   [ ] Add "Process entire folder" Pro prompt.
-   [ ] Add "Remove ads" prompt.
-   [ ] Add annual-plan value framing.
-   [ ] Build paywall A/B testing.
-   [ ] Avoid fake urgency/countdowns.
-   [ ] Avoid blocking free download after promised free processing.

## P1 --- Retention

-   [ ] Add recently used tools locally.
-   [ ] Add favorites.
-   [ ] Add saved presets for accounts.
-   [ ] Add usage dashboard for Pro.
-   [ ] Show files processed.
-   [ ] Show bytes reduced.
-   [ ] Show estimated time saved with transparent methodology.
-   [ ] Add one-click repeat Workflow.
-   [ ] Add browser/PWA install prompt only after repeat engagement.

## P1 --- SEO Expansion

-   [ ] Use Search Console data to choose next pages.
-   [ ] Build high-performing size-constraint variants.
-   [ ] Build destination pages with real utility.
-   [ ] Build problem-solving pages.
-   [ ] Add educational supporting content only where it serves intent.
-   [ ] Add internal links based on task adjacency.
-   [ ] Consolidate cannibalizing pages.
-   [ ] Refresh platform requirement pages when requirements change.
-   [ ] Monitor indexation and crawl errors.

## P2 --- Advanced Documents

-   [ ] OCR scanned PDF.
-   [ ] Searchable PDF output.
-   [ ] Advanced PDF compression.
-   [ ] Watermark.
-   [ ] Page numbers.
-   [ ] Password protection.
-   [ ] Advanced PDF editing feasibility study.
-   [ ] DOCX/PPTX/XLSX conversion feasibility/licensing study.
-   [ ] Add only formats that pass quality and cost thresholds.

## P2 --- Advanced Image AI

-   [ ] Object removal.
-   [ ] Image upscale.
-   [ ] Image enhancement.
-   [ ] Background replacement.
-   [ ] Product-background generator.
-   [ ] Restoration.
-   [ ] Benchmark self-host vs API for each.
-   [ ] Add only features with sustainable gross margins.

## P2 --- Business

-   [ ] Define Business plan.
-   [ ] Team accounts.
-   [ ] Shared Workflows.
-   [ ] Central billing.
-   [ ] Usage reporting.
-   [ ] Higher batch limits.
-   [ ] API authentication.
-   [ ] API metering.
-   [ ] API documentation.
-   [ ] Rate plans.
-   [ ] Business onboarding.

## P2 --- Distribution

-   [ ] Build PWA.
-   [ ] Evaluate browser extension.
-   [ ] Add right-click image actions if extension proceeds.
-   [ ] Build share-to-product flows where browser/platform supports
    them.
-   [ ] Create embeddable tool/widget only if it supports acquisition.

## Launch Checklist

-   [ ] Brand/domain finalized.
-   [ ] Legal/privacy/terms reviewed.
-   [ ] HEIC licence/patent question resolved (see THIRD-PARTY-LICENCES.md).
-   [ ] Cookie/consent behavior configured as required.
-   [ ] Core tools tested across Chrome, Safari, Edge, Firefox.
-   [ ] Mobile Safari tested.
-   [ ] Android Chrome tested.
-   [ ] Accessibility audit passed.
-   [ ] Security review passed.
-   [ ] Billing test mode passed.
-   [ ] Billing production smoke test passed.
-   [ ] Ad placements reviewed for deceptive-layout risk.
-   [ ] Cloud deletion verified.
-   [ ] Analytics verified without file-content leakage.
-   [ ] SEO titles/canonicals/sitemap verified.
-   [ ] Robots/noindex verified.
-   [ ] Error monitoring live.
-   [ ] Backup/recovery for application data tested.
-   [ ] Support/contact path live.
-   [ ] Status page or incident communication path defined.
-   [ ] Launch analytics dashboard ready.

## First 30 Days After Launch

-   [ ] Review top organic landing pages weekly.
-   [ ] Review task completion by tool.
-   [ ] Review failure reasons.
-   [ ] Review mobile memory/performance failures.
-   [ ] Review ad revenue vs completion impact.
-   [ ] Review Pro conversion by entry tool.
-   [ ] Review subscription churn.
-   [ ] Review AI cost per successful output.
-   [ ] Interview repeat users.
-   [ ] Build only the next tools supported by demand.
-   [ ] Improve top five landing pages before mass-producing new ones.
-   [ ] Kill or redesign tools with poor completion and no acquisition
    value.

## Build Order --- Short Version

-   [ ] 1. Validate brand, keywords and 3 core UX prototypes.
-   [ ] 2. Build design system + SEO page framework.
-   [ ] 3. Build local processing framework.
-   [ ] 4. Ship image conversion/compression/exact-size tools.
-   [ ] 5. Ship core PDF tools.
-   [ ] 6. Ship SmartFix intent + diagnosis.
-   [ ] 7. Add analytics and result validation.
-   [ ] 8. Add ads carefully.
-   [ ] 9. Add accounts + Stripe Pro.
-   [ ] 10. Add background removal + credits.
-   [ ] 11. Add Workflows and batch workflows.
-   [ ] 12. Expand SEO from measured search demand.
-   [ ] 13. Add advanced AI/document features only when unit economics
    justify them.
