import crypto from "node:crypto";

import { NextResponse } from "next/server";

import { upsertAccessGrant } from "@/lib/access-grants";

function verifyStripeSignature(payload: string, signatureHeader: string, secret: string) {
  const fragments = signatureHeader.split(",");
  const timestampFragment = fragments.find((fragment) => fragment.startsWith("t="));
  const signatures = fragments
    .filter((fragment) => fragment.startsWith("v1="))
    .map((fragment) => fragment.replace("v1=", ""));

  if (!timestampFragment || signatures.length === 0) {
    return false;
  }

  const timestamp = timestampFragment.replace("t=", "");
  const timestampMs = Number.parseInt(timestamp, 10) * 1000;
  if (Number.isNaN(timestampMs) || Math.abs(Date.now() - timestampMs) > 5 * 60 * 1000) {
    return false;
  }

  const signedPayload = `${timestamp}.${payload}`;
  const expected = crypto.createHmac("sha256", secret).update(signedPayload).digest("hex");

  return signatures.some((signature) => {
    const expectedBytes = Buffer.from(expected, "utf8");
    const actualBytes = Buffer.from(signature, "utf8");

    if (expectedBytes.length !== actualBytes.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBytes, actualBytes);
  });
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET is not configured" }, { status: 500 });
  }

  const signatureHeader = request.headers.get("stripe-signature");
  if (!signatureHeader) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const payload = await request.text();

  if (!verifyStripeSignature(payload, signatureHeader, secret)) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  const event = JSON.parse(payload) as {
    type: string;
    data?: {
      object?: {
        id?: string;
        customer_email?: string;
        customer_details?: {
          email?: string;
        };
      };
    };
  };

  if (event.type === "checkout.session.completed") {
    const session = event.data?.object;
    const email = session?.customer_email || session?.customer_details?.email;

    if (email && session?.id) {
      await upsertAccessGrant(email, session.id);
    }
  }

  return NextResponse.json({ received: true });
}
