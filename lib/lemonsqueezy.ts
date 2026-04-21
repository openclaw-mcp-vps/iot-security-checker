import { createHmac, timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { NextRequest, NextResponse } from "next/server";
import { listPurchases, savePurchase } from "@/lib/data-store";

export const ACCESS_COOKIE_NAME = "iot_security_access";
const ACCESS_DURATION_SECONDS = 60 * 60 * 24 * 30;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function emailToHint(email: string) {
  const [local = "u", domain = "example.com"] = normalizeEmail(email).split("@");
  const maskedLocal = `${local.slice(0, 1)}***${local.slice(-1)}`;
  return `${maskedLocal}@${domain}`;
}

function getAccessSecret() {
  return process.env.STRIPE_WEBHOOK_SECRET || "dev-webhook-secret-change-me";
}

export function verifyStripeWebhookSignature(payload: string, signatureHeader: string | null) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) {
    return false;
  }

  const parts = signatureHeader.split(",").reduce<Record<string, string[]>>((acc, part) => {
    const [key, value] = part.split("=");
    if (!key || !value) return acc;
    acc[key] = acc[key] ? [...acc[key], value] : [value];
    return acc;
  }, {});

  const timestamp = parts.t?.[0];
  const signatures = parts.v1 ?? [];

  if (!timestamp || signatures.length === 0) {
    return false;
  }

  const signedPayload = `${timestamp}.${payload}`;
  const expected = createHmac("sha256", secret).update(signedPayload).digest("hex");

  return signatures.some((signature) => {
    try {
      return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    } catch {
      return false;
    }
  });
}

export async function recordPurchase(email: string, stripeCheckoutId: string | null = null) {
  const normalized = normalizeEmail(email);

  const existing = await listPurchases();
  for (const purchase of existing) {
    const isMatch = await bcrypt.compare(normalized, purchase.emailHash);
    if (isMatch) {
      return purchase;
    }
  }

  const emailHash = await bcrypt.hash(normalized, 12);
  return savePurchase({
    emailHash,
    emailHint: emailToHint(normalized),
    purchasedAt: new Date().toISOString(),
    stripeCheckoutId
  });
}

export async function hasPurchasedAccess(email: string) {
  const normalized = normalizeEmail(email);
  const purchases = await listPurchases();

  for (const purchase of purchases) {
    if (await bcrypt.compare(normalized, purchase.emailHash)) {
      return true;
    }
  }

  return false;
}

export function createAccessToken(email: string) {
  return jwt.sign({ email: normalizeEmail(email) }, getAccessSecret(), {
    expiresIn: ACCESS_DURATION_SECONDS
  });
}

export function verifyAccessToken(token?: string | null) {
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, getAccessSecret()) as { email?: string };
    return decoded.email ?? null;
  } catch {
    return null;
  }
}

export function getAccessEmailFromRequest(request: NextRequest) {
  const token = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
  return verifyAccessToken(token);
}

export function setAccessCookie(response: NextResponse, email: string) {
  const token = createAccessToken(email);

  response.cookies.set({
    name: ACCESS_COOKIE_NAME,
    value: token,
    maxAge: ACCESS_DURATION_SECONDS,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });

  return response;
}

export function clearAccessCookie(response: NextResponse) {
  response.cookies.set({
    name: ACCESS_COOKIE_NAME,
    value: "",
    maxAge: 0,
    path: "/"
  });

  return response;
}
