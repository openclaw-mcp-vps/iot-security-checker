import { NextResponse } from "next/server";

import { lemonsqueezyDeprecationNotice } from "@/lib/lemonsqueezy";

export async function POST() {
  return NextResponse.json(
    {
      error: "Deprecated webhook endpoint",
      message: lemonsqueezyDeprecationNotice
    },
    { status: 410 }
  );
}
