import { NextResponse } from "next/server";

const FALLBACK = "# ads.txt is not configured yet";

export function GET() {
  const publisherLine = process.env.NEXT_PUBLIC_ADS_TX?.trim() || FALLBACK;
  return new NextResponse(`${publisherLine}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
