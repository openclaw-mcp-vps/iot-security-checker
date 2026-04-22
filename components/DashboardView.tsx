"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { BellRing, ScanSearch, ShieldCheck, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { loadLatestScan } from "@/lib/client-storage";
import { formatDateTime } from "@/lib/utils";
import type { ScanResult } from "@/lib/types";

const riskColors = {
  low: "#34d399",
  medium: "#f59e0b",
  high: "#f97316",
  critical: "#f43f5e"
};

export function DashboardView() {
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [liveThreats, setLiveThreats] = useState<Array<{ cve: string; title: string; source: string }>>([]);

  useEffect(() => {
    setScan(loadLatestScan());
  }, []);

  useEffect(() => {
    if (!scan) {
      return;
    }

    const query = encodeURIComponent(scan.devices.map((device) => device.model).join(","));
    fetch(`/api/vulnerabilities?models=${query}&live=1`)
      .then((response) => response.json())
      .then((payload) => {
        const entries = Array.isArray(payload?.liveThreats) ? payload.liveThreats : [];
        setLiveThreats(entries.slice(0, 4));
      })
      .catch(() => setLiveThreats([]));
  }, [scan]);

  const riskData = useMemo(() => {
    if (!scan) {
      return [];
    }

    return scan.devices.map((device) => ({
      name: device.hostname || device.ip,
      risk: device.riskScore
    }));
  }, [scan]);

  const severityBreakdown = useMemo(() => {
    if (!scan) {
      return [];
    }

    const counts = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    };

    for (const finding of scan.vulnerabilities) {
      counts[finding.severity] += 1;
    }

    return Object.entries(counts)
      .filter(([, value]) => value > 0)
      .map(([key, value]) => ({
        name: key,
        value
      }));
  }, [scan]);

  if (!scan) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No scan data yet</CardTitle>
          <CardDescription>
            Run your first scan to build device inventory, baseline risk, and vulnerability tracking.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" onClick={() => (window.location.href = "/scan")}>
            <ScanSearch className="mr-2 h-4 w-4" />
            Run first scan
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Devices monitored</CardDescription>
            <CardTitle className="text-2xl">{scan.riskSummary.deviceCount}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-zinc-400">Last scan: {formatDateTime(scan.generatedAt)}</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Vulnerable devices</CardDescription>
            <CardTitle className="text-2xl text-orange-200">{scan.riskSummary.vulnerableDeviceCount}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-zinc-400">Devices with at least one finding</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Critical findings</CardDescription>
            <CardTitle className="text-2xl text-rose-200">{scan.riskSummary.criticalCount}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-zinc-400">Patch these first in the next 24h</CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average risk</CardDescription>
            <CardTitle className="text-2xl text-cyan-200">{scan.riskSummary.averageRiskScore}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-zinc-400">Composite score out of 100</CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-zinc-100">Device risk scores</CardTitle>
            <CardDescription>Higher bars represent more exposed attack surface.</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskData}>
                <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} interval={0} angle={-15} dy={12} />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: "8px"
                  }}
                />
                <Bar dataKey="risk" fill="#22d3ee" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-zinc-100">Severity distribution</CardTitle>
            <CardDescription>Tracks where remediation effort should focus.</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {severityBreakdown.length === 0 ? (
              <p className="text-sm text-zinc-400">No current matched CVEs in your last scan.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={severityBreakdown} dataKey="value" nameKey="name" outerRadius={92} label>
                    {severityBreakdown.map((entry) => (
                      <Cell key={entry.name} fill={riskColors[entry.name as keyof typeof riskColors]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: "8px"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2 text-zinc-100">
              <TriangleAlert className="h-4 w-4 text-orange-300" />
              Recommended next actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {scan.recommendations.map((item) => (
              <div key={item} className="rounded-md border border-zinc-800 bg-[#0b121c] p-3 text-sm text-zinc-200">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2 text-zinc-100">
              <BellRing className="h-4 w-4 text-cyan-300" />
              Live KEV watchlist
            </CardTitle>
            <CardDescription>Freshly reported exploited CVEs relevant to your detected vendor/model mix.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {liveThreats.length === 0 ? (
              <p className="text-sm text-zinc-400">
                No additional KEV matches from the live feed right now. Your local vulnerability dataset is still active.
              </p>
            ) : (
              liveThreats.map((threat) => (
                <div key={threat.cve} className="rounded-md border border-zinc-800 bg-[#0b121c] p-3 text-sm">
                  <p className="font-medium text-zinc-100">{threat.cve}</p>
                  <p className="text-zinc-300">{threat.title}</p>
                  <p className="text-xs text-zinc-500">{threat.source}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-cyan-500/30 bg-cyan-500/10">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
          <p className="inline-flex items-center gap-2 text-sm text-cyan-100">
            <ShieldCheck className="h-4 w-4" />
            Re-run a scan after firmware updates to verify risk reduction.
          </p>
          <Button type="button" variant="secondary" onClick={() => (window.location.href = "/scan")}>
            Start a new scan
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
