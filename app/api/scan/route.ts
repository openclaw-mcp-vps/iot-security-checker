import { promises as fs } from "fs";
import path from "path";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { fingerprintDevices } from "@/lib/device-fingerprinting";
import { getAccessEmailFromRequest } from "@/lib/lemonsqueezy";
import { calculateDeviceRisk, findVulnerabilitiesForDevice } from "@/lib/vulnerability-db";
import { saveScan } from "@/lib/data-store";
import { sendThreatAlertEmail } from "@/lib/mailer";

export const runtime = "nodejs";

const scanRequestSchema = z
  .object({
    source: z.enum(["script", "browser", "manual"]).default("manual"),
    subnet: z.string().optional(),
    payload: z.unknown().optional(),
    devices: z.array(z.unknown()).optional(),
    includeLiveIntel: z.boolean().optional().default(false)
  })
  .refine((value) => value.payload !== undefined || value.devices !== undefined, {
    message: "Provide payload or devices in request body."
  });

function countSeverities(vulnerabilities: Array<{ severity: string }>) {
  return vulnerabilities.reduce(
    (acc, vulnerability) => {
      switch (vulnerability.severity) {
        case "critical":
          acc.critical += 1;
          break;
        case "high":
          acc.high += 1;
          break;
        case "medium":
          acc.medium += 1;
          break;
        default:
          acc.low += 1;
      }
      return acc;
    },
    { critical: 0, high: 0, medium: 0, low: 0 }
  );
}

export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.get("download") === "script") {
    const scriptPath = path.join(process.cwd(), "scripts", "network-scanner.py");
    const scriptBody = await fs.readFile(scriptPath, "utf8");

    return new NextResponse(scriptBody, {
      status: 200,
      headers: {
        "Content-Type": "text/x-python",
        "Content-Disposition": 'attachment; filename="network-scanner.py"'
      }
    });
  }

  return NextResponse.json(
    {
      message: "Use POST to submit scan payloads or GET ?download=script to retrieve the scanner script."
    },
    { status: 200 }
  );
}

export async function POST(request: NextRequest) {
  const accessEmail = getAccessEmailFromRequest(request);
  if (!accessEmail) {
    return NextResponse.json({ message: "Pro access required." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = scanRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: parsed.error.issues[0]?.message ?? "Invalid scan payload"
      },
      { status: 400 }
    );
  }

  const payload = parsed.data.payload ?? { devices: parsed.data.devices };

  let devices;
  try {
    devices = fingerprintDevices(payload);
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Unable to parse scanner payload"
      },
      { status: 400 }
    );
  }

  const assessments = await Promise.all(
    devices.map(async (device) => {
      const vulnerabilities = await findVulnerabilitiesForDevice(device, {
        includeLiveIntel: parsed.data.includeLiveIntel
      });

      return {
        device,
        vulnerabilities,
        riskScore: calculateDeviceRisk(vulnerabilities, device.openPorts)
      };
    })
  );

  assessments.sort((a, b) => b.riskScore - a.riskScore);

  const allVulnerabilities = assessments.flatMap((assessment) => assessment.vulnerabilities);
  const severityCounts = countSeverities(allVulnerabilities);

  const scan = await saveScan({
    source: parsed.data.source,
    subnet: parsed.data.subnet ?? "unknown",
    scannedAt: new Date().toISOString(),
    totalDevices: assessments.length,
    criticalCount: severityCounts.critical,
    highCount: severityCounts.high,
    mediumCount: severityCounts.medium,
    lowCount: severityCounts.low,
    assessments
  });

  if (severityCounts.critical > 0 || severityCounts.high > 0) {
    await sendThreatAlertEmail({
      to: accessEmail,
      criticalCount: severityCounts.critical,
      highCount: severityCounts.high,
      scanTime: scan.scannedAt
    }).catch(() => undefined);
  }

  return NextResponse.json({
    message: "Scan complete",
    scan
  });
}
