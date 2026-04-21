import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { calculateDeviceRisk, findVulnerabilitiesForDevice } from "@/lib/vulnerability-db";
import { getAccessEmailFromRequest } from "@/lib/lemonsqueezy";
import type { FingerprintedDevice } from "@/lib/types";

const deviceInputSchema = z.object({
  vendor: z.string().default("Unknown Vendor"),
  model: z.string().default("Unknown Model"),
  hostname: z.string().default("unknown"),
  ip: z.string().ip().default("192.168.1.10"),
  mac: z.string().default("unknown"),
  openPorts: z.array(z.number().int().positive().max(65535)).default([]),
  category: z.string().default("IoT Device"),
  osGuess: z.string().default("Unknown firmware")
});

function unauthorized() {
  return NextResponse.json({ message: "Pro access required" }, { status: 401 });
}

function toFingerprint(input: z.infer<typeof deviceInputSchema>): FingerprintedDevice {
  return {
    id: randomUUID(),
    ip: input.ip,
    mac: input.mac,
    hostname: input.hostname,
    vendor: input.vendor,
    model: input.model,
    category: input.category,
    osGuess: input.osGuess,
    openPorts: input.openPorts,
    confidence: 0.8,
    discoveredAt: new Date().toISOString()
  };
}

export async function GET(request: NextRequest) {
  if (!getAccessEmailFromRequest(request)) {
    return unauthorized();
  }

  const portsParam = request.nextUrl.searchParams.get("ports");
  const openPorts = (portsParam ?? "")
    .split(",")
    .map((entry) => Number(entry.trim()))
    .filter((entry) => Number.isInteger(entry) && entry > 0 && entry <= 65535);

  const parsed = deviceInputSchema.safeParse({
    vendor: request.nextUrl.searchParams.get("vendor") ?? undefined,
    model: request.nextUrl.searchParams.get("model") ?? undefined,
    hostname: request.nextUrl.searchParams.get("hostname") ?? undefined,
    ip: request.nextUrl.searchParams.get("ip") ?? undefined,
    mac: request.nextUrl.searchParams.get("mac") ?? undefined,
    openPorts,
    category: request.nextUrl.searchParams.get("category") ?? undefined,
    osGuess: request.nextUrl.searchParams.get("osGuess") ?? undefined
  });

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid query parameters" }, { status: 400 });
  }

  const fingerprint = toFingerprint(parsed.data);
  const vulnerabilities = await findVulnerabilitiesForDevice(fingerprint, {
    includeLiveIntel: request.nextUrl.searchParams.get("live") === "1"
  });

  return NextResponse.json({
    vulnerabilities,
    riskScore: calculateDeviceRisk(vulnerabilities, fingerprint.openPorts)
  });
}

export async function POST(request: NextRequest) {
  if (!getAccessEmailFromRequest(request)) {
    return unauthorized();
  }

  const json = await request.json().catch(() => null);
  const parsed = deviceInputSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid device payload" }, { status: 400 });
  }

  const fingerprint = toFingerprint(parsed.data);
  const vulnerabilities = await findVulnerabilitiesForDevice(fingerprint, {
    includeLiveIntel: true
  });

  return NextResponse.json({
    vulnerabilities,
    riskScore: calculateDeviceRisk(vulnerabilities, fingerprint.openPorts)
  });
}
