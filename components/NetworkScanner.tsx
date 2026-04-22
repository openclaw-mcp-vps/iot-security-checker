"use client";

import { useMemo, useState } from "react";
import { Download, Loader2, Radar, ShieldCheck, UploadCloud } from "lucide-react";

import { DeviceCard } from "@/components/DeviceCard";
import { VulnerabilityAlert } from "@/components/VulnerabilityAlert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { saveLatestScan } from "@/lib/client-storage";
import type { ScanResult } from "@/lib/types";

const scanCommands = {
  macLinux: "sudo nmap -sS -sV -O --open --script vuln 192.168.1.0/24 -oN iot_scan.txt",
  windows: "nmap.exe -sS -sV -O --open --script vuln 192.168.1.0/24 -oN iot_scan.txt",
  grepable: "sudo nmap -sV --open 192.168.1.0/24 -oG iot_scan.gnmap"
};

function buildBrowserDiscoverySample(ip?: string) {
  const hostIp = ip || "192.168.1.42";
  const gateway = hostIp.replace(/\.\d+$/, ".1");

  return JSON.stringify(
    [
      {
        ip: gateway,
        hostname: "home-router.local",
        vendor: "TP-Link",
        model: "Archer AX21",
        openPorts: [53, 80, 443, 1900],
        services: ["dns", "http", "https", "upnp"]
      },
      {
        ip: hostIp,
        hostname: "livingroom-camera",
        vendor: "Hikvision",
        openPorts: [80, 554],
        services: ["http", "rtsp"]
      }
    ],
    null,
    2
  );
}

async function detectLocalIp() {
  return new Promise<string | undefined>((resolve) => {
    const connection = new RTCPeerConnection({ iceServers: [] });
    connection.createDataChannel("scanner");

    connection.onicecandidate = (event) => {
      if (!event.candidate) {
        resolve(undefined);
        connection.close();
        return;
      }

      const match = event.candidate.candidate.match(/(\d+\.\d+\.\d+\.\d+)/);
      if (match && !match[1].startsWith("127.")) {
        resolve(match[1]);
        connection.close();
      }
    };

    connection
      .createOffer()
      .then((offer) => connection.setLocalDescription(offer))
      .catch(() => {
        resolve(undefined);
        connection.close();
      });

    setTimeout(() => {
      resolve(undefined);
      connection.close();
    }, 1500);
  });
}

