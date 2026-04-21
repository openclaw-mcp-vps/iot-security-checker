import { NextResponse } from "next/server";
import { z } from "zod";
import { hasPurchasedAccess, setAccessCookie } from "@/lib/lemonsqueezy";

const activationSchema = z.object({
  email: z.string().email()
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = activationSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Enter a valid email address."
      },
      { status: 400 }
    );
  }

  const hasAccess = await hasPurchasedAccess(parsed.data.email);
  if (!hasAccess) {
    return NextResponse.json(
      {
        message:
          "No completed purchase is linked to that email yet. Finish checkout and confirm Stripe webhook delivery first."
      },
      { status: 403 }
    );
  }

  const response = NextResponse.json({ message: "Access activated. Loading your dashboard..." });
  setAccessCookie(response, parsed.data.email);
  return response;
}
