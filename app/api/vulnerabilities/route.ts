import { NextResponse } from "next/server";

import { fetchRelevantLiveThreats, matchVulnerabilities } from "@/lib/vulnerability-db";
import type { DetectedDevice } from "@/lib/types";

function pseudoDevicesFromModels(rawModels: string): DetectedDevice[] {
  const models = rawModels
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  return models.map((model, index) => ({
    id: `pseudo-${index}`,
    ip: `192.168.1.${index + 10}`,
    model,
    hostname: model.toLowerCase().replace(/\s+/g, "-") + ".local",
    vendor: model.split(" ")[0],
    deviceType: model.toLowerCase().includes("camera") ? "Camera" : "Unknown IoT Device",
    openPorts: [80, 443],
    services: ["http", "https"],
    confidence: 0.4,
    riskScore: 30,
    riskLevel: "medium",
    lastSeen: new Date().toISOString()
  }));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const models = searchParams.get("models") || "";
  const includeLive = searchParams.get("live") === "1";

  if (!models) {
    return NextResponse.json({
      vulnerabilities: [],
      liveThreats: []
    });
  }

  const devices = pseudoDevicesFromModels(models);
  const vulnerabilities = matchVulnerabilities(devices).slice(0, 12);
  const liveThreats = includeLive ? await fetchRelevantLiveThreats(devices) : [];

  return NextResponse.json({ vulnerabilities, liveThreats });
}