export function NetworkScanner() {
  const [label, setLabel] = useState("Home network");
  const [scanOutput, setScanOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);

  const vulnerableCount = useMemo(() => {
    if (!result) {
      return 0;
    }
    return new Set(result.vulnerabilities.map((finding) => finding.deviceId)).size;
  }, [result]);

  async function runAnalysis() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          scanOutput,
          networkName: label
        })
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || "Failed to analyze scan output");
      }

      const payload = (await response.json()) as ScanResult;
      setResult(payload);
      saveLatestScan(payload);
    } catch (analysisError) {
      setError(analysisError instanceof Error ? analysisError.message : "Unexpected scanner error");
    } finally {
      setLoading(false);
    }
  }

  async function generateBrowserDiscovery() {
    const localIp = await detectLocalIp();
    setScanOutput(buildBrowserDiscoverySample(localIp));
    setError(null);
  }

  return (
    <div className="space-y-6">
      <Card className="border-cyan-500/30 bg-[#101a28]">
        <CardHeader>
          <CardTitle className="text-cyan-100">Start a network scan</CardTitle>
          <CardDescription className="text-zinc-300">
            Run the script on a trusted computer in your home network, then paste the output below for vulnerability analysis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 md:grid-cols-2">
            <a
              href="/scripts/scan-network.sh"
              download
              className="group rounded-lg border border-zinc-700 bg-[#0d141f] p-4 hover:border-cyan-400"
            >
              <p className="flex items-center gap-2 text-sm font-medium text-zinc-100">
                <Download className="h-4 w-4 text-cyan-300" />
                Download macOS/Linux script
              </p>
              <p className="mt-2 text-xs text-zinc-400">One-step Nmap script that writes `iot_scan.txt`.</p>
            </a>
            <a
              href="/scripts/scan-network.ps1"
              download
              className="group rounded-lg border border-zinc-700 bg-[#0d141f] p-4 hover:border-cyan-400"
            >
              <p className="flex items-center gap-2 text-sm font-medium text-zinc-100">
                <Download className="h-4 w-4 text-cyan-300" />
                Download Windows PowerShell script
              </p>
              <p className="mt-2 text-xs text-zinc-400">Runs the same scan profile and exports plain text output.</p>
            </a>
          </div>

          <div className="grid gap-2 md:grid-cols-3">
            <code className="rounded-md border border-zinc-700 bg-[#0b121c] p-3 text-xs text-zinc-300">
              {scanCommands.macLinux}
            </code>
            <code className="rounded-md border border-zinc-700 bg-[#0b121c] p-3 text-xs text-zinc-300">
              {scanCommands.windows}
            </code>
            <code className="rounded-md border border-zinc-700 bg-[#0b121c] p-3 text-xs text-zinc-300">
              {scanCommands.grepable}
            </code>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label htmlFor="network-name" className="text-sm text-zinc-300">
                Network label
              </label>
              <Button type="button" variant="secondary" size="sm" onClick={generateBrowserDiscovery}>
                <Radar className="mr-2 h-4 w-4" />
                Browser discovery preview
              </Button>
            </div>
            <Input
              id="network-name"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder="Home + office VLAN"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="scan-output" className="text-sm text-zinc-300">
              Scan output
            </label>
            <Textarea
              id="scan-output"
              value={scanOutput}
              onChange={(event) => setScanOutput(event.target.value)}
              placeholder="Paste nmap text output or JSON scan output here"
              className="min-h-[220px]"
            />
            <p className="text-xs text-zinc-400">
              Supports standard Nmap text output, grepable `-oG` output, or JSON arrays with `ip` and `openPorts`.
            </p>
          </div>

          {error ? <p className="text-sm text-rose-300">{error}</p> : null}

          <Button type="button" size="lg" className="w-full" onClick={runAnalysis} disabled={loading || !scanOutput.trim()}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing devices and threat exposure...
              </>
            ) : (
              <>
                <UploadCloud className="mr-2 h-4 w-4" />
                Analyze scan
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-zinc-100">Scan summary</CardTitle>
              <CardDescription className="text-zinc-300">
                {result.riskSummary.deviceCount} devices discovered, {vulnerableCount} devices with known exposures
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-4">
              <div className="rounded-lg border border-zinc-700 bg-[#0b121c] p-3">
                <p className="text-xs text-zinc-400">Average risk score</p>
                <p className="text-xl font-semibold text-zinc-100">{result.riskSummary.averageRiskScore}</p>
              </div>
              <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-3">
                <p className="text-xs text-rose-200">Critical findings</p>
                <p className="text-xl font-semibold text-rose-100">{result.riskSummary.criticalCount}</p>
              </div>
              <div className="rounded-lg border border-orange-500/20 bg-orange-500/10 p-3">
                <p className="text-xs text-orange-200">High findings</p>
                <p className="text-xl font-semibold text-orange-100">{result.riskSummary.highCount}</p>
              </div>
              <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-3">
                <p className="text-xs text-cyan-200">Actionable recommendations</p>
                <p className="text-xl font-semibold text-cyan-100">{result.recommendations.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-zinc-100">Immediate mitigation plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {result.recommendations.map((item) => (
                <div key={item} className="rounded-md border border-zinc-800 bg-[#0c121b] p-3 text-sm text-zinc-200">
                  <ShieldCheck className="mr-2 inline-block h-4 w-4 text-cyan-300" />
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            {result.devices.map((device) => (
              <DeviceCard key={device.id} device={device} vulnerabilities={result.vulnerabilities} />
            ))}
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-zinc-100">Matched vulnerability advisories</h3>
            <div className="space-y-3">
              {result.vulnerabilities.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-sm text-zinc-300">
                    No known CVEs were matched in this scan. Keep weekly scans enabled because advisories are updated continuously.
                  </CardContent>
                </Card>
              ) : (
                result.vulnerabilities.map((finding) => (
                  <VulnerabilityAlert key={finding.id} finding={finding} />
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
