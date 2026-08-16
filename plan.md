# Product Build Plan

## 0. The USP

**Competitors give you tools. AnyFileKits figures out what needs to be
done.**

The gap is not tool count. It is that people know the *result* they need
but not which tool, format, dimensions, compression level or sequence of
steps gets them there. Most utility platforms expose the technology.
AnyFileKits solves the problem.

Someone facing "PDF only, maximum 2 MB" with a 7.8 MB resume does not
want a PDF compressor. They want their resume to be accepted. An iPhone
user does not know what HEIC is; they know the site rejected their photo.
An Etsy seller does not want to learn WebP-versus-JPEG; they want 30
photos ready for Etsy.

**Positioning:** *Anything in. Ready for anywhere.*\
Upload a document or image, tell us where it is going, and AnyFileKits
handles the format, size, dimensions and optimization.

The longer-term product is a **compatibility layer** between someone's
content (PDF, DOCX, HEIC, JPG, PNG, WebP, scans) and wherever it needs to
go (email, job portal, government form, social platform, marketplace,
website, print).

### The six differentiators

1.  **Outcome-first processing.** Users describe the result in plain
    English. Tool-first navigation still exists for SEO visitors who
    already know what they want — it is the second path, not the first.
2.  **Exact Requirement Mode.** Not a vague quality slider: users state
    `PDF · max 2 MB` or `JPG · 600×600 minimum`, and we return an
    explicit PASS / FAIL against it. See §4.5.
3.  **Smart Diagnosis.** Dropping a file with no tool selected surfaces
    real findings — size, HEIC compatibility risk, GPS metadata, scanned
    PDF with no text layer — and recommends actions. This makes the
    product feel intelligent *before* any expensive AI is involved.
4.  **One-click Workflows.** Saved chains named after destinations, not
    operations: Job Application Ready, Email Ready, Etsy Ready, LinkedIn
    Ready, Privacy Clean, Web Ready, Print Ready.
5.  **Local-first privacy.** Ordinary conversion, resize, metadata
    removal and PDF work happen in the browser. Lower infrastructure
    cost, real privacy benefit. Cloud/AI steps are always labelled.
6.  **Proof, not "Done."** Every result explains what happened:
    `7.8 MB → 1.87 MB · 76% smaller · PDF preserved · metadata cleaned ·
    Requirement ≤2 MB PASSED`. Confidence instead of download-and-hope.

### Why this is commercially load-bearing

Free SEO tools (Compress PDF, HEIC to JPG, Resize Image, Remove
Background) bring people in. The intelligent layer is why they remember
us. Recurring workflows are why they pay:

-   Free visitor: "Compress this PDF."
-   Returning user: "Make this application-ready."
-   Pro customer: "Apply my Etsy Workflow to these 80 images."

Basic conversion is commoditized. Subscription value comes from
eliminating repeated work, not from owning another JPG-to-PNG converter.

------------------------------------------------------------------------

## Working Product Positioning

**Working concept:** a U.S.-first, all-in-one document and image problem
solver.

**Core promise:** **Drop it. Tell us what you need. Done.**

The product should not feel like a directory of 100 unrelated
converters. It should feel like one intelligent workspace that
understands the user's intended outcome and then chains the necessary
operations automatically.

### Primary jobs to be done

-   Make a PDF or image small enough for an upload limit.
-   Convert a document or image into a compatible format.
-   Remove or replace an image background.
-   Resize assets for a destination such as LinkedIn, Etsy, Amazon,
    YouTube, or email.
-   Merge, split, reorder, rotate, protect, or extract PDF pages.
-   Remove private image/document metadata.
-   OCR a scanned document.
-   Improve or upscale an image.
-   Batch-process many files.
-   Save repeatable multi-step workflows ("Workflows").

------------------------------------------------------------------------

# 1. Product Principles

## 1.1 Outcome-first, not tool-first

Traditional utility sites ask users to understand formats and tools. Our
default experience asks:

> What are you trying to do?

Examples: - "Make this PDF under 2 MB." - "Make these iPhone photos work
on Windows." - "Remove the background and make it Etsy-ready." - "Make
this attachment small enough to email."

