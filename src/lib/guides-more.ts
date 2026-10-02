import type { Guide } from "@/lib/guides";

/** Second batch of guides, each targeting one specific long-tail search. */
export const moreGuides: readonly Guide[] = [
  {
    slug: "how-to-convert-png-to-jpg",
    title: "How to convert PNG to JPG without losing quality",
    metaTitle: "How to Convert PNG to JPG Without Losing Quality (Free)",
    description:
      "PNG files are often far larger than they need to be. Learn when converting to JPG makes sense, what you lose, and how to keep the image sharp.",
    published: "2026-10-01",
    updated: "2026-10-01",
    readMinutes: 4,
    intro:
      "A PNG screenshot or export can easily be 5 MB when the same picture as a JPG would be 400 KB. If an upload form has a size limit, or you simply want faster pages and smaller emails, converting PNG to JPG is usually the quickest win.",
    sections: [
      {
        heading: "When converting makes sense",
        paragraphs: [
          "Convert photographs and detailed images. JPG was designed for them, and the savings are large. Do not convert logos, text-heavy screenshots or anything with a transparent background: JPG blurs sharp edges slightly and has no transparency, so transparent areas turn solid, usually white.",
        ],
      },
      {
        heading: "How to convert in your browser",
        paragraphs: [
          "The PNG to JPG tool converts the file on your device, so the image is never uploaded.",
        ],
        steps: [
          "Open the PNG to JPG tool and add one or more PNG files.",
          "Run the conversion and check the new file size.",
          "Download the JPG files.",
        ],
      },
      {
        heading: "Keeping the quality high",
        paragraphs: [
          "JPG is lossy, so every conversion trades a little detail for size. At a quality setting around 85 to 90 the difference is invisible at normal viewing size. Convert once from the original PNG, and never re-save a JPG repeatedly, because the loss builds up each time.",
        ],
      },
      {
        heading: "What happens to transparency",
        paragraphs: [
          "Transparent pixels need a colour in a JPG, and white is the common choice. If your image will sit on a coloured background, keep the PNG, or convert to WebP, which supports transparency and is still smaller than PNG.",
        ],
      },
    ],
    tools: ["png-to-jpg", "compress-image", "webp-converter", "jpg-to-png"],
  },
  {
    slug: "how-to-convert-jpg-to-png",
    title: "How to convert JPG to PNG (and when you should)",
    metaTitle: "How to Convert JPG to PNG (and When You Should)",
    description:
      "Converting JPG to PNG will not restore lost quality or make the background transparent. Here is what it is actually good for, and how to do it.",
    published: "2026-10-01",
    updated: "2026-10-01",
    readMinutes: 4,
    intro:
      "People often convert JPG to PNG hoping to improve the image or remove a background. Neither happens automatically. There are still good reasons to do it, and it is worth knowing which they are.",
    sections: [
      {
        heading: "What conversion does not do",
        paragraphs: [
          "A JPG has already thrown away detail. Saving it as PNG keeps what is left perfectly, but it cannot bring the lost detail back, and the file usually grows several times larger. A JPG also has no transparency, so the white box around a logo stays white after conversion.",
        ],
      },
      {
        heading: "When it is the right move",
        paragraphs: [
          "Use PNG when a destination only accepts PNG, when you are going to edit the image repeatedly and want to avoid further lossy saves, or when you need a lossless copy of a screenshot or graphic before making changes.",
        ],
        steps: [
          "Open the JPG to PNG tool and add your image.",
          "Convert it and download the PNG.",
          "Keep the original JPG in case you need the smaller file later.",
        ],
      },
      {
        heading: "Need a transparent background?",
        paragraphs: [
          "Conversion alone will not do it. You need an editor or background-removal tool to cut out the subject first, then export as PNG or WebP so the transparency is kept.",
        ],
      },
    ],
    tools: ["jpg-to-png", "png-to-jpg", "webp-converter", "compress-image"],
  },
  {
    slug: "how-to-add-a-watermark-to-photos",
    title: "How to add a watermark to your photos",
    metaTitle: "How to Add a Watermark to Photos (Text or Logo, Free)",
    description:
      "Protect your photos and brand with a watermark. Learn where to place it, how visible to make it and how to add one to many photos at once.",
    published: "2026-10-01",
    updated: "2026-10-01",
    readMinutes: 4,
    intro:
      "A watermark tells viewers who made an image and discourages casual reuse. Done well it stays out of the way. Done badly it ruins the photo, or is trivially cropped out.",
    sections: [
      {
        heading: "Choose placement and opacity",
        paragraphs: [
          "A semi-transparent mark in a corner is the least intrusive, but it is also the easiest to crop. A mark across the middle of the picture is harder to remove but more distracting. A good compromise is a subtle mark near, but not on, the edge of the main subject, at 30 to 50 percent opacity.",
        ],
      },
      {
        heading: "Add it in your browser",
        paragraphs: [
          "The Add watermark tool stamps your text or mark onto images on your device, so the originals are never uploaded.",
        ],
        steps: [
          "Open the Add watermark tool and add your photos.",
          "Enter your watermark text and choose position and opacity.",
          "Run it and download the watermarked copies.",
        ],
      },
      {
        heading: "Tips",
        paragraphs: [
          "Always keep the unmarked originals. Use light text with a slight shadow, or dark text on bright images, so the mark stays readable on any background. A watermark discourages reuse but cannot stop determined copying, so share smaller, lower-resolution versions when you can.",
        ],
      },
    ],
    tools: ["watermark-image", "resize-image", "compress-image"],
  },
  {
    slug: "how-to-rotate-a-pdf-permanently",
    title: "How to rotate a PDF and save it permanently",
    metaTitle: "How to Rotate a PDF Page and Save It (Free, No Upload)",
    description:
      "A sideways scan or upside-down page is easy to fix, but many viewers only rotate the view. Learn how to rotate PDF pages and save the change.",
    published: "2026-10-01",
    updated: "2026-10-01",
    readMinutes: 3,
    intro:
      "Scanners and phone apps sometimes produce pages that open sideways. Rotating the view in your PDF reader fixes it for you, but the next person who opens the file sees it sideways again, unless you save the rotation into the file.",
    sections: [
      {
        heading: "Rotate and save",
        paragraphs: [
          "The Rotate PDF tool changes the rotation of the pages inside the file and saves a new copy, on your device.",
        ],
        steps: [
          "Open the Rotate PDF tool and add your document.",
          "Choose which pages to turn and by how much: 90, 180 or 270 degrees.",
          "Download the corrected PDF and check it in a different viewer.",
        ],
      },
      {
        heading: "Rotating only some pages",
        paragraphs: [
          "Mixed documents are common: most pages upright, one landscape scan sideways. Rotate just the affected pages, or use Organize PDF to rotate, reorder and remove pages in one pass.",
        ],
      },
      {
        heading: "Why rotation sometimes does not stick",
        paragraphs: [
          "Some viewers show a temporary rotation that is never written into the file. If someone else still sees the page sideways, the change was not saved. Saving a new copy with the rotation applied avoids this.",
        ],
      },
    ],
    tools: ["rotate-pdf", "organize-pdf", "merge-pdf"],
  },
  {
    slug: "how-to-delete-pages-from-a-pdf",
    title: "How to delete pages from a PDF",
    metaTitle: "How to Delete Pages From a PDF (Free, Private, No Software)",
    description:
      "Remove blank pages, cover sheets or private pages from a PDF in your browser. Step-by-step, with tips for keeping the file small.",
    published: "2026-10-01",
    updated: "2026-10-01",
    readMinutes: 3,
    intro:
      "You scanned a document and the last page is blank, or you need to send a contract without the internal cover sheet. Removing pages should not require installing software or uploading the file to a stranger's server.",
    sections: [
      {
        heading: "Delete pages in your browser",
        paragraphs: [
          "The Delete PDF pages tool removes the pages you choose and saves a new file, entirely on your device.",
        ],
        steps: [
          "Open the Delete PDF pages tool and add your PDF.",
          "Enter the pages to remove, such as 1, 4 or 6-8.",
          "Download the shortened PDF and scroll through it to confirm.",
        ],
      },
      {
        heading: "Deleting pages makes files smaller",
        paragraphs: [
          "If a PDF is over an upload limit, removing pages that are not needed is often the simplest way to shrink it. Follow up with the Compress PDF tool if it is still too large.",
        ],
      },
      {
        heading: "Think before you delete",
        paragraphs: [
          "Keep the original file. And if you are removing a page because it contains private information, also check that the information does not appear elsewhere, such as in a table of contents or footer.",
        ],
      },
    ],
    tools: ["delete-pdf-pages", "extract-pdf", "compress-pdf", "organize-pdf"],
  },
  {
    slug: "how-to-split-a-pdf",
    title: "How to split a PDF into smaller files",
    metaTitle: "How to Split a PDF Into Separate Pages or Sections (Free)",
    description:
      "Break a large PDF into smaller documents or pull out just the pages you need, without uploading the file anywhere.",
    published: "2026-10-01",
    updated: "2026-10-01",
    readMinutes: 3,
    intro:
      "A 200-page scan, a combined statement, or a report you only need a section of: splitting a PDF lets you share exactly the part that is relevant and keeps each file small enough to send.",
    sections: [
      {
        heading: "Split or extract",
        paragraphs: [
          "Splitting and extracting are close relatives. Use Extract PDF pages when you want a new file containing a chosen range, such as pages 12 to 20. Use Split PDF to divide the document at the points you pick.",
        ],
        steps: [
          "Open the Split PDF or Extract PDF pages tool and add your file.",
          "Enter the page numbers or ranges you want to keep.",
          "Download the new PDF.",
        ],
      },
      {
        heading: "Why split a PDF",
        paragraphs: [
          "Email systems limit attachment size, portals limit upload size, and sending only the relevant pages is better for privacy. If you need to put the pieces back together later, the Merge PDF tool combines them.",
        ],
      },
      {
        heading: "Large files and your browser",
        paragraphs: [
          "Processing happens on your device, so very large PDFs may take a little while and use memory. Close other heavy tabs if it feels slow.",
        ],
      },
    ],
    tools: ["split-pdf", "extract-pdf", "merge-pdf", "delete-pdf-pages"],
  },
  {
    slug: "how-to-convert-pdf-to-jpg",
    title: "How to convert a PDF to JPG images",
    metaTitle: "How to Convert a PDF to JPG Images (Every Page, Free)",
    description:
      "Turn PDF pages into JPG images for sharing, slides or social posts. One page or the whole document, processed in your browser.",
    published: "2026-10-01",
    updated: "2026-10-01",
    readMinutes: 3,
    intro:
      "Sometimes a PDF is the wrong format: you want a page as a picture for a slide, a social post, a chat message, or a site that only accepts images. Converting each page to JPG solves that.",
    sections: [
      {
        heading: "Convert in your browser",
        paragraphs: [
          "The PDF to JPG tool renders each page as an image on your device. One page downloads directly; several pages download together as a zip.",
        ],
        steps: [
          "Open the PDF to JPG tool and add your PDF.",
          "Run the conversion.",
          "Download the JPG image or the zip of all pages.",
        ],
      },
      {
        heading: "What to expect",
        paragraphs: [
          "The text in a JPG is part of the picture, so it can no longer be selected or searched. Keep the original PDF if you need to copy text from it. Text-heavy pages stay readable; if you need extra sharpness, avoid shrinking the images afterwards.",
        ],
      },
      {
        heading: "Going back to PDF",
        paragraphs: [
          "If you later need the images as a single document again, the Image to PDF tool turns them back into one PDF.",
        ],
      },
    ],
    tools: ["pdf-to-jpg", "image-to-pdf", "compress-image"],
  },
  {
    slug: "how-to-speed-up-your-website-with-smaller-images",
    title: "How to speed up your website with smaller images",
    metaTitle: "How to Speed Up Your Website by Compressing Images",
    description:
      "Large images are the most common reason pages load slowly. Learn the right sizes, formats and quality settings for fast, sharp web images.",
    published: "2026-10-01",
    updated: "2026-10-01",
    readMinutes: 5,
    intro:
      "Images usually make up most of a web page's weight. Uncompressed photos straight from a camera can add several megabytes to a page, which makes it slow on mobile connections and can hurt how well the page ranks in search.",
    sections: [
      {
        heading: "Resize before you compress",
        paragraphs: [
          "Start with dimensions. A photo that displays at 800 pixels wide does not need to be 4000 pixels wide. Resize to roughly twice the largest size it will be displayed, which keeps it sharp on high-density screens, then compress.",
        ],
      },
      {
        heading: "Pick the right format",
        paragraphs: [
          "Use JPG or WebP for photographs, PNG or WebP for graphics with transparency, and avoid PNG for photos. WebP is typically 25 to 35 percent smaller than JPG at similar quality and is supported by all current major browsers.",
        ],
      },
      {
        heading: "Compress in your browser",
        paragraphs: [
          "Use the Compress image tool to reduce file size on your device.",
        ],
        steps: [
          "Resize the image to the size you need with the Resize image tool.",
          "Compress it with the Compress image tool, aiming for a quality around 75 to 85.",
          "Compare it with the original. If you cannot see a difference, keep the smaller file.",
        ],
      },
      {
        heading: "Targets worth aiming for",
        paragraphs: [
          "As a rough guide, keep ordinary content images under 200 KB and large hero images under 500 KB. Add width and height attributes in your page code so the layout does not jump while images load.",
        ],
      },
    ],
    tools: ["compress-image", "resize-image", "webp-converter", "png-to-jpg"],
  },
  {
    slug: "how-to-crop-and-rotate-a-photo",
    title: "How to crop and rotate a photo online",
    metaTitle: "How to Crop and Rotate a Photo Online (Free, Private)",
    description:
      "Straighten a sideways photo, crop to a square or a custom ratio, and keep the quality. A quick guide to cropping in your browser.",
    published: "2026-10-01",
    updated: "2026-10-01",
    readMinutes: 3,
    intro:
      "Photos from phones sometimes come out sideways, or include more of the scene than you want. Cropping and rotating fixes both, and you can do it without installing an editor.",
    sections: [
      {
        heading: "Crop and rotate in your browser",
        paragraphs: [
          "The Crop and rotate tool works on your device, so the photo stays private.",
        ],
        steps: [
          "Open the Crop and rotate tool and add your photo.",
          "Rotate it by 90 degree steps until it is upright, then set the crop area.",
          "Download the result.",
        ],
      },
      {
        heading: "Choosing a crop shape",
        paragraphs: [
          "Square crops suit profile pictures. Wide crops such as 16 by 9 suit banners, slides and video thumbnails. For printing, check the aspect ratio of the print size first so nothing important is trimmed.",
        ],
      },
      {
        heading: "Cropping and file size",
        paragraphs: [
          "Cropping removes pixels, so the file usually gets smaller. If you also need to meet an upload limit, compress the image after cropping.",
        ],
      },
    ],
    tools: ["crop-image", "profile-picture-resizer", "resize-image", "compress-image"],
  },
];
