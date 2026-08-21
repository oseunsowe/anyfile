import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { isPlanId, type PlanId } from "@/lib/plans";

export const DEMO_SESSION_COOKIE = "afk_demo_session";
const DEFAULT_DEMO_EMAIL = "demo@anyfilekits.com";
const DEFAULT_DEMO_PASSWORD = "demo1234!";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

/**
 * Only used outside production, and only when the real secret is not set —
 * this is a marketing-site demo login with no user data behind it. Production
 * always requires AUTH_SESSION_SECRET; see getSessionSecret below.
 */
const INSECURE_DEV_FALLBACK_SECRET = "anyfilekits-dev-only-insecure-secret-do-not-deploy";

function base64url(input: string) {
  return Buffer.from(input, "utf8").toString("base64url");
}

function decodeBase64url(input: string) {
  return Buffer.from(input, "base64url").toString("utf8");
}

function getSessionSecret() {
  const secret = process.env.AUTH_SESSION_SECRET?.trim();
  if (secret) return secret;

  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SESSION_SECRET is missing.");
  }

  console.warn(
    "[auth] AUTH_SESSION_SECRET is not set — using an insecure development fallback. " +
      "Set AUTH_SESSION_SECRET before deploying.",
  );
  return INSECURE_DEV_FALLBACK_SECRET;
}

export function getDemoCredentials() {
  return {
    email: process.env.DEMO_LOGIN_EMAIL?.trim() || DEFAULT_DEMO_EMAIL,
    password: process.env.DEMO_LOGIN_PASSWORD?.trim() || DEFAULT_DEMO_PASSWORD,
  };
}

export function validateDemoCredentials(email: string, password: string) {
  const expected = getDemoCredentials();
  return email === expected.email && password === expected.password;
}

type SessionPayload = {
  sub: string;
  exp: number;
  plan: PlanId;
};

export function createDemoSessionToken(email: string, plan: PlanId = "free") {
  const payload: SessionPayload = {
    sub: email,
    exp: Date.now() + SESSION_TTL_MS,
    plan,
  };

  const body = base64url(JSON.stringify(payload));
  const signature = createHmac("sha256", getSessionSecret())
    .update(body)
    .digest("base64url");

  return `${body}.${signature}`;
}

export function verifyDemoSessionToken(token: string): SessionPayload | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [body, signature] = parts;
  const expected = createHmac("sha256", getSessionSecret())
    .update(body)
    .digest("base64url");

  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;

  try {
    const parsed = JSON.parse(decodeBase64url(body)) as Partial<SessionPayload>;
    if (!parsed.sub || typeof parsed.exp !== "number") return null;
    if (Date.now() > parsed.exp) return null;
    const plan = typeof parsed.plan === "string" && isPlanId(parsed.plan) ? parsed.plan : "free";
    return { sub: parsed.sub, exp: parsed.exp, plan };
  } catch {
    return null;
  }
}

export async function readDemoSession() {
  const store = await cookies();
  const token = store.get(DEMO_SESSION_COOKIE)?.value;
  if (!token) return null;

  return verifyDemoSessionToken(token);
}
