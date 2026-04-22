import { NextResponse } from "next/server";
import { z } from "zod";

import { parseScanOutput } from "@/lib/device-detector";
import { saveScanHistory } from "@/lib/scan-history";
import { buildScanSummary, buildSecurityRecommendations, matchVulnerabilities } from "@/lib/vulnerability-db";
import type { ScanResult } from "@/lib/types";

const scanSchema = z.object({
  scanOutput: z.string().min(1, "Scan output cannot be empty"),
  networkName: z.string().max(80).optional().default("Home network")
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = scanSchema.parse(body);

    const devices = parseScanOutput(input.scanOutput);

    if (devices.length === 0) {
      return NextResponse.json(
        {
          error:
            "No devices were detected from the provided scan output. Ensure your input includes Nmap report lines or JSON with open ports."
        },
        { status: 400 }
      );
    }

    const vulnerabilities = matchVulnerabilities(devices);
    const result: ScanResult = {
      devices,
      vulnerabilities,
      recommendations: buildSecurityRecommendations(devices, vulnerabilities),
      generatedAt: new Date().toISOString(),
      riskSummary: buildScanSummary(devices, vulnerabilities)
    };

    await saveScanHistory(input.networkName, result);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Invalid scan payload" }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to process scan result" }, { status: 500 });
  }
}
