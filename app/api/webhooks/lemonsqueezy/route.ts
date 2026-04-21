import { NextResponse } from "next/server";
import { recordPurchase, verifyStripeWebhookSignature } from "@/lib/lemonsqueezy";

export const runtime = "nodejs";

type StripeCheckoutCompletedEvent = {
  type?: string;
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

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signatureHeader = request.headers.get("stripe-signature");

  if (process.env.STRIPE_WEBHOOK_SECRET) {
    const validSignature = verifyStripeWebhookSignature(rawBody, signatureHeader);
    if (!validSignature) {
      return NextResponse.json({ message: "Invalid webhook signature" }, { status: 400 });
    }
  }

  let event: StripeCheckoutCompletedEvent;
  try {
    event = JSON.parse(rawBody) as StripeCheckoutCompletedEvent;
  } catch {
    return NextResponse.json({ message: "Invalid JSON payload" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const checkout = event.data?.object;
    const email = checkout?.customer_details?.email ?? checkout?.customer_email;

    if (!email) {
      return NextResponse.json({ message: "Missing customer email" }, { status: 400 });
    }

    await recordPurchase(email, checkout?.id ?? null);
  }

  return NextResponse.json({ received: true });
}
