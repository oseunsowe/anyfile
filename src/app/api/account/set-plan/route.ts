import { NextResponse } from "next/server";
import {
  createDemoSessionToken,
  DEMO_SESSION_COOKIE,
  readDemoSession,
} from "@/lib/auth/demoSession";
import { getPlan, isPlanId } from "@/lib/plans";

export const runtime = "nodejs";

/**
 * Sets the plan on the signed-in demo session. There is no payment processor
 * behind this — it is the "preview this plan" flow described on /plans — but
 * the resulting session attribute genuinely gates entitlements elsewhere
 * (background removal, ad-free, upload limits).
 */
export async function POST(request: Request) {
  const formData = await request.formData();
  const planId = String(formData.get("plan") || "");
  const nextPath = String(formData.get("next") || "/plans");
  const safeNext = nextPath.startsWith("/") ? nextPath : "/plans";

  if (!isPlanId(planId) || !getPlan(planId).selectable) {
    return NextResponse.json({ error: "Unknown or non-selectable plan." }, { status: 400 });
  }

  const session = await readDemoSession();
  if (!session) {
    const target = new URL(`/login?next=${encodeURIComponent(safeNext)}`, request.url);
    return NextResponse.redirect(target, { status: 303 });
  }

  const token = createDemoSessionToken(session.sub, planId);
  const response = NextResponse.redirect(
    new URL(`${safeNext}${safeNext.includes("?") ? "&" : "?"}plan-set=${planId}`, request.url),
    { status: 303 },
  );
  response.cookies.set({
    name: DEMO_SESSION_COOKIE,
    value: token,
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
