"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, ShieldAlert } from "lucide-react";

import { DeviceCard } from "@/components/DeviceCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { loadLatestScan } from "@/lib/client-storage";
import type { ScanResult } from "@/lib/types";

export function DevicesView() {
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setScan(loadLatestScan());
  }, []);

  const filtered = useMemo(() => {
    if (!scan) {
      return [];
    }

    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return scan.devices;
    }

    return scan.devices.filter((device) => {
      const haystack = `${device.ip} ${device.hostname ?? ""} ${device.vendor ?? ""} ${device.model ?? ""} ${device.deviceType}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [scan, query]);

  if (!scan) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Device inventory unavailable</CardTitle>
          <CardDescription>Run a scan first to populate your IoT device list.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" onClick={() => (window.location.href = "/scan")}>
            Run scan
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="text-zinc-100">Detected IoT devices</CardTitle>
          <CardDescription>
            Search by IP, hostname, vendor, or model and prioritize devices with elevated risk.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search devices..."
              className="pl-9"
            />
          </div>
          <p className="inline-flex items-center gap-2 text-xs text-zinc-400">
            <ShieldAlert className="h-3.5 w-3.5 text-cyan-300" />
            {filtered.length} of {scan.devices.length} devices shown
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((device) => (
          <DeviceCard key={device.id} device={device} vulnerabilities={scan.vulnerabilities} />
        ))}
      </div>
    </div>
  );
}
