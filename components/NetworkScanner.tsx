"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UploadCloud, WandSparkles } from "lucide-react";
import type { ScanReport } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DeviceCard } from "@/components/DeviceCard";
import { formatDateTime } from "@/lib/utils";

const manualDeviceSchema = z.object({
  subnet: z.string().min(7, "Use CIDR format, for example 192.168.1.0/24"),
  ip: z.string().ip("Enter a valid IP address"),
  hostname: z.string().min(1, "Hostname is required"),
  mac: z.string().min(2, "MAC address is required"),
  vendor: z.string().min(2, "Vendor is required"),
  model: z.string().min(2, "Model is required"),
  openPorts: z.string().optional()
});

type ManualDeviceInput = z.infer<typeof manualDeviceSchema>;

export function NetworkScanner() {
  const [jsonPayload, setJsonPayload] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [scanResult, setScanResult] = useState<ScanReport | null>(null);

  const manualForm = useForm<ManualDeviceInput>({
    resolver: zodResolver(manualDeviceSchema),
    defaultValues: {
      subnet: "192.168.1.0/24",
      ip: "",
      hostname: "",
      mac: "",
      vendor: "",
      model: "",
      openPorts: ""
    }
  });

  async function submitScan(payload: Record<string, unknown>) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = (await response.json()) as { message?: string; scan?: ScanReport };
      if (!response.ok || !data.scan) {
        setError(data.message ?? "Scan failed.");
        return;
      }

      setScanResult(data.scan);
    } catch {
      setError("Unable to reach the scan API. Check your connection and retry.");
    } finally {
      setLoading(false);
    }
  }

  async function onSubmitManual(values: ManualDeviceInput) {
    const ports = (values.openPorts ?? "")
      .split(",")
      .map((entry) => Number(entry.trim()))
      .filter((entry) => Number.isInteger(entry) && entry > 0 && entry <= 65535);

    await submitScan({
      source: "manual",
      subnet: values.subnet,
      devices: [
        {
          ip: values.ip,
          hostname: values.hostname,
          mac: values.mac,
          vendor: values.vendor,
          model: values.model,
          openPorts: ports
        }
      ]
    });
  }

  async function onSubmitJson() {
    if (!jsonPayload.trim()) {
      setError("Paste scanner JSON output before submitting.");
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonPayload);
    } catch {
      setError("Scanner JSON is invalid. Validate and try again.");
      return;
    }

    await submitScan({
      source: "script",
      payload: parsed
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-700/60 bg-slate-900/35 p-5">
          <h2 className="mb-2 text-lg font-semibold">Quick Add Device</h2>
          <p className="mb-4 text-sm text-slate-400">
            Use this for immediate checks when you know device details and exposed ports.
          </p>
          <form onSubmit={manualForm.handleSubmit(onSubmitManual)} className="space-y-3">
            <Input placeholder="Subnet (CIDR)" {...manualForm.register("subnet")} />
            <Input placeholder="Device IP" {...manualForm.register("ip")} />
            <Input placeholder="Hostname" {...manualForm.register("hostname")} />
            <Input placeholder="MAC Address" {...manualForm.register("mac")} />
            <Input placeholder="Vendor" {...manualForm.register("vendor")} />
            <Input placeholder="Model" {...manualForm.register("model")} />
            <Input placeholder="Open ports, comma separated (e.g. 22,80,443)" {...manualForm.register("openPorts")} />
            {Object.values(manualForm.formState.errors).length > 0 ? (
              <p className="text-xs text-red-300">{Object.values(manualForm.formState.errors)[0]?.message}</p>
            ) : null}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <WandSparkles className="mr-2 h-4 w-4" />}
              Analyze Device
            </Button>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-700/60 bg-slate-900/35 p-5">
          <h2 className="mb-2 text-lg font-semibold">Import Scanner Output</h2>
          <p className="mb-4 text-sm text-slate-400">
            Run the Python scanner on your home network and paste the JSON output for full-device analysis.
          </p>
          <Textarea
            className="min-h-72 font-mono text-xs"
            placeholder='{"subnet":"192.168.1.0/24","devices":[{"ip":"192.168.1.10","hostname":"living-room-cam","mac":"44:65:0d:12:34:56","openPorts":[80,554]}]}'
            value={jsonPayload}
            onChange={(event) => setJsonPayload(event.target.value)}
          />
          <Button onClick={onSubmitJson} className="mt-3 w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
            Process Scanner Report
          </Button>
          <p className="mt-3 text-xs text-slate-400">
            Download script: <code className="rounded bg-slate-950/70 px-1 py-0.5">curl -O /api/scan?download=script</code>
          </p>
        </section>
      </div>

      {error ? <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</div> : null}

      {scanResult ? (
        <section className="space-y-3">
          <div className="rounded-xl border border-slate-700/60 bg-slate-900/35 p-4">
            <p className="text-sm text-slate-300">Scan completed {formatDateTime(scanResult.scannedAt)}</p>
            <p className="text-xs text-slate-400">
              {scanResult.totalDevices} devices • {scanResult.criticalCount} critical • {scanResult.highCount} high
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {scanResult.assessments.map((assessment) => (
              <DeviceCard key={assessment.device.id} assessment={assessment} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