The system maps intent to operations.

## 1.2 Instant value before registration

Do not put sign-up in front of the first successful result. Search
visitors should be able to land, upload, process, and download
immediately for free-tier operations.

Account creation appears after value is demonstrated: - Save this
Workflow. - Keep processing history. - Sync presets. - Run larger
batches. - Remove ads. - Unlock premium/AI operations.

## 1.3 Local-first processing

Where technically practical, conversion, resize, compression, metadata
removal, PDF rearrangement, and similar tasks run in the browser.

Benefits: - Lower infrastructure cost. - Faster perceived processing. -
Better privacy. - Better margins. - Easier free-tier economics.

The interface must accurately distinguish: - **On-device processing**
--- file never leaves the browser. - **Secure cloud processing** ---
needed for specific advanced/AI operations.

Never claim local processing for a server-processed task.

## 1.4 One task = one guided micro-onboarding

Do not use a long generic onboarding carousel.

Every tool has an interactive onboarding experience embedded into the
task itself:

1.  **Intent** --- user chooses or types desired result.
2.  **Input** --- drag/drop, paste, browse, or import.
3.  **Diagnosis** --- explain what was detected.
4.  **Recommendation** --- show the proposed fix.
5.  **Control** --- expose only settings relevant to this job.
6.  **Processing** --- clear progress with useful status.
7.  **Proof** --- before/after or result validation.
8.  **Download** --- primary success action.
9.  **Next best action** --- optional related task, Workflow save, or
    upgrade.

A first-time user should learn the product by completing the task, not
by reading instructions.

------------------------------------------------------------------------

# 2. Target Users

## Search-driven consumer

Arrives from Google with an urgent one-time problem. Needs a result in
under a few minutes. Highly ad-monetizable but lower subscription
intent.

## Repeat productivity user

Regularly handles PDFs, images, applications, attachments, school/work
documents, or content. Strong annual subscription candidate.

## Seller / creator

Etsy, eBay, Shopify, Amazon, social media, content creation. Needs batch
processing, presets, background removal, resizing, and repeatable
Workflows.

## Freelancer / small business

Needs reliable document and media workflows, OCR, batch operations,
saved workflows, higher limits, and possibly API access later.

------------------------------------------------------------------------

# 3. Information Architecture

## Global navigation

-   Home
-   PDF
-   Images
-   Documents
-   AI
-   Workflows
-   All Tools
-   Pricing
-   Search / command bar
-   Account

## Core tool families

### PDF

-   Compress PDF
-   Merge PDF
-   Split PDF
-   Reorder PDF
-   Rotate PDF
-   Extract pages
-   Images to PDF
-   PDF to images
-   Add page numbers
-   Watermark
-   Protect PDF
-   Remove metadata
-   OCR PDF (premium/limited)

### Images

-   HEIC to JPG
-   JPG/PNG/WebP/AVIF conversion
-   Compress image
-   Exact-size compressor
-   Resize image
-   Crop/rotate
-   Image to PDF
-   Remove EXIF/GPS
-   Bulk conversion

### AI

-   Remove background
-   Replace background
-   Object removal
-   Upscale
-   Enhance
-   OCR / structured extraction

### SmartFix

Natural-language or guided intent router: - Make upload-ready - Make
email-ready - Make web-ready - Make print-ready - Privacy clean -
Destination presets

### Workflows

Repeatable chains such as: - Etsy Product Image - Amazon Product Image -
Email Attachment - Job Application - LinkedIn Profile - Privacy Clean -
Web Optimize - Scan to Searchable PDF

------------------------------------------------------------------------

# 4. UX/UI System

## 4.1 Visual direction

Use a clean, premium utility aesthetic rather than a "free tools
directory" appearance.

-   Light-first interface with optional dark mode.
-   Strong neutral typography.
-   One restrained brand accent.
-   Large upload target above the fold.
-   Rounded but not toy-like components.
-   Generous whitespace.
-   Minimal decorative illustration.
-   Tool icons should aid scanning, not dominate.
-   Results should visually emphasize measurable outcomes.

