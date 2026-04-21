import { NextResponse } from "next/server";
import { clearAccessCookie } from "@/lib/lemonsqueezy";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out" });
  clearAccessCookie(response);
  return response;
}
