import { moreGuides } from "@/lib/guides-more";

/**
 * Editorial guides. Each one answers a specific question people search for and
 * links to the tool that does the job, so guides feed tool pages with
 * qualified visitors and give the site real reading content.
 */

export type GuideSection = {
  heading: string;
  paragraphs: readonly string[];
  steps?: readonly string[];
};

export type Guide = {
  slug: string;
  title: string;
  /** <title> / og:title. */
  metaTitle: string;
  description: string;
  published: string;
  updated: string;
  readMinutes: number;
  intro: string;
  sections: readonly GuideSection[];
  /** Tool slugs that solve the problem in this guide. */
  tools: readonly string[];
};

const baseGuides: readonly Guide[] = [
  {
    slug: "how-to-compress-a-pdf-under-2mb",
    title: "How to compress a PDF under 2 MB",
    metaTitle: "How to Compress a PDF Under 2 MB (Free, No Upload)",
    description:
      "Job portals, visa sites and email systems often cap PDFs at 2 MB. Learn why PDFs get big and the fastest ways to shrink one without ruining it.",
    published: "2026-09-30",
    updated: "2026-09-30",
    readMinutes: 5,
    intro:
      "A 2 MB upload limit is one of the most common file-size rules on the web. Job application portals, university admissions systems, visa forms and many email gateways all use it. When your PDF is 7 or 8 MB, the fix is rarely to redo the document. It is to find out why the file is large and shrink that part.",
    sections: [
      {
        heading: "Why PDFs get so large",
        paragraphs: [
          "Text is tiny. A page of plain text is a few kilobytes. PDFs become large because of what is embedded in them: photographs, scanned pages saved as full-resolution images, and fonts that are embedded in full.",
          "A resume exported from a design tool with a headshot at 4000 pixels wide can be several megabytes even though the page is only 8.5 by 11 inches. A scanned document is worse, because every page is a picture. Knowing which case you have tells you what to do next.",
        ],
      },
      {
        heading: "The fastest way to shrink a PDF",
        paragraphs: [
          "Recompressing the embedded images is what saves the most space, because images make up most of the weight. Reducing image quality slightly, to the level you would use for a web photo, usually makes the file several times smaller while staying readable on screen and in print at normal sizes.",
        ],
        steps: [
          "Open the Compress PDF under 2 MB tool and drop in your file.",
          "Let it recompress the embedded images toward the 2 MB target.",
          "Check the result: the tool reports the before and after size, so you can confirm it is under the limit.",
          "Download the smaller PDF and open it once to make sure the pages look right.",
        ],
      },
      {
        heading: "If the file is still too big",
        paragraphs: [
          "If a first pass leaves the file over the limit, work on the biggest contributors. Delete pages you do not need to submit, such as blank pages or cover sheets. For scans, re-scan at 150 to 200 DPI instead of 300 or 600, since 150 DPI is fine for reading and most portals. Remove metadata and unused attachments too, although those rarely account for much.",
          "Avoid shrinking the file by screenshotting pages. That converts text into pictures, makes the text unsearchable, and often produces a larger file than proper compression would.",
        ],
      },
      {
        heading: "Keep your documents private",
        paragraphs: [
          "Resumes, contracts and ID scans are sensitive. AnyFileKits compresses PDFs inside your browser, so the file is processed on your device and is not uploaded to a server. That matters most for exactly the kinds of documents that have a 2 MB limit.",
        ],
      },
    ],
    tools: ["compress-pdf-under-2mb", "compress-pdf", "delete-pdf-pages", "pdf-remove-metadata"],
  },
  {
    slug: "how-to-open-heic-files-on-windows",
    title: "How to open HEIC files on Windows",
    metaTitle: "How to Open HEIC Files on Windows or Convert Them to JPG",
    description:
      "iPhone photos saved as HEIC will not open on many Windows PCs and websites. Here is what HEIC is and how to convert it to JPG in seconds.",
    published: "2026-09-30",
    updated: "2026-09-30",
    readMinutes: 4,
    intro:
      "If you have ever moved photos from an iPhone to a PC and found files ending in .heic that will not open, or a website that rejects them, you have met the HEIC format. It is efficient, but support outside Apple devices is patchy.",
    sections: [
      {
        heading: "What HEIC is and why iPhones use it",
        paragraphs: [
          "HEIC is Apple's default photo format since iOS 11. It stores images using the HEVC compression method, which produces files roughly half the size of a JPG at similar visual quality. That is why an iPhone can hold so many photos.",
          "The catch is compatibility. Many Windows installations need an extra codec to view HEIC, and plenty of websites, print services, job portals and older apps only accept JPG or PNG.",
        ],
      },
      {
        heading: "Convert HEIC to JPG",
        paragraphs: [
          "Converting to JPG is the most universally accepted fix. The image looks the same to the eye, and every device, website and program can open it.",
        ],
        steps: [
          "Open the HEIC to JPG tool.",
          "Drop in one or many HEIC files. Batches are fine.",
          "Convert, then download the JPG files.",
        ],
      },
      {
        heading: "Avoid the problem at the source",
        paragraphs: [
          "On an iPhone, go to Settings, then Camera, then Formats, and choose Most Compatible. New photos will be saved as JPG instead of HEIC. You will use more storage, but you will not need to convert anything.",
          "When you plug the phone into a PC, the Photos app setting Transfer to Mac or PC controls whether iOS converts photos to JPG on the way out.",
        ],
      },
      {
        heading: "Will converting lose quality or location data?",
        paragraphs: [
          "JPG is a lossy format, so there is a small quality change, which is not visible at normal viewing sizes. Metadata such as GPS location may travel with the file. If you plan to post the photo publicly, read our guide on removing location data from photos first.",
        ],
      },
    ],
    tools: ["heic-to-jpg", "remove-location-from-photo", "compress-image"],
  },
  {
    slug: "how-to-remove-location-data-from-photos",
    title: "How to remove location data from photos",
    metaTitle: "How to Remove Location (GPS) Data From Photos Before Sharing",
    description:
      "Photos can silently carry the exact GPS coordinates of where they were taken. Here is how EXIF metadata works and how to strip it before you post.",
    published: "2026-09-30",
    updated: "2026-09-30",
    readMinutes: 4,
    intro:
      "Every photo from a phone camera carries hidden information. Beyond the picture itself, the file can store the time it was taken, the device model and, if location services are on, the precise GPS coordinates. Sharing the original file can reveal more than you intended.",
    sections: [
      {
        heading: "What EXIF metadata is",
        paragraphs: [
          "EXIF is a block of data embedded in image files. It commonly includes date and time, camera make and model, exposure settings and orientation. On phones it often includes latitude and longitude accurate to a few metres.",
          "Many large social platforms remove location data when you upload, but not all do, and messaging apps, classified ad sites, forums and email attachments frequently pass the original file through untouched.",
        ],
      },
      {
        heading: "When it matters most",
        paragraphs: [
          "Be careful with photos taken at home, at your child's school, or anywhere you would not share an address. Selling items online is a common case: a listing photo taken in your living room can point buyers to your front door.",
        ],
      },
      {
        heading: "Strip location data in your browser",
        paragraphs: [
          "The Remove photo location tool re-saves the image without its metadata. Because it runs in your browser, the original photo is never uploaded anywhere.",
        ],
        steps: [
          "Open the Remove photo location tool and add your photo or photos.",
          "Run the tool. It writes a clean copy without EXIF or GPS tags.",
          "Download the clean copy and share that one instead of the original.",
        ],
      },
      {
        heading: "Turn location off at the source",
        paragraphs: [
          "On iPhone, open Settings, Privacy and Security, Location Services, Camera, and choose Never. On Android, open the camera app's settings and switch off Location tags or Save location. You can still tag places on purpose when you want to.",
        ],
      },
    ],
    tools: ["remove-location-from-photo", "compress-image", "heic-to-jpg"],
  },
  {
    slug: "how-to-resize-a-photo-for-email",
    title: "How to resize a photo for email",
    metaTitle: "How to Resize a Photo for Email (Keep It Under the Size Limit)",
    description:
      "Email providers limit attachment size, and modern phone photos are huge. Learn the right dimensions and file size for sending photos by email.",
    published: "2026-09-30",
    updated: "2026-09-30",
    readMinutes: 4,
    intro:
      "A single photo from a current phone can be 3 to 10 MB. Gmail and Outlook cap total attachments at roughly 20 to 25 MB, and some corporate systems allow far less. Sending a handful of photos can fail, or land in the recipient's inbox as an annoyingly slow download.",
    sections: [
      {
        heading: "What size is right",
        paragraphs: [
          "For viewing on a screen, you rarely need more than about 1600 pixels on the long edge. A photo at that size typically weighs 300 to 800 KB as a JPG. That is more than sharp enough for email, chat and most web uses, and small enough to attach a dozen at a time.",
          "If the recipient will print the photo, keep the original and send it through a file-sharing link instead of an attachment.",
        ],
      },
      {
        heading: "Resize in a few clicks",
        paragraphs: [
          "The Resize photo for email tool reduces both dimensions and file weight while keeping the picture looking natural.",
        ],
        steps: [
          "Open the Resize photo for email tool and drop your images in.",
          "Run it and check the reported size for each image.",
          "Download the smaller versions and attach them to your message.",
        ],
      },
      {
        heading: "Dimensions versus quality",
        paragraphs: [
          "File size depends on two things: how many pixels the image has, and how hard it is compressed. Reducing pixels helps the most. Lowering JPG quality from 100 to about 80 saves a lot more space than it costs in visible detail, while going below 60 tends to show blocky artefacts.",
        ],
      },
      {
        heading: "Sending many photos",
        paragraphs: [
          "If you have dozens of pictures, resize them all first, or combine them into a single PDF with the Image to PDF tool. One PDF is easier to attach and easier for the recipient to page through.",
        ],
      },
    ],
    tools: ["reduce-photo-size-for-email", "compress-image", "image-to-pdf", "resize-image"],
  },
  {
    slug: "how-to-merge-pdf-files-privately",
    title: "How to merge PDF files without uploading them",
    metaTitle: "How to Merge PDF Files Privately in Your Browser",
    description:
      "Combine several PDFs into a single document without sending your files to a server. A quick walkthrough with tips on order, size and page rotation.",
    published: "2026-09-30",
    updated: "2026-09-30",
    readMinutes: 4,
    intro:
      "Applications, invoices and legal packs often need to be submitted as one PDF, but you have them as separate files: a cover letter here, a passport scan there. Merging is simple, but many online tools require you to upload documents to a stranger's server. You do not have to.",
    sections: [
      {
        heading: "Merge in your browser",
        paragraphs: [
          "Modern browsers can read and rewrite PDF files on their own. The Merge PDF tool does exactly that on your device, which means your documents stay with you.",
        ],
        steps: [
          "Open the Merge PDF tool and add all the files you want to combine.",
          "Drag the files into the order you want them to appear.",
          "Merge them and download the single combined PDF.",
        ],
      },
      {
        heading: "Get the page order right",
        paragraphs: [
          "Check the order before you merge, then open the final file and scroll through it once. Common mistakes are a rotated scan in the middle of the file or a blank page at the end. If a page is sideways, use the Rotate PDF or Organize PDF tools to fix it and remove pages you do not need.",
        ],
      },
      {
        heading: "Watch the combined size",
        paragraphs: [
          "Merging adds file sizes together. If the merged PDF is over a portal's limit, run it through Compress PDF afterwards, so you only compress once, after the pieces are together.",
        ],
      },
      {
        heading: "Going the other way",
        paragraphs: [
          "Need to pull a few pages out of a big file? Use Split PDF or Extract PDF pages to save just the ones you need.",
        ],
      },
    ],
    tools: ["merge-pdf", "organize-pdf", "rotate-pdf", "compress-pdf", "split-pdf"],
  },
  {
    slug: "jpg-vs-png-vs-webp",
    title: "JPG vs PNG vs WebP: which image format should you use?",
    metaTitle: "JPG vs PNG vs WebP: Which Image Format Should You Use?",
    description:
      "A plain-English comparison of JPG, PNG and WebP: when each is smaller, sharper or more compatible, and how to convert between them.",
    published: "2026-09-30",
    updated: "2026-09-30",
    readMinutes: 5,
    intro:
      "The right image format can make a picture three times smaller with no visible difference, or keep a logo crisp instead of blurry. Here is a practical way to choose.",
    sections: [
      {
        heading: "JPG: photographs",
        paragraphs: [
          "JPG uses lossy compression tuned for photographs with smooth colour changes. It produces small files and works everywhere. It does not support transparency, and repeated saving degrades the image. Use JPG for photos, especially when file size or compatibility matters.",
        ],
      },
      {
        heading: "PNG: graphics, screenshots and transparency",
        paragraphs: [
          "PNG is lossless, so sharp edges, text and flat colours stay perfectly crisp, and it supports transparent backgrounds. The downside is size: a PNG photo is often several times bigger than the same JPG. Use PNG for logos, icons, screenshots and anything with transparency.",
        ],
      },
      {
        heading: "WebP: the modern all-rounder",
        paragraphs: [
          "WebP can be lossy or lossless, supports transparency, and typically produces files 25 to 35 percent smaller than JPG or PNG at similar quality. All current major browsers display it. The catch is that some older software, email clients and upload forms still do not accept it.",
        ],
      },
      {
        heading: "Quick decision guide",
        paragraphs: [
          "Photo going on a website you control: WebP, with JPG as the fallback. Photo going to a form, print shop or email: JPG. Logo, diagram or screenshot: PNG. Need a transparent background: PNG or WebP. Got a WebP file that will not upload: convert it to JPG or PNG.",
        ],
      },
      {
        heading: "Converting between formats",
        paragraphs: [
          "Converting a JPG to PNG does not restore quality that was already lost, and it usually makes the file bigger. Convert when a destination requires it, not as an upgrade. Our converters run in your browser, so your images stay on your device.",
        ],
      },
    ],
    tools: ["webp-converter", "jpg-to-png", "png-to-jpg", "compress-image"],
  },
  {
    slug: "how-to-resize-a-profile-picture",
    title: "How to resize a profile picture for any platform",
    metaTitle: "How to Resize a Profile Picture (Sizes for Every Platform)",
    description:
      "The right profile picture size and shape for LinkedIn, Instagram, X, Gmail and more, plus how to crop and resize yours without distortion.",
    published: "2026-09-30",
    updated: "2026-09-30",
    readMinutes: 4,
    intro:
      "Upload a profile photo that is the wrong shape and the platform will crop it for you, often chopping off half your face. Preparing the image first gives you control over the result.",
    sections: [
      {
        heading: "Use a square image with room around your face",
        paragraphs: [
          "Almost every platform displays profile photos in a circle or rounded square, cropped from a square. Start from a 1:1 image and keep your face in the middle with a little space around it, because circular masks clip the corners.",
        ],
      },
      {
        heading: "Sizes that work well",
        paragraphs: [
          "Most services accept anything reasonably large and scale it down. A square of 800 by 800 pixels is a safe universal choice and stays sharp on high-density screens. Keep the file under 5 MB as JPG or PNG.",
          "Platform rules change, so treat this as a sensible default and check the current guidance when a site rejects an upload.",
        ],
      },
      {
        heading: "Resize without distortion",
        paragraphs: [
          "Distortion happens when width and height are scaled by different amounts. Crop to a square first, then resize, so proportions stay natural.",
        ],
        steps: [
          "Open the Profile Picture Resizer tool and add your photo.",
          "Choose a square output size such as 800 by 800.",
          "Download the result and upload it to your profile.",
        ],
      },
      {
        heading: "Keep it professional and light",
        paragraphs: [
          "Use even lighting and a plain background. If the file is large, compress it: a profile photo rarely needs to be more than a few hundred kilobytes.",
        ],
      },
    ],
    tools: ["profile-picture-resizer", "crop-image", "resize-image", "compress-image"],
  },
  {
    slug: "how-to-reduce-image-size-under-1mb",
    title: "How to reduce an image to under 1 MB",
    metaTitle: "How to Reduce an Image Size to Under 1 MB Without Blur",
    description:
      "Upload limits of 1 MB are common for forms and CMS systems. Learn how to shrink a photo under 1 MB and keep it looking sharp.",
    published: "2026-09-30",
    updated: "2026-09-30",
    readMinutes: 4,
    intro:
      "Many government forms, job portals and content management systems reject images over 1 MB. A modern phone photo is often 4 MB or more, so it needs to be shrunk before it will upload.",
    sections: [
      {
        heading: "Two levers: pixels and quality",
        paragraphs: [
          "File size drops when you reduce dimensions, when you compress harder, or both. A 12-megapixel photo is 4000 pixels wide, far more than any form needs. Scaling it to 2000 pixels on the long edge cuts the pixel count by three quarters and usually lands well under 1 MB on its own.",
        ],
      },
      {
        heading: "Do it automatically",
        paragraphs: [
          "The Image under 1 MB tool works toward the limit for you, adjusting size and quality until the file fits, and it tells you the final size.",
        ],
        steps: [
          "Open the Image under 1 MB tool and add your picture.",
          "Run it and read the size shown for the result.",
          "Download the file and upload it where it was rejected.",
        ],
      },
      {
        heading: "Tips for stubborn files",
        paragraphs: [
          "Photos with lots of fine detail, such as foliage or crowds, compress less than plain backgrounds. If you are stuck, crop out unnecessary areas first. PNG screenshots of photos are often bigger than JPG; converting to JPG saves a lot. If a form insists on a specific format, check that first, then compress within it.",
        ],
      },
      {
        heading: "Need 2 MB or another limit?",
        paragraphs: [
          "The same approach works for any limit. Use Image under 2 MB, or the general Compress image tool when you want to choose the quality yourself.",
        ],
      },
    ],
    tools: ["image-under-1mb", "image-under-2mb", "compress-image", "resize-image"],
  },
  {
    slug: "how-to-turn-images-into-a-pdf",
    title: "How to turn images into a PDF",
    metaTitle: "How to Convert Images to a PDF (JPG, PNG to One PDF)",
    description:
      "Combine photos, scans and screenshots into a single PDF with the right order and page size. Free, private and done in your browser.",
    published: "2026-09-30",
    updated: "2026-09-30",
    readMinutes: 3,
    intro:
      "Photos of documents, receipts and forms are easier to submit and share as one PDF. Reviewers can page through it, it prints predictably, and it avoids the problem of five separate attachments.",
    sections: [
      {
        heading: "Convert in your browser",
        paragraphs: [
          "The Image to PDF tool places each image on its own page and builds a single PDF on your device.",
        ],
        steps: [
          "Open the Image to PDF tool and add your JPG or PNG files.",
          "Put the images in the order you want the pages to appear.",
          "Create the PDF and download it.",
        ],
      },
      {
        heading: "Get clean results",
        paragraphs: [
          "Photograph documents flat, in even light, with the page filling the frame. Crop out the table around it first using the Crop and rotate tool. Straighten sideways images before converting, so the pages are all upright.",
        ],
      },
      {
        heading: "Keep the PDF small",
        paragraphs: [
          "A PDF made from full-size phone photos can be large. If you need to stay under a limit, resize the images first or compress the finished PDF with Compress PDF.",
        ],
      },
    ],
    tools: ["image-to-pdf", "crop-image", "compress-pdf", "merge-pdf"],
  },
  {
    slug: "how-to-remove-metadata-from-a-pdf",
    title: "How to remove metadata from a PDF",
    metaTitle: "How to Remove Metadata From a PDF (Author, Title, Dates)",
    description:
      "PDFs store hidden details such as author name, software and edit dates. Learn what is inside and how to clean it before you share.",
    published: "2026-09-30",
    updated: "2026-09-30",
    readMinutes: 3,
    intro:
      "When you export a PDF, the program that created it usually writes information into the file: your name or your company's, the application used, the title and the creation and modification dates. Most of the time that is harmless. Sometimes it is not.",
    sections: [
      {
        heading: "What a PDF can reveal",
        paragraphs: [
          "The document properties can include the author, the original file name as the title, the software that produced it, and timestamps. A contract drafted from an older client's template might still carry that client's name in the title field. A resume can show the exact date and tool used to create it.",
        ],
      },
      {
        heading: "Clean it in your browser",
        paragraphs: [
          "The Remove PDF metadata tool clears these properties and saves a fresh copy. Nothing is uploaded, since the work is done on your device.",
        ],
        steps: [
          "Open the Remove PDF metadata tool and add your PDF.",
          "Run it to clear author, title, subject, keywords and producer fields.",
          "Download the cleaned copy and check its properties in your PDF reader.",
        ],
      },
      {
        heading: "What metadata removal does not do",
        paragraphs: [
          "Removing properties does not remove text that is visible or hidden on the page itself, such as comments, or text in white on a white background. If a document contains truly sensitive content, review the pages carefully before sharing.",
        ],
      },
    ],
    tools: ["pdf-remove-metadata", "compress-pdf", "delete-pdf-pages"],
  },
];

export const guides: readonly Guide[] = [...baseGuides, ...moreGuides];

export function getGuide(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug);
}