## 4.2 Homepage hero

Recommended structure:

**H1:** Drop it. Tell us what you need. Done.

**Supporting copy:** Convert, compress, resize, clean, edit and improve
documents and images without figuring out which tool you need.

**Primary interaction:** - Natural-language command input. - Large
drag/drop zone. - "Browse files." - Clipboard/paste support where
possible.

**Popular intent chips:** - PDF under 2 MB - Remove background - HEIC to
JPG - Make upload-ready - Resize for social - Remove private metadata

Do not lead with "100+ tools." Breadth is supporting proof, not the
differentiator.

## 4.3 Smart diagnosis screen

After upload: - File name/type. - Size. - Dimensions/pages. -
Compatibility notes. - Metadata/privacy warnings where relevant. -
Suggested actions. - Estimated output. - Privacy-processing badge.

Example: \> IMG_8721.HEIC --- 7.8 MB\
\> We found: large file size, HEIC compatibility risk, GPS metadata.\
\> Recommended: Make universally shareable.

## 4.4 Processing experience

Processing must feel active and trustworthy: - Visible step names. -
Determinate progress where possible. - Cancel button. - Do not show fake
progress. - Explain browser vs cloud processing. - Keep user on the task
instead of sending them through multiple pages.

## 4.5 Success screen

The success state is the strongest conversion moment.

Show: - Before → after. - File-size reduction. - Format change. -
Dimensions. - Pages changed. - Metadata removed. - Background
before/after. - Validation such as "1.94 MB --- under your 2 MB limit."

Primary CTA: **Download**

Secondary actions: - Fix another file. - Apply another action. - Save as
Workflow. - Process a batch. - Upgrade when relevant.

------------------------------------------------------------------------

# 5. Interactive Task Onboarding

## First-use principles

No mandatory product tour. Each tool teaches itself.

### Example: Exact-size compression

1.  Landing page already knows intent from SEO URL.
2.  User drops PDF.
3.  Ask: "What size must it be under?" if URL did not specify.
4.  Analyze file.
5.  Display achievable quality estimate.
6.  Process.
7.  Validate result against target.
8.  Show before/after.
9.  Download.
10. Offer batch processing or saved preset to Pro users.

### Example: Background removal

1.  Drop image.
2.  Show immediate low-cost preview when possible.
3.  Interactive before/after slider.
4.  Choices: transparent, white, custom, destination preset.
5.  Download free resolution if within free policy.
6.  Present HD/batch benefits without blocking basic success.

### Example: Etsy Workflow

1.  Ask seller goal, not technical settings.
2.  Upload one sample.
3.  Preview automatic chain.
4.  Allow individual steps to be toggled.
5.  Process.
6.  Show final marketplace-ready output.
7.  Offer "Save Etsy Workflow" after success.
8.  Pro CTA focuses on processing an entire folder in one action.

## Engagement mechanics

Use functional engagement rather than gamification: - Live preview. -
Before/after sliders. - Estimated savings. - "3 issues detected." -
Compatibility score. - Upload requirement pass/fail. - Batch queue. -
Recently used tools. - Smart next action. - Saved Workflow shortcuts.

------------------------------------------------------------------------

# 6. Monetization Architecture

## 6.1 Free / ad-supported

Purpose: maximize SEO acquisition and successful task completion.

Suggested free features: - Core conversions. - Standard PDF
manipulation. - Standard resize/compression. - Metadata removal. -
Reasonable file-size limits. - Limited AI previews/credits. - Limited
batch count.

No account required for basic use.

## 6.2 Pro subscription

Initial pricing should be A/B tested rather than hard-coded into product
assumptions.

Candidate packaging: - Monthly plan. - Discounted annual plan. -
Optional short-duration pass for one-off heavy users.

Pro value: - No ads. - Larger files. - Larger batches. - Saved
Workflows. - Processing history where privacy model permits. - Advanced
OCR. - Higher AI allowance. - Priority cloud queue. - Advanced
compression. - Destination presets. - Multi-step workflows.

