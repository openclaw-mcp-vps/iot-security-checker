import crypto from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ACCESS_COOKIE = "iot_scanner_access";
const ACCESS_DAYS = 30;

function getSecret() {
  return process.env.STRIPE_WEBHOOK_SECRET || "local-dev-secret";
}

function sign(payload: string) {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
}

function decodeToken(token: string) {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) {
    return null;
  }

  const expected = sign(encoded);
  const expectedBytes = Buffer.from(expected);
  const signatureBytes = Buffer.from(signature);

  if (expectedBytes.length !== signatureBytes.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(expectedBytes, signatureBytes)) {
    return null;
  }

  const decoded = Buffer.from(encoded, "base64url").toString("utf8");
  const [email, expiresAt] = decoded.split("|");

  if (!email || !expiresAt) {
    return null;
  }

  const expires = Number.parseInt(expiresAt, 10);
  if (Number.isNaN(expires) || Date.now() > expires) {
    return null;
  }

  return { email, expires };
}

export function createAccessToken(email: string) {
  const expiresAt = Date.now() + ACCESS_DAYS * 24 * 60 * 60 * 1000;
  const payload = Buffer.from(`${email.toLowerCase()}|${expiresAt}`, "utf8").toString("base64url");
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function verifyAccessToken(token: string) {
  return decodeToken(token);
}

export async function getAccessSession() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(ACCESS_COOKIE)?.value;

  if (!raw) {
    return null;
  }

  return verifyAccessToken(raw);
}

export async function requireAccess() {
  const session = await getAccessSession();

  if (!session) {
    redirect("/?paywall=1");
  }

  return session;
}

export const accessCookieName = ACCESS_COOKIE;
