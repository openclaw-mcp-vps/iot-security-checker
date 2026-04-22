import { NextResponse } from "next/server";
import { z } from "zod";

import { accessCookieName, createAccessToken } from "@/lib/access";
import { hasAccessGrant } from "@/lib/access-grants";

const unlockSchema = z.object({
  email: z.string().email()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = unlockSchema.parse(body);

    const granted = await hasAccessGrant(email);

    if (!granted) {
      return NextResponse.json(
        {
          error:
            "No active purchase found for this email yet. If you just paid, wait 10-20 seconds and try again."
        },
        { status: 404 }
      );
    }

    const token = createAccessToken(email);

    const response = NextResponse.json({
      message: "Purchase verified. Redirecting to your dashboard."
    });

    response.cookies.set({
      name: accessCookieName,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
      path: "/"
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Invalid email" }, { status: 400 });
    }

    return NextResponse.json({ error: "Unable to unlock access" }, { status: 500 });
  }
}
