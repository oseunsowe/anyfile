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

import type { FaqEntry } from "@/lib/seo";
import type { Requirement } from "@/lib/requirement";

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
    };

export type ToolContent = {
  h1: string;
  metaTitle: string;
  metaDescription: string;
  /** Two or three sentences of genuinely tool-specific explanation. */
  intro: string;
  preset: ToolPreset;
  /** `accept` attribute for the file input. */
  accept: string;
  faqs: FaqEntry[];
};

const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";

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
};

export function getToolContent(slug: string): ToolContent | undefined {
  return toolContent[slug];
}
