/**
 * Per-tool landing page content and configuration.
 *
 * plan.md §8.3 sets the bar for shipping a page: distinct search intent, correct
 * tool configuration, unique explanatory value, a useful interactive
 * experience, relevant FAQs and internal links. Everything except the links
 * lives here, and the links come from the registry.
 *
 * Copy is written per tool on purpose. Templated filler with the format name
 * swapped in is exactly the thin doorway page the guardrail exists to prevent.
 */

import type { ActionHint } from "@/lib/intent";
import type { FaqEntry } from "@/lib/seo";
import type { Requirement } from "@/lib/requirement";
import type { LeadOperation } from "@/lib/useFilePipeline";

/**
 * One destination in a "target job" tool — plan.md's "offer destination
 * presets before raw dimensions". The requirement is ours, not the
 * platform's fine print, so `note` must read as a recommendation and never
 * as a quoted spec (§ "never claim an unverified platform fact").
 */
export type DestinationOption = {
  id: string;
  label: string;
  requirement: Requirement;
  note: string;
};

/**
 * What the page asks the user before it can act (§5: "expose only settings
 * relevant to this job"). Most tools ask nothing — the URL already carries the
 * intent.
 */
export type ToolPreset =
  | { kind: "fixed"; requirement: Requirement }
  | {
      kind: "size";
      label: string;
      hint: string;
      defaultBytes: number;
      requirement?: Requirement;
    }
  | {
      kind: "dimensions";
      label: string;
      hint: string;
      defaultWidth: number;
      defaultHeight: number;
    }
  | {
      kind: "destination";
      label: string;
      hint: string;
      options: readonly DestinationOption[];
    }
  | { kind: "transform" }
  /** Per-page PDF editing — mode controls which controls are shown. */
  | { kind: "pages"; mode: "organize" | "split" | "extract" | "delete" }
  /** Whole-document rotate — every page turned by the same amount, no page list needed. */
  | { kind: "pdf-rotate" }
  /** A single text field, stamped across the image once non-empty. */
  | { kind: "watermark"; label: string; hint: string; placeholder: string }
  /** Natural-language outcome instead of a preset value — the homepage console, on its own page. */
  | { kind: "smartfix" };

export type ToolContent = {
  h1: string;
  metaTitle: string;
  metaDescription: string;
  /** Two or three sentences of genuinely tool-specific explanation. */
  intro: string;
  preset: ToolPreset;
  /** `accept` attribute for the file input. */
  accept: string;
  /** Present only for tools that combine several files into one, e.g. merge. */
  lead?: LeadOperation;
  /** Fixed action hints the page always wants, e.g. remove-background. */
  actions?: readonly ActionHint[];
  faqs: FaqEntry[];
};

const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";
const PDF_ACCEPT = "application/pdf,.pdf";
const ALL_ACCEPT = `${PDF_ACCEPT},${IMAGE_ACCEPT},image/heic,image/heif,.heic,.heif`;