## 6.3 AI credits

Meter compute-heavy features separately if unit economics require it: -
HD background removal. - Generative background replacement. - Object
removal. - Upscaling. - Restoration. - Advanced OCR/extraction.

Expose credit consumption before processing.

## 6.4 Business tier later

-   Team seats.
-   Shared Workflows.
-   Higher batch limits.
-   API access.
-   Usage reporting.
-   Commercial workflow presets.
-   Priority support.

------------------------------------------------------------------------

# 7. Advertising Strategy Without Destroying UX

Ads must monetize free search traffic without reducing task completion
or SEO quality.

## Placement rules

Good locations: - One responsive ad below the hero/task input on tool
landing pages. - One ad after explanatory/help content where
appropriate. - One ad in the success page below the download/result
block. - Desktop side rail only when enough width exists. -
Related-tools section.

Avoid: - Ads inside drag/drop zones. - Ads between upload and the main
processing button. - Ads that visually imitate Download buttons. -
Interstitials before the first successful task. - Layout shifts caused
by late-loading ad slots. - Dense above-the-fold ad stacks. - Ads beside
sensitive/private previews where they reduce trust.

Reserve fixed ad dimensions to protect Core Web Vitals.

## Paid experience

All paid tiers are ad-free.

## Ad measurement

Track: - Revenue per thousand sessions. - Ad revenue per tool page. -
Task completion with/without placements. - Bounce rate. - Core Web
Vitals. - Free-to-paid conversion. - Repeat usage.

Optimize for **revenue per successful session**, not maximum ads per
page.

------------------------------------------------------------------------

# 8. SEO Architecture

## 8.1 Search-intent page types

### Format queries

-   /heic-to-jpg
-   /jpg-to-png
-   /pdf-to-jpg
-   /jpg-to-pdf

### Action queries

-   /compress-pdf
-   /resize-image
-   /remove-background
-   /merge-pdf

### Constraint queries

-   /compress-pdf-under-2mb
-   /image-under-1mb
-   /image-under-500kb
-   /reduce-photo-size-for-email

### Destination queries

-   /resize-image-for-etsy
-   /amazon-product-image
-   /linkedin-profile-photo-resizer
-   /youtube-thumbnail-resizer

### Problem queries

-   /iphone-photo-wont-upload
-   /make-pdf-small-enough-to-upload
-   /remove-location-from-photo
-   /convert-heic-for-windows

Every indexable landing page must provide unique intent-specific value
and not be a thin doorway page.

## 8.2 Technical SEO

-   Server-rendered or statically generated indexable landing pages.
-   Unique title, H1, description, explanatory content, FAQs, and
    examples.
-   Canonical URLs.
-   XML sitemaps split by tool family.
-   Breadcrumb structured data.
-   SoftwareApplication/WebApplication structured data where
    appropriate.
-   FAQ structured data only when compliant with current search-engine
    eligibility.
-   Open Graph/social metadata.
-   Fast LCP and low CLS.
-   Semantic HTML.
-   Accessible labels.
-   Internal linking by intent and related workflow.
-   Avoid indexing result/upload URLs and user-specific pages.
-   Robots rules for private/generated content.
-   Automatic redirect/canonical policy for renamed tools.

## 8.3 Programmatic SEO guardrail

Do not publish thousands of near-identical pages by swapping file sizes
or platform names. A generated page ships only when it has: - Distinct
search intent. - Correct tool configuration. - Unique explanatory
value. - A useful interactive experience. - Relevant FAQs/examples. -
Internal links.

------------------------------------------------------------------------

# 9. Recommended Technical Architecture

## Front end

**Next.js + TypeScript** - SSR/SSG for SEO pages. - React for
interactive tools. - App Router. - Progressive enhancement. - Web
Workers for CPU-heavy browser jobs. - PWA capabilities later.

## UI

-   Tailwind CSS.
-   Accessible component primitives.
-   Design tokens for spacing, typography, radius, elevation, and brand
    accent.
-   Motion used sparingly for state transitions.

## Browser processing

