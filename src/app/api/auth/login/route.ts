import { NextResponse } from "next/server";
import {
  createDemoSessionToken,
  DEMO_SESSION_COOKIE,
  readDemoSession,
  safeRedirectPath,
  validateDemoCredentials,
} from "@/lib/auth/demoSession";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const nextPath = safeRedirectPath(String(formData.get("next") || ""), "/demo");

  if (!validateDemoCredentials(email, password)) {
    const target = new URL(`/login?error=invalid&next=${encodeURIComponent(nextPath)}`, request.url);
    return NextResponse.redirect(target, { status: 303 });
  }

  // Signing back in keeps whichever plan the demo session already had, so
  // re-authenticating never silently drops a previewed upgrade.
  const existing = await readDemoSession();
  const token = createDemoSessionToken(email, existing?.plan ?? "free");
  const response = NextResponse.redirect(new URL(nextPath, request.url), { status: 303 });
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