export const toolContent: Record<string, ToolContent> = {
  // -------------------------------------------------------------------------
  "heic-to-jpg": {
    h1: "Convert HEIC to JPG",
    metaTitle: "Convert HEIC to JPG — iPhone photos that open anywhere",
    metaDescription:
      "Turn iPhone HEIC photos into JPGs that Windows, websites and older apps can actually open. Converts in your browser.",
    intro:
      "Since iOS 11, iPhones save photos as HEIC to halve the file size at the same quality. The trade-off shows up the moment you leave Apple's ecosystem: Windows needs a codec from the Microsoft Store, and plenty of upload forms simply reject the file without saying why. Converting to JPG costs you a little file size and fixes all of it. Your photos are decoded here in the browser, so nothing is uploaded.",
    preset: { kind: "fixed", requirement: { format: "jpg" } },
    accept: "image/heic,image/heif,.heic,.heif",
    faqs: [
      {
        question: "Why won't my iPhone photo upload to this website?",
        answer:
          "Almost always because it is a HEIC file. Many upload forms accept only JPG and PNG, and some reject HEIC without explaining. Converting to JPG resolves it. Drop the photo above and we will confirm what format it actually is before converting.",
      },
      {
        question: "Will I lose quality converting HEIC to JPG?",
        answer:
          "There is one round of JPEG compression, which we run at high quality — for a normal photo it is not visible. The JPG will usually be larger than the HEIC, because HEIC is simply a more efficient format.",
      },
      {
        question: "Can I stop my iPhone making HEIC files in the first place?",
        answer:
          "Yes. Settings → Camera → Formats → Most Compatible switches the camera to JPG permanently. That only affects photos taken afterwards, so anything already in your library still needs converting.",
      },
      {
        question: "Does converting remove the location data?",
        answer:
          "Yes. We rebuild the photo from its pixels, so GPS coordinates and camera details do not survive the conversion. If that is your main concern and you want to keep the original format, use our metadata removal tool instead.",
      },
      {
        question: "Are my photos uploaded to a server?",
        answer:
          "No. The conversion runs entirely in your browser. On iPhone and Mac, Safari decodes HEIC itself; on other browsers we load an open-source decoder into the page. Either way the photo stays on your device.",
      },
    ],
  },

  // -------------------------------------------------------------------------
  "compress-image": {
    h1: "Compress an image",
    metaTitle: "Compress an image to any size you need",
    metaDescription:
      "Set the exact file size you need and compress a JPG, PNG or WebP down to it in your browser. Nothing is uploaded.",
    intro:
      "Most compressors give you a quality slider and leave you guessing which setting lands under the limit you were given. This one works the other way round: you say how small the file has to be, and we search for the highest quality that still fits. If the target cannot be reached by quality alone, we reduce the pixel dimensions rather than quietly returning something too big.",
    preset: {
      kind: "size",
      label: "How small does it need to be?",
      hint: "We will use the best quality that still fits under this.",
      defaultBytes: 1_000_000,
    },
    accept: IMAGE_ACCEPT,
    faqs: [
      {
        question: "Will compressing ruin the image?",
        answer:
          "We always start at high quality and only reduce it as far as your size limit forces. If the file already fits, we leave it alone entirely rather than re-encoding it for no reason. You see the before and after sizes before you download.",
      },
      {
        question: "Why did the dimensions change?",
        answer:
          "Only if they had to. Below roughly 30% quality, JPEG artefacts become more damaging than a smaller image, so past that point we scale the picture down instead. The result screen tells you the final dimensions.",
      },
      {
        question: "Does compressing a PNG work the same way?",
        answer:
          "No. PNG is lossless and has no quality setting, so the only way to make one smaller is to reduce its dimensions. If you need a big size reduction and do not need transparency, converting to JPG will usually do far better.",
      },
    ],
  },

  // -------------------------------------------------------------------------
  "image-under-1mb": {
    h1: "Make an image under 1 MB",
    metaTitle: "Compress an image to under 1 MB",
    metaDescription:
      "Get any photo under a hard 1 MB limit and see it verified against that limit before you download.",
    intro:
      "A 1 MB cap is common on government forms, older web portals and school upload pages — and they usually reject the file without telling you how far over you were. Drop the photo here and we will bring it under 1 MB, then show you the finished size checked against that limit so you know it will be accepted before you try.",
    preset: { kind: "fixed", requirement: { maxBytes: 1_000_000 } },
    accept: IMAGE_ACCEPT,
    faqs: [
      {
        question: "Is 1 MB 1,000,000 bytes or 1,048,576?",
        answer:
          "We target 1,000,000 bytes, the stricter of the two. A form that means 1,048,576 will accept that as well, so this is the safe reading of the limit.",
      },
      {
        question: "What if my photo cannot get under 1 MB?",
        answer:
          "We reduce quality first, then dimensions, and we will tell you plainly if we still could not reach the target rather than showing a pass. You will still get the smallest version we managed.",
      },
      {
        question: "Do you keep a copy of the photo?",
        answer:
          "No. The compression runs inside your browser using your own device's processor. The image is never sent to us, so there is nothing for us to keep.",
      },
    ],
  },

  // -------------------------------------------------------------------------
  "image-under-2mb": {
    h1: "Make an image under 2 MB",
    metaTitle: "Compress an image to under 2 MB",
    metaDescription:
      "Hit a 2 MB upload limit exactly, with the finished file checked against the limit before you download.",
    intro:
      "2 MB is the most common ceiling on job portals and application forms. Phone photos routinely arrive at four or five times that, so the usual fix is to guess at a quality slider and re-upload until something sticks. Set the file down here instead and we will land it under 2 MB in one pass, at the best quality that fits.",
    preset: { kind: "fixed", requirement: { maxBytes: 2_000_000 } },
    accept: IMAGE_ACCEPT,
    faqs: [
      {
        question: "The form says 2 MB but still rejects my file. Why?",
        answer:
          "Some forms also cap pixel dimensions, or count the whole submission rather than the single file. Check whether the page states a maximum width and height as well — you can set those on our resize tool before compressing.",
      },
      {
        question: "Will the photo still be readable?",
        answer:
          "For a typical phone photo, 2 MB is generous and the result is usually indistinguishable. We show the before and after side by side so you can judge before downloading.",
      },
      {
        question: "Can I do several photos at once?",
        answer:
          "Not yet — batch processing is on the way. For now each photo runs on its own, and 'Fix another file' keeps your settings so it is quick to repeat.",
      },
    ],
  },

  // -------------------------------------------------------------------------
  "reduce-photo-size-for-email": {
    h1: "Make a photo small enough to email",
    metaTitle: "Reduce photo size for email attachments",
    metaDescription:
      "Shrink photos so they send without bouncing. Set your provider's limit and we handle the rest, in your browser.",
    intro:
      "Mail providers differ: Gmail and Outlook both cap a message at around 25 MB in total, but many workplace mail servers are far stricter, and the limit applies to everything attached, not each photo. Picking a target of a few megabytes per photo keeps you clear of all of them and makes the message quicker for the recipient to download.",
    preset: {
      kind: "size",
      label: "Target size per photo",
      hint: "Around 2–5 MB per photo keeps most mail servers happy.",
      defaultBytes: 3_000_000,
    },
    accept: IMAGE_ACCEPT,
    faqs: [
      {
        question: "What size should I actually pick?",
        answer:
          "If you are attaching one photo, 5 MB is comfortable. For several in one message, divide your provider's limit by the number of photos and leave headroom — attachments are encoded for transport, which adds roughly a third to the size in transit.",
      },
      {
        question: "Why did my 20 MB email bounce when the limit is 25 MB?",
        answer:
          "Attachments are base64-encoded when sent, which inflates them by about 33%. A 20 MB attachment travels as roughly 27 MB, over the limit. Compressing before you attach avoids the problem entirely.",
      },
      {
        question: "Should I zip the photos instead?",
        answer:
          "It rarely helps. JPEG and PNG are already compressed, so zipping typically saves a few percent while making the message harder for the recipient to open on a phone.",
      },
    ],
  },

  // -------------------------------------------------------------------------
  "resize-image": {
    h1: "Resize an image",
    metaTitle: "Resize an image to exact dimensions",
    metaDescription:
      "Resize a photo to the exact pixel dimensions you were asked for, checked against them before you download.",
    intro:
      "When a platform asks for exact dimensions, close is not good enough — it will either reject the upload or crop it for you, usually badly. Enter the width and height you were given and we resize to precisely that, then verify the finished image really is those dimensions rather than assuming the operation worked.",
    preset: {
      kind: "dimensions",
      label: "Required dimensions",
      hint: "The exact width and height the destination asked for.",
      defaultWidth: 1280,
      defaultHeight: 720,
    },
    accept: IMAGE_ACCEPT,
    faqs: [
      {
        question: "Will this stretch my image?",
        answer:
          "If the dimensions you enter have a different shape to the original, yes — we do exactly what you asked for. If you need to keep the proportions, pick a width and height in the same ratio as the original, which the diagnosis panel shows you when you drop the file.",
      },
      {
        question: "Can I make a small image bigger?",
        answer:
          "You can, but enlarging cannot recover detail that was never captured, so the result will look soft. We say so rather than pretending otherwise. Genuine upscaling needs AI processing, which is not enabled yet.",
      },
      {
        question: "Does resizing reduce the file size too?",
        answer:
          "Usually a lot, since file size scales roughly with pixel count. If you have a specific size limit as well as dimensions, our compression tools will hit both.",
      },
    ],
  },

  // -------------------------------------------------------------------------
  "profile-picture-resizer": {
    h1: "Resize a profile picture",
    metaTitle: "Profile Picture Resizer — LinkedIn, Instagram, X, WhatsApp and more",
    metaDescription:
      "Pick the platform your photo is going to and get a square profile picture sized and formatted for it, in your browser.",
    intro:
      "Every platform crops a profile photo to a circle or square and expects a minimum size to stay sharp — but hunting down the exact pixel spec is exactly the kind of chore this tool exists to skip. Pick your destination below and we resize to a square at the right size for it, then convert to JPG. The sizes are our own sensible defaults for each platform rather than a quoted spec, so they are generous enough to look sharp even if a platform's exact number has changed.",
    preset: {
      kind: "destination",
      label: "Where is this photo going?",
      hint: "Pick a platform to size the photo for it.",
      options: [
        {
          id: "linkedin",
          label: "LinkedIn",
          requirement: { exactWidth: 400, exactHeight: 400, format: "jpg", stripMetadata: true },
          note: "400×400 — sharp at LinkedIn's display size and its larger banner-page view.",
        },
        {
          id: "instagram",
          label: "Instagram",
          requirement: { exactWidth: 320, exactHeight: 320, format: "jpg", stripMetadata: true },
          note: "320×320 — Instagram displays it small, but this stays crisp when tapped to view full-size.",
        },
        {
          id: "facebook",
          label: "Facebook",
          requirement: { exactWidth: 320, exactHeight: 320, format: "jpg", stripMetadata: true },
          note: "320×320 — comfortably above Facebook's own display size on any device.",
        },
        {
          id: "x",
          label: "X (Twitter)",
          requirement: { exactWidth: 400, exactHeight: 400, format: "jpg", stripMetadata: true },
          note: "400×400 — X's own recommended profile photo size.",
        },
        {
          id: "whatsapp",
          label: "WhatsApp",
          requirement: { exactWidth: 500, exactHeight: 500, format: "jpg", stripMetadata: true },
          note: "500×500 — sharp in chat headers and the full-screen profile view.",
        },
        {
          id: "youtube",
          label: "YouTube",
          requirement: { exactWidth: 800, exactHeight: 800, format: "jpg", stripMetadata: true },
          note: "800×800 — Google's own guidance for a channel picture.",
        },
        {
          id: "discord",
          label: "Discord",
          requirement: { exactWidth: 512, exactHeight: 512, format: "jpg", stripMetadata: true },
          note: "512×512 — matches the size Discord itself recommends uploading at.",
        },
        {
          id: "github",
          label: "GitHub",
          requirement: { exactWidth: 500, exactHeight: 500, format: "jpg", stripMetadata: true },
          note: "500×500 — sharp as a GitHub avatar at any size it is shown.",
        },
      ],
    },
    accept: IMAGE_ACCEPT,
    faqs: [
      {
        question: "Will my photo be cropped to a square?",
        answer:
          "No — we resize to exactly the square size chosen, which stretches a non-square photo rather than cropping it. For a good result, start from a photo that's already close to square, or crop it to the part you want kept first. A dedicated crop tool is on the way for this.",
      },
      {
        question: "Are these the platform's official required sizes?",
        answer:
          "They're our own recommended defaults, chosen to be sharp at how each platform actually displays a profile photo — not a copy of a page we're claiming is current. Platforms change these numbers without much notice, so if a specific pixel size is stated in your account settings, use that instead.",
      },
      {
        question: "Why JPG for every platform?",
        answer:
          "It's accepted everywhere in the list above and keeps the file small. None of these platforms need transparency in a profile photo, so there's no reason to keep a larger PNG.",
      },
      {
        question: "Does this remove metadata from the photo too?",
        answer:
          "Yes. A profile photo is public by definition, so we strip location and device data as part of the resize — nothing extra to remember.",
      },
    ],
  },

  // -------------------------------------------------------------------------
  "crop-image": {
    h1: "Crop and rotate an image",
    metaTitle: "Crop and rotate an image online",
    metaDescription:
      "Rotate a sideways photo and crop it to a square, portrait or widescreen shape, entirely in your browser.",
    intro:
      "Rotate fixes a photo that came in sideways or upside down. Cropping trims it to a shape — square for a profile photo, 16:9 for a video thumbnail, 9:16 for a story — by keeping the largest centred rectangle of that shape and discarding the rest. Nothing is stretched: the crop always removes the extra edge rather than distorting the picture to fit.",
    preset: { kind: "transform" },
    accept: IMAGE_ACCEPT,
    faqs: [
      {
        question: "Can I choose exactly what part of the photo gets kept?",
        answer:
          "Not yet — the crop is always centred on the photo. If the part you need isn't in the middle, crop closer to it first in your phone or photo app, then use this tool for the final shape.",
      },
      {
        question: "Will cropping distort my photo?",
        answer:
          "No. Cropping only trims — it never stretches or squashes pixels. If you need an exact width and height instead of a shape, our resize tool does stretch to fit, and says so.",
      },
      {
        question: "Can I rotate and crop at the same time?",
        answer:
          "Yes. Rotation runs first, then the crop is applied to the rotated image, so a photo taken sideways still crops to the right shape.",
      },
      {
        question: "Does this work on PDFs?",
        answer:
          "No, this tool is for photos and images. To rotate or reorder pages inside a PDF, use Organize PDF instead.",
      },
    ],
  },

  // -------------------------------------------------------------------------
  "watermark-image": {
    h1: "Add a watermark to an image",
    metaTitle: "Add a text watermark to a photo",
    metaDescription:
      "Stamp a repeating text watermark across a photo before you share it online — runs entirely in your browser.",
    intro:
      "A photo posted without a mark is easy for anyone to lift and reuse as their own. Type the text you want stamped across the image \u2014 your name, a business name, or a website \u2014 and we tile it diagonally across the photo so cropping out one copy still leaves others visible.",
    preset: {
      kind: "watermark",
      label: "Watermark text",
      hint: "Shown repeated and semi-transparent across the photo.",
      placeholder: "\u00a9 Your name",
    },
    accept: IMAGE_ACCEPT,
    faqs: [
      {
        question: "Can I control where the watermark goes?",
        answer:
          "Not yet \u2014 it tiles diagonally across the whole photo at a size that scales with the image, which is deliberately hard to crop out in one cut.",
      },
      {
        question: "Will the watermark survive someone cropping the photo?",
        answer:
          "Usually at least one copy will, since the text repeats across the full image rather than sitting once in a corner. No watermark is uncroppable, but a repeating one is far harder to remove cleanly.",
      },
      {
        question: "Does this work on transparent PNGs?",
        answer:
          "Yes \u2014 the watermark draws over the existing pixels, transparent areas included, and the file stays a PNG.",
      },
    ],
  },

  // -------------------------------------------------------------------------
  "jpg-to-png": {
    h1: "Convert JPG to PNG",
    metaTitle: "Convert JPG to PNG",
    metaDescription:
      "Convert JPG photos to PNG in your browser. No upload, no watermark, no sign-up.",
    intro:
      "PNG is lossless, so converting a JPG to PNG stops any further quality loss from that point on — useful if you are about to edit and re-save the image several times. It will not restore detail the original JPG already discarded, and the PNG will almost always be larger, often several times so.",
    preset: { kind: "fixed", requirement: { format: "png" } },
    accept: "image/jpeg,.jpg,.jpeg",
    faqs: [
      {
        question: "Will converting to PNG improve the quality?",
        answer:
          "No. Whatever the JPG threw away is gone for good. PNG simply stops any further loss, which matters if the image is going through more editing rounds.",
      },
      {
        question: "Why is the PNG so much bigger?",
        answer:
          "PNG stores every pixel exactly, while JPG approximates. For photographs, PNG is typically two to five times larger. For flat graphics, logos and screenshots, PNG can actually be smaller.",
      },
      {
        question: "Does the PNG have a transparent background?",
        answer:
          "No. JPG cannot store transparency, so there is none to carry over. Removing a background is a separate operation.",
      },
    ],
  },

  // -------------------------------------------------------------------------
  "png-to-jpg": {
    h1: "Convert PNG to JPG",
    metaTitle: "Convert PNG to JPG",
    metaDescription:
      "Turn PNG images into smaller, universally accepted JPGs, entirely in your browser.",
    intro:
      "PNG files of photographs are often several times larger than they need to be, and some upload forms accept JPG only. Converting fixes both. The one thing to know: JPG has no transparency, so any transparent areas have to become a solid colour — we fill them with white, which is what you want for a printed page or a document.",
    preset: { kind: "fixed", requirement: { format: "jpg" } },
    accept: "image/png,.png",
    faqs: [
      {
        question: "What happens to transparent areas?",
        answer:
          "They become white. JPG has no alpha channel, so transparency cannot be preserved. If you need it, stay with PNG or use WebP, which supports both transparency and strong compression.",
      },
      {
        question: "How much smaller will the JPG be?",
        answer:
          "For photographs, usually 60–90% smaller. For screenshots, logos or anything with large flat areas of colour and sharp text, the saving is smaller and the text can look fuzzy — PNG is the better format for those.",
      },
      {
        question: "Is the conversion lossy?",
        answer:
          "Yes. JPG is a lossy format, so some detail is discarded. We convert at high quality, and you can see the resulting file size before you download.",
      },
    ],
  },

  // -------------------------------------------------------------------------
  "webp-converter": {
    h1: "Convert images to WebP",
    metaTitle: "Convert JPG and PNG to WebP",
    metaDescription:
      "Convert images to WebP for faster page loads, without uploading anything.",
    intro:
      "WebP typically produces files 25–35% smaller than JPG at matching quality, and unlike JPG it supports transparency. Every current browser reads it, which makes it a straightforward default for images on a website. It is a poorer choice for a file you are sending to someone else, since some desktop software and older print workflows still will not open it.",
    preset: { kind: "fixed", requirement: { format: "webp" } },
    accept: IMAGE_ACCEPT,
    faqs: [
      {
        question: "Will WebP work everywhere?",
        answer:
          "In browsers, effectively yes — Chrome, Safari, Firefox and Edge have all supported it for years. Outside the browser it is patchier: some older desktop applications, print shops and document systems still reject it.",
      },
      {
        question: "Should I use WebP or JPG for my website?",
        answer:
          "WebP, in most cases. It is meaningfully smaller at the same quality, which improves page load and Core Web Vitals. Keep JPG for anything a visitor might download and open in other software.",
      },
      {
        question: "Does WebP support transparency?",
        answer:
          "Yes, unlike JPG. That makes it a good replacement for PNG logos and graphics, where it is often dramatically smaller.",
      },
    ],
  },

  // -------------------------------------------------------------------------
  "remove-location-from-photo": {
    h1: "Remove location data from a photo",
    metaTitle: "Remove GPS and EXIF data from a photo",
    metaDescription:
      "Strip GPS coordinates and camera metadata from photos before you share them. Runs in your browser.",
    intro:
      "Phones record where a photo was taken directly inside the file, along with the device model, the exact time and often the camera's serial number. Anyone who receives the original can read all of it. Some social networks strip this on upload, but marketplace listings, email attachments, forums and cloud links routinely do not. Drop a photo here and we will tell you whether it carries location data, then remove it.",
    preset: { kind: "fixed", requirement: { stripMetadata: true } },
    accept: IMAGE_ACCEPT,
    faqs: [
      {
        question: "How do I know whether my photo has location data?",
        answer:
          "Drop it above. We read the file's EXIF block in your browser and report whether a GPS record is present before you do anything. If we cannot inspect the format, we say that rather than claiming the photo is clean.",
      },
      {
        question: "What exactly gets removed?",
        answer:
          "All of it. We rebuild the image from its pixels alone, so GPS coordinates, camera make and model, serial numbers, timestamps, software details and any embedded thumbnail are gone. The picture is unchanged.",
      },
      {
        question: "Does taking a screenshot of the photo do the same job?",
        answer:
          "It removes the metadata, yes, but it also loses resolution and re-compresses the image. This keeps the full picture quality and strips only the hidden data.",
      },
      {
        question: "Do social networks already remove this?",
        answer:
          "Most large platforms strip EXIF when you post. Marketplace listings, forums, email attachments, messaging apps that send 'as a file', and shared cloud links often do not — which is where photos most commonly leak a home address.",
      },
    ],
  },

  // -------------------------------------------------------------------------
  "remove-background": {
    h1: "Remove the background from an image",
    metaTitle: "Remove image background — cut out the subject",
    metaDescription:
      "Cut a subject out of a photo and export it on a transparent background. Cloud-processed, paid feature.",
    intro:
      "This cuts a subject out of a photo and gives you back a PNG with a transparent background — for product shots, headshots or anything you need to drop onto a different background. The photo is sent to a cloud provider to do the cutout, so it is not processed on your device like the rest of this site, and it is a paid feature: sign in on a Daily, Weekly, Pro or Business plan to run it.",
    preset: { kind: "fixed", requirement: {} },
    actions: ["remove-background"],
    accept: IMAGE_ACCEPT,
    faqs: [
      {
        question: "Why does this cost money when the other tools are free?",
        answer:
          "Every other tool on this site runs in your browser, so a file never leaves your device and there is no per-file cost to us. Background removal uses a cloud AI provider that charges per image, so it is gated to paid plans rather than funded by ads.",
      },
      {
        question: "What file types can I use?",
        answer: "JPG, PNG and WebP, up to 12 MB. HEIC is not supported by the background-removal provider yet.",
      },
      {
        question: "Is the photo stored anywhere?",
        answer:
          "It is sent to the background-removal provider to process the request and is not stored by this site afterwards. See the provider's own retention policy for how long they keep it on their side.",
      },
      {
        question: "Can I choose the background color instead of transparent?",
        answer: "Not yet — today this always returns a transparent PNG cutout.",
      },
    ],
  },

  // -------------------------------------------------------------------------
  "merge-pdf": {
    h1: "Merge PDF files",
    metaTitle: "Merge PDF files into one document",
    metaDescription:
      "Combine two or more PDFs into a single file, in the order you choose. Runs entirely in your browser.",
    intro:
      "Application packets, scanned forms and multi-part reports usually need to arrive as one file, not five attachments. Drop your PDFs here, put them in the order the pages should appear, and we build a single combined document from them — nothing leaves your browser to do it.",
    preset: { kind: "fixed", requirement: {} },
    accept: PDF_ACCEPT,
    lead: {
      id: "merge-pdf",
      title: "Merge into one PDF",
      reason: "Combines every file above into a single document, in this order.",
      tool: "merge-pdf",
      minFiles: 2,
    },
    faqs: [
      {
        question: "Can I change the order after adding the files?",
        answer:
          "Yes. Each file in the list has buttons to move it earlier or later — the numbered order is exactly the page order in the finished PDF.",
      },
      {
        question: "Is there a limit to how many PDFs I can merge?",
        answer:
          "Practically, no — the limit is your browser's memory and a combined document capped at 5,000 pages, which is far beyond any normal use case.",
      },
      {
        question: "What happens to each file's metadata?",
        answer:
          "The merged PDF gets fresh document properties; the page content itself is untouched. If you need author or software details removed too, run it through our metadata remover afterward.",
      },
      {
        question: "Will this work on a password-protected PDF?",
        answer:
          "No — an encrypted file cannot be read without its password. Remove the password in the application that created it, then merge.",
      },
    ],
  },

  // -------------------------------------------------------------------------
  "image-to-pdf": {
    h1: "Convert images to PDF",
    metaTitle: "Combine images into a single PDF",
    metaDescription:
      "Turn one or more photos or scans into a single ordered PDF, entirely in your browser.",
    intro:
      "A form that asks for 'one PDF' will not accept five separate JPGs, which is the most common reason a photo submission or scanned application gets rejected. Drop your images here in the order they should appear and we build one PDF with each image as its own page, sized to fit.",
    preset: { kind: "fixed", requirement: {} },
    accept: IMAGE_ACCEPT,
    lead: {
      id: "images-to-pdf",
      title: "Combine into one PDF",
      reason: "Each image becomes its own page, in this order.",
      tool: "image-to-pdf",
    },
    faqs: [
      {
        question: "Can I mix JPG, PNG and other formats in one PDF?",
        answer:
          "Yes. Every image is placed on its own page regardless of its original format, and the page order matches your list.",
      },
      {
        question: "Will the pages be cropped or stretched?",
        answer:
          "No. Each page is sized to match its image exactly, so nothing is cropped, stretched or letterboxed.",
      },
      {
        question: "Can I convert a HEIC photo straight to a PDF page?",
        answer:
          "Yes — HEIC is decoded like any other image before being placed on the page, so iPhone photos work without a separate conversion step first.",
      },
      {
        question: "Does this remove the photos' location data?",
        answer:
          "Yes. Building the PDF re-encodes each image from its pixels, which drops EXIF and GPS data along the way.",
      },
    ],
  },

  // -------------------------------------------------------------------------
  "pdf-remove-metadata": {
    h1: "Remove PDF metadata",
    metaTitle: "Remove author, software and metadata from a PDF",
    metaDescription:
      "Clear the author, software and revision history hidden inside a PDF's document properties, in your browser.",
    intro:
      "Every PDF carries document properties alongside the pages you see — often the author's real name, the software and version that created it, and sometimes a modification history. Word and Google Docs both write this in by default. Drop a PDF here and we clear it before you send it anywhere the details shouldn't travel.",
    preset: { kind: "fixed", requirement: { stripMetadata: true } },
    accept: PDF_ACCEPT,
    faqs: [
      {
        question: "What exactly gets removed?",
        answer:
          "The document's Info dictionary — title, author, subject, keywords, producer and creator — plus any XMP metadata packet attached to the file. The pages and their content are untouched.",
      },
      {
        question: "Does this remove metadata from images inside the PDF?",
        answer:
          "No — this clears the document's own properties, not metadata embedded in individual images on the page. That is a separate concern for the images themselves before they were placed in the PDF.",
      },
      {
        question: "Will the PDF still look and print the same?",
        answer:
          "Yes. Nothing about the visible pages changes — only the hidden document properties are cleared.",
      },
      {
        question: "Does this work on a password-protected PDF?",
        answer:
          "No. An encrypted file needs its password removed first, in the application that created it, before we can read or rewrite it.",
      },
    ],
  },

  // -------------------------------------------------------------------------
  "split-pdf": {
    h1: "Split a PDF",
    metaTitle: "Split a PDF by removing pages you do not need",
    metaDescription:
      "Pick the pages to keep and save them as a new, smaller PDF. Runs in your browser.",
    intro:
      "When a form only needs part of a document, sending the full file just adds friction. This tool starts from your current PDF and lets you remove the pages you do not need, then saves the selected pages as a fresh PDF you can submit.",
    preset: { kind: "pages", mode: "split" },
    accept: PDF_ACCEPT,
    lead: {
      id: "organize-pdf",
      title: "Save split PDF",
      reason: "Keeps the pages left in the list and removes the rest.",
      tool: "split-pdf",
    },
    faqs: [
      {
        question: "Does this create many files or one file?",
        answer:
          "This release saves one output PDF containing the pages you kept. Multi-output splitting is on the roadmap.",
      },
      {
        question: "Can I change the page order while splitting?",
        answer:
          "For reordering, use Organize PDF. Split PDF is focused on selecting which pages stay.",
      },
      {
        question: "Will page quality change?",
        answer:
          "No. Pages are copied as-is; we only change which pages are present in the final file.",
      },
    ],
  },

  // -------------------------------------------------------------------------
  "extract-pdf": {
    h1: "Extract pages from a PDF",
    metaTitle: "Extract selected pages from a PDF",
    metaDescription:
      "Keep only the pages you want and save them as a new PDF, without uploading your file.",
    intro:
      "Use this when you need just a few pages from a longer PDF. Remove every page you do not need, then save what remains as its own document.",
    preset: { kind: "pages", mode: "extract" },
    accept: PDF_ACCEPT,
    lead: {
      id: "organize-pdf",
      title: "Save extracted pages",
      reason: "Builds a new PDF from the pages left in the list.",
      tool: "extract-pdf",
    },
    faqs: [
      {
        question: "How is this different from Split PDF?",
        answer:
          "Both keep selected pages in one output file. Extract is phrased for the common \"I only need pages X and Y\" workflow.",
      },
      {
        question: "Can I extract pages from a protected PDF?",
        answer:
          "Not directly. Remove the password first, then extract pages here.",
      },
      {
        question: "Will metadata be removed too?",
        answer:
          "No. This tool changes pages only. Use Remove PDF metadata if you also need privacy cleanup.",
      },
    ],
  },

  // -------------------------------------------------------------------------
  "delete-pdf-pages": {
    h1: "Delete pages from a PDF",
    metaTitle: "Delete pages from a PDF online",
    metaDescription:
      "Remove unwanted pages from a PDF and save the cleaned version in your browser.",
    intro:
      "Draft pages, duplicate scans, and cover sheets are common reasons a PDF gets rejected or looks unprofessional. Remove the pages you do not want and save a cleaner final document.",
    preset: { kind: "pages", mode: "delete" },
    accept: PDF_ACCEPT,
    lead: {
      id: "organize-pdf",
      title: "Save cleaned PDF",
      reason: "Applies your removed-page list and keeps the rest.",
      tool: "delete-pdf-pages",
    },
    faqs: [
      {
        question: "Can I undo if I remove the wrong page?",
        answer:
          "Yes. Use the restore control if the list becomes empty, or start over and re-select pages.",
      },
      {
        question: "Will this compress the file too?",
        answer:
          "Sometimes a little, because fewer pages remain, but it is not a compression tool.",
      },
      {
        question: "Does deleting pages affect readability or print quality?",
        answer:
          "No. Remaining pages are copied without visual changes.",
      },
    ],
  },

  // -------------------------------------------------------------------------
  "organize-pdf": {
    h1: "Organize PDF pages",
    metaTitle: "Reorder, rotate and delete PDF pages",
    metaDescription:
      "Put pages in the right order, rotate the ones that came in sideways, and drop the ones you don't need — all in your browser.",
    intro:
      "Scans rarely come out in the right order, and a page fed in sideways stays sideways until someone fixes it. Drop a PDF here and every page appears in a numbered list: move pages up or down, rotate individual pages a quarter turn at a time, and remove any you don't want in the final document.",
    preset: { kind: "pages", mode: "organize" },
    accept: PDF_ACCEPT,
    lead: {
      id: "organize-pdf",
      title: "Save page changes",
      reason: "Applies the order, rotation and removed pages set above.",
      tool: "organize-pdf",
    },
    faqs: [
      {
        question: "Can I split one PDF into several files here?",
        answer:
          "This tool saves one organized PDF. For focused page selection flows, use Split PDF or Extract PDF pages.",
      },
      {
        question: "What happens if I remove every page?",
        answer:
          "We stop you rather than hand back an empty file — you'll see a plain error instead of a broken download.",
      },
      {
        question: "Does rotating a page lose any quality?",
        answer:
          "No. Rotation just changes the page's orientation flag; the content itself is untouched, unlike rotating a photo which has to redraw every pixel.",
      },
      {
        question: "Will this work on a password-protected PDF?",
        answer:
          "No. Remove the password in the application that created it first, then reorder or rotate its pages here.",
      },
    ],
  },
  // -------------------------------------------------------------------------
  "rotate-pdf": {
    h1: "Rotate a PDF",
    metaTitle: "Rotate every page of a PDF",
    metaDescription:
      "Turn a sideways or upside-down PDF the right way up — every page, one rotation, in your browser.",
    intro:
      "A PDF scanned on its side stays that way in every viewer until someone rotates it. Pick a direction and we turn every page in the document by the same amount — for anything more selective, like rotating just one page, use Organize PDF instead.",
    preset: { kind: "pdf-rotate" },
    accept: PDF_ACCEPT,
    lead: {
      id: "organize-pdf",
      title: "Rotate every page",
      reason: "Turns the whole document by the angle chosen above.",
      tool: "rotate-pdf",
    },
    faqs: [
      {
        question: "Can I rotate just one page instead of the whole document?",
        answer:
          "Use Organize PDF for that \u2014 it rotates pages individually. This tool turns every page by the same amount in one step.",
      },
      {
        question: "Does rotating lose any quality?",
        answer:
          "No. Rotation changes each page's orientation flag; the content itself is never redrawn or re-encoded.",
      },
      {
        question: "Will this work on a password-protected PDF?",
        answer:
          "No. Remove the password in the application that created it first, then rotate it here.",
      },
    ],
  },
  // -------------------------------------------------------------------------
  smartfix: {
    h1: "SmartFix — describe the result you need",
    metaTitle: "SmartFix — tell us the outcome, we build the plan",
    metaDescription:
      "Describe what you need in plain English — under 2 MB, resized, metadata removed — and SmartFix builds and runs the exact steps, in your browser.",
    intro:
      "Every tool on this site does one thing well, but most real requests are really two or three things at once: convert, then resize, then strip the location data. SmartFix reads a plain-English sentence, works out which of those apply and in what order, and shows you the plan before anything runs. If it can't confidently read your sentence, it says so instead of guessing.",
    preset: { kind: "smartfix" },
    accept: ALL_ACCEPT,
    faqs: [
      {
        question: "What can I actually type here?",
        answer:
          "Plain descriptions of the result you need: \u201cunder 2 MB as a JPG\u201d, \u201cremove the location from this photo\u201d, \u201cresize to 1280x720\u201d, \u201cmake this small enough to email\u201d. We read it deterministically \u2014 matching known patterns for size, dimensions, format and a handful of destinations \u2014 rather than sending your sentence anywhere.",
      },
      {
        question: "What happens if SmartFix doesn't understand my sentence?",
        answer:
          "You'll see the examples above instead of a made-up plan. Rephrasing with a size, dimension or format usually gets it, or you can go straight to the specific tool for your file from the tools page.",
      },
      {
        question: "Is this different from the SmartFix console on the homepage?",
        answer:
          "No \u2014 it's the exact same engine on its own page, so you can link or bookmark it directly.",
      },
      {
        question: "Does SmartFix send my file anywhere?",
        answer:
          "Every step SmartFix can currently plan runs on your device. If a request ever needed cloud processing, it would be labelled before it ran \u2014 never assumed.",
      },
    ],
  },};

export function getToolContent(slug: string): ToolContent | undefined {
  return toolContent[slug];
}