Evaluate libraries per task: - PDF manipulation: PDF-lib and/or
WASM-based alternatives. - Image processing: Canvas/WebCodecs/WASM
libraries. - HEIC/AVIF codecs: WASM where browser support is
insufficient. - Metadata: client-side parsers. - ZIP: client-side
compression. - OCR: browser OCR only where performance/quality is
acceptable.

Benchmark quality, licensing, bundle size, memory, and mobile behavior
before committing.

## Backend

Use backend only where required: - Authentication. - Subscription
entitlement. - AI/cloud processing. - Credit ledger. - Usage/abuse
limits. - Saved Workflow synchronization. - Billing webhooks. -
Admin/configuration.

Candidate stack: - Next.js API routes or dedicated Node service. -
PostgreSQL. - Redis only if queues/rate limiting justify it. - Object
storage with short TTL for cloud-processed files. - Queue workers for
compute-heavy jobs.

## Authentication

-   Anonymous first.
-   Passkey/social/email options when account becomes useful.
-   Preserve anonymous task state through sign-up.

## Payments

-   Stripe for web subscriptions and passes.
-   Server-verified entitlements.
-   Webhook-driven subscription state.
-   Idempotent billing events.
-   Customer self-service portal.

## AI/ML

Do not make an LLM part of every operation. - Lightweight intent
classification first. - Deterministic routing when possible. - AI
fallback for ambiguous commands. - Self-host/open models where unit
economics and quality make sense. - Meter GPU/API features.

## Storage/privacy

-   Do not persist local-only files.
-   Cloud jobs use random object IDs.
-   Short automatic deletion TTL.
-   Encryption in transit and at rest.
-   Never log document contents.
-   Strip sensitive metadata from operational logs.
-   Publish plain-language retention rules.

------------------------------------------------------------------------

# 10. Data Model

Core entities:

### User

-   id
-   email/auth provider
-   plan
-   created_at
-   locale

### Subscription

-   provider_customer_id
-   provider_subscription_id
-   status
-   plan
-   renewal date

### CreditLedger

-   user_id
-   amount
-   operation
-   reference
-   timestamp

### Workflow

-   user_id
-   name
-   ordered operations
-   operation parameters
-   visibility
-   created_at

### Job

Only for server-side work: - user_id/anonymous token - operation -
status - input object reference - output object reference - expiry -
metering data - timestamps

### UsageEvent

-   anonymous/user id
-   tool
-   task stage
-   processing mode
-   result
-   duration
-   monetization context

Do not store file contents in analytics.

------------------------------------------------------------------------

# 11. Analytics and Experimentation

## Product funnel

Track: 1. Landing. 2. Tool/intent selected. 3. File selected. 4.
Analysis completed. 5. Processing started. 6. Processing
succeeded/failed. 7. Download clicked. 8. Second task started. 9.
Account created. 10. Paywall viewed. 11. Purchase completed. 12. Repeat
visit.

## North-star metrics

-   Successful processed downloads per weekly active user.
-   Successful task completion rate.
-   Search landing → successful download.
-   7/30-day repeat rate.
-   Revenue per 1,000 organic sessions.
-   Free → paid conversion.
-   Pro retention.
-   Gross margin by operation.

## Key experiments

-   Outcome-first hero vs tool directory.
-   Natural-language command vs popular-task cards.
-   Paywall timing after first vs later success.
-   Monthly/annual/pass packaging.
-   Pro messaging: "no ads" vs "batch + Workflows."
-   Result-page upsells.
-   Ad density.
-   Exact-size landing pages.
-   Destination Workflows.

------------------------------------------------------------------------

# 12. Accessibility

Target WCAG 2.2 AA: - Full keyboard operation. - Visible focus states. -
Screen-reader file input labels. - Progress announcements. - No
color-only statuses. - Sufficient contrast. - Accessible before/after
controls. - Reduced-motion support. - Large touch targets. - Clear error
recovery. - Plain-language processing and privacy notices.

------------------------------------------------------------------------

# 13. Security and Abuse Controls

