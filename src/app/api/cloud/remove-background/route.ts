import { NextResponse } from "next/server";
import { readDemoSession } from "@/lib/auth/demoSession";
import {
  CloudFeatureDisabledError,
  CloudProviderNotConfiguredError,
  CloudValidationError,
  removeBackgroundWithProvider,
} from "@/lib/cloud/removeBackground";
import { isPaidPlan } from "@/lib/plans";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    // Defense in depth: the UI already hides this behind sign-in + a paid
    // plan (see supportsStep in ops/capabilities.ts), but the endpoint must
    // not trust the client to have enforced that.
    const session = await readDemoSession();
    if (!session || !isPaidPlan(session.plan)) {
      return NextResponse.json(
        { error: "Sign in on a paid plan to use background removal." },
        { status: 403 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "A file is required." }, { status: 400 });
    }

    const response = await removeBackgroundWithProvider(file);
    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        {
          error:
            text ||
            "Background removal provider returned an error. Please try a different photo.",
        },
        { status: 502 },
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": response.headers.get("content-type") ?? "image/png",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof CloudFeatureDisabledError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    if (error instanceof CloudProviderNotConfiguredError) {
      return NextResponse.json(
        {
          error:
            "Background removal is enabled but the provider key is missing on the server.",
        },
        { status: 503 },
      );
    }
    if (error instanceof CloudValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Cloud background removal failed unexpectedly." },
      { status: 500 },
    );
  }
}
