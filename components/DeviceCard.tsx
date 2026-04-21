import { Cpu, EthernetPort, Radar, ShieldCheck } from "lucide-react";
import type { DeviceAssessment } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VulnerabilityAlert } from "@/components/VulnerabilityAlert";

function riskClass(score: number) {
  if (score >= 80) return "text-red-300";
  if (score >= 60) return "text-orange-300";
  if (score >= 35) return "text-amber-300";
  return "text-emerald-300";
}

export function DeviceCard({ assessment }: { assessment: DeviceAssessment }) {
  const { device, vulnerabilities, riskScore } = assessment;

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle>{device.hostname === "unknown" ? device.ip : device.hostname}</CardTitle>
            <CardDescription>
              {device.vendor} • {device.model}
            </CardDescription>
          </div>
          <Badge variant={riskScore >= 80 ? "critical" : riskScore >= 60 ? "high" : riskScore >= 35 ? "medium" : "low"}>
            Risk {riskScore}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-xs text-slate-300 sm:grid-cols-4">
          <div className="rounded-lg border border-slate-700/60 bg-slate-900/50 p-2">
            <p className="mb-1 flex items-center gap-1 text-slate-400">
              <Radar className="h-3.5 w-3.5" />
              IP
            </p>
            <p className="font-mono">{device.ip}</p>
          </div>
          <div className="rounded-lg border border-slate-700/60 bg-slate-900/50 p-2">
            <p className="mb-1 flex items-center gap-1 text-slate-400">
              <EthernetPort className="h-3.5 w-3.5" />
              Ports
            </p>
            <p className="font-mono">{device.openPorts.length > 0 ? device.openPorts.join(", ") : "none"}</p>
          </div>
          <div className="rounded-lg border border-slate-700/60 bg-slate-900/50 p-2">
            <p className="mb-1 flex items-center gap-1 text-slate-400">
              <Cpu className="h-3.5 w-3.5" />
              Category
            </p>
            <p>{device.category}</p>
          </div>
          <div className="rounded-lg border border-slate-700/60 bg-slate-900/50 p-2">
            <p className="mb-1 flex items-center gap-1 text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              Confidence
            </p>
            <p className={riskClass(Math.round(device.confidence * 100))}>{Math.round(device.confidence * 100)}%</p>
          </div>
        </div>

        {vulnerabilities.length === 0 ? (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
            No known vulnerabilities matched this fingerprint. Keep firmware updates enabled and run scans weekly.
          </div>
        ) : (
          <div className="space-y-3">
            {vulnerabilities.map((vulnerability) => (
              <VulnerabilityAlert key={vulnerability.id} vulnerability={vulnerability} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