-   Validate MIME type and file signatures.
-   Reject unsupported/malformed payloads safely.
-   Size/page/pixel limits.
-   Decompression-bomb protection.
-   Sandboxed server processing.
-   Rate limits for anonymous cloud operations.
-   Malware scanning where server-side storage warrants it.
-   CSRF/XSS protections.
-   Content Security Policy.
-   Signed temporary upload/download URLs.
-   Short-lived storage.
-   Secrets management.
-   Dependency/license/security scanning.
-   Billing webhook verification.
-   Abuse controls for compute-intensive endpoints.

------------------------------------------------------------------------

# 14. Performance Targets

-   Mobile-first.
-   Fast first render on SEO landing pages.
-   Lazy-load heavy processing libraries only after tool selection.
-   Run CPU-heavy work in Web Workers.
-   Stream progress where possible.
-   Avoid loading AI libraries on unrelated pages.
-   Reserve ad space to avoid CLS.
-   CDN-cache public assets and static pages.
-   Keep homepage JavaScript lean.

Performance budgets should be enforced in CI.

------------------------------------------------------------------------

# 15. MVP Scope

Do not launch with 100 tools.

## MVP tools

1.  HEIC → JPG.
2.  JPG/PNG/WebP conversion.
3.  Image compression.
4.  Exact image size target.
5.  Image resize.
6.  EXIF/GPS removal.
7.  PDF merge.
8.  PDF split.
9.  PDF reorder/rotate.
10. Images → PDF.
11. PDF → images.
12. Basic PDF compression.
13. Background removal.
14. SmartFix intent router.
15. One destination Workflow.

## MVP business capabilities

-   Anonymous processing.
-   One ad system integration.
-   Stripe subscriptions.
-   Pro entitlements.
-   AI credit ledger if required.
-   Analytics.
-   SEO landing page framework.
-   Admin feature flags.
-   Privacy/deletion controls.

------------------------------------------------------------------------

# 16. Delivery Phases

## Phase 0 --- Validation

-   Finalize brand/domain.
-   Keyword research.
-   Competitor matrix.
-   Interview/test with U.S. users.
-   Prototype homepage and 3 task flows.
-   Validate monetization proposition.

## Phase 1 --- Foundation

-   Repository, CI/CD, environments.
-   Design system.
-   SEO page framework.
-   Analytics schema.
-   Upload/drop architecture.
-   Local processing worker framework.
-   Security baseline.

## Phase 2 --- Core image tools

-   Conversion.
-   Compression.
-   Exact-size output.
-   Resize.
-   metadata removal.
-   HEIC.
-   Batch architecture.

## Phase 3 --- Core PDF tools

-   Merge.
-   Split.
-   reorder.
-   rotate.
-   extract.
-   image/PDF conversion.
-   compression.

## Phase 4 --- SmartFix

-   File diagnosis.
-   Intent parser.
-   operation planner.
-   recommendation UI.
-   multi-step execution.
-   result validation.

## Phase 5 --- Monetization

-   Ads.
-   subscriptions.
-   passes if selected.
-   credits.
-   entitlement middleware.
-   paywall experiments.

## Phase 6 --- AI + Workflows

-   Background removal.
-   first destination Workflows.
-   saved workflows.
-   batch Pro workflows.

## Phase 7 --- SEO expansion

Expand only after measuring real demand: - constraint pages. -
destination pages. - problem pages. - supporting educational content. -
internal linking.

## Phase 8 --- Scale

-   Business tier.
-   team workflows.
-   API.
-   browser extension.
-   additional document/media formats based on demand.

------------------------------------------------------------------------

# 17. Definition of MVP Success

Before adding dozens of tools, the MVP should demonstrate: - Users can
understand the proposition without explanation. - First-time task
completion is high. - Search landing pages convert to successful
downloads. - Processing costs remain within target margin. - At least
one workflow produces meaningful repeat usage. - Ads monetize free
traffic without materially harming completion. - Some users pay for
convenience, batch work, Workflows, or premium processing. - Organic pages
begin earning impressions/clicks. - Error rates and mobile performance
are acceptable.

The product earns expansion through data rather than tool-count vanity.
