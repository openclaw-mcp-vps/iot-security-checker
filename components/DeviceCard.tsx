import { Router, ShieldCheck, ShieldX, TriangleAlert } from "lucide-react";

import type { DetectedDevice, VulnerabilityFinding } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function riskTone(level: DetectedDevice["riskLevel"]) {
  switch (level) {
    case "critical":
      return "text-rose-300 border-rose-500/20 bg-rose-500/10";
    case "high":
      return "text-orange-300 border-orange-500/20 bg-orange-500/10";
    case "medium":
      return "text-amber-300 border-amber-500/20 bg-amber-500/10";
    default:
      return "text-emerald-300 border-emerald-500/20 bg-emerald-500/10";
  }
}

export function DeviceCard({
  device,
  vulnerabilities
}: {
  device: DetectedDevice;
  vulnerabilities: VulnerabilityFinding[];
}) {
  const related = vulnerabilities.filter((finding) => finding.deviceId === device.id);
  const hasCritical = related.some((finding) => finding.severity === "critical");

  return (
    <Card className="border-zinc-800 bg-[#111926]">
      <CardHeader className="space-y-3 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base text-zinc-100">
            {device.hostname || device.model || device.ip}
          </CardTitle>
          <Badge variant="outline" className={riskTone(device.riskLevel)}>
            {device.riskLevel.toUpperCase()} · Risk {device.riskScore}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
          <span className="inline-flex items-center gap-1">
            <Router className="h-3.5 w-3.5" />
            {device.ip}
          </span>
          <span>{device.vendor || "Unknown vendor"}</span>
          <span>{device.deviceType}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {device.openPorts.map((port) => (
            <Badge key={port} variant="secondary" className="bg-zinc-900 text-zinc-300">
              {port}
            </Badge>
          ))}
        </div>
        <div className="rounded-md border border-zinc-800 bg-[#0c121b] p-3 text-sm">
          <p className="text-zinc-300">
            Services: {device.services.length > 0 ? device.services.join(", ") : "Service fingerprint unavailable"}
          </p>
          <p className="mt-2 text-zinc-400">Model fingerprint: {device.model || "Unknown"}</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {related.length === 0 ? (
            <span className="inline-flex items-center gap-1 text-emerald-300">
              <ShieldCheck className="h-4 w-4" />
              No matching known CVEs from the current intelligence set
            </span>
          ) : hasCritical ? (
            <span className="inline-flex items-center gap-1 text-rose-300">
              <ShieldX className="h-4 w-4" />
              {related.length} vulnerability matches, including critical findings
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-amber-300">
              <TriangleAlert className="h-4 w-4" />
              {related.length} vulnerability matches need remediation
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
