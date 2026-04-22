import crypto from "node:crypto";

import type { DetectedDevice, RiskLevel } from "@/lib/types";

interface PartialDevice {
  ip: string;
  hostname?: string;
  mac?: string;
  vendor?: string;
  openPorts: number[];
  services: string[];
  os?: string;
}

function hashDeviceSeed(seed: string) {
  return crypto.createHash("sha256").update(seed).digest("hex").slice(0, 16);
}

function normalizeHostname(hostname?: string) {
  if (!hostname) {
    return undefined;
  }

  const trimmed = hostname.trim();
  return trimmed.length > 0 && trimmed !== "()" ? trimmed : undefined;
}

function inferVendor(device: PartialDevice) {
  const combined = [
    device.hostname,
    device.vendor,
    device.services.join(" "),
    device.os
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const vendorMatchers: Array<[string, string[]]> = [
    ["TP-Link", ["tp-link", "tplink"]],
    ["D-Link", ["d-link", "dlink"]],
    ["Netgear", ["netgear", "r7000", "nighthawk"]],
    ["Hikvision", ["hikvision", "hik"]],
    ["Dahua", ["dahua"]],
    ["Ring", ["ring-"]],
    ["Google Nest", ["nest", "google-home"]],
    ["Amazon", ["echo", "alexa", "firetv"]],
    ["Ubiquiti", ["ubnt", "ubiquiti", "unifi"]],
    ["Synology", ["synology", "diskstation"]]
  ];

  for (const [vendor, needles] of vendorMatchers) {
    if (needles.some((needle) => combined.includes(needle))) {
      return vendor;
    }
  }

  return device.vendor;
}

function inferDeviceType(device: PartialDevice) {
  const ports = new Set(device.openPorts);
  const services = device.services.join(" ").toLowerCase();
  const hostname = (device.hostname ?? "").toLowerCase();

  if (
    ports.has(554) ||
    ports.has(37777) ||
    services.includes("rtsp") ||
    hostname.includes("camera")
  ) {
    return "Camera";
  }

  if (
    ports.has(1883) ||
    ports.has(8883) ||
    ports.has(5683) ||
    services.includes("mqtt") ||
    hostname.includes("sensor")
  ) {
    return "Sensor/Hub";
  }

  if (
    ports.has(1900) ||
    services.includes("upnp") ||
    ports.has(5000) ||
    ports.has(5001)
  ) {
    return "Smart Appliance";
  }

  if (ports.has(53) || ports.has(67) || ports.has(443) || hostname.includes("router")) {
    return "Router/Gateway";
  }

  if (ports.has(22) || ports.has(3389)) {
    return "General Compute Device";
  }

  return "Unknown IoT Device";
}

function inferModel(vendor: string | undefined, device: PartialDevice) {
  const source = [device.hostname, device.os, device.services.join(" ")]
    .filter(Boolean)
    .join(" ");

  if (!source) {
    return vendor ? `${vendor} Device` : "Unidentified Device";
  }

  const commonModelPatterns = [
    /AX\d{4,5}/i,
    /R\d{3,4}/i,
    /DS-[0-9A-Z]+/i,
    /IPC-[0-9A-Z-]+/i,
    /C[0-9]{3}/i,
    /NVR[0-9A-Z-]*/i,
    /Tapo\s+[A-Z0-9]+/i
  ];

  for (const pattern of commonModelPatterns) {
    const match = source.match(pattern);
    if (match) {
      return match[0];
    }
  }

  if (vendor) {
    return `${vendor} ${inferDeviceType(device)}`;
  }

  return "Unidentified Device";
}

function scoreRisk(device: PartialDevice): { riskScore: number; riskLevel: RiskLevel } {
  const ports = new Set(device.openPorts);
  const services = device.services.join(" ").toLowerCase();

  let score = Math.min(device.openPorts.length * 4, 25);

  if (ports.has(23)) {
    score += 35;
  }
  if (ports.has(21)) {
    score += 12;
  }
  if (ports.has(22)) {
    score += 8;
  }
  if (ports.has(80)) {
    score += 8;
  }
  if (ports.has(8080) || ports.has(8443)) {
    score += 6;
  }
  if (ports.has(554)) {
    score += 12;
  }
  if (ports.has(1883)) {
    score += 15;
  }
  if (ports.has(1900) || services.includes("upnp")) {
    score += 10;
  }
  if (ports.has(37777)) {
    score += 15;
  }

  score = Math.min(score, 100);

  if (score >= 80) {
    return { riskScore: score, riskLevel: "critical" };
  }
  if (score >= 55) {
    return { riskScore: score, riskLevel: "high" };
  }
  if (score >= 30) {
    return { riskScore: score, riskLevel: "medium" };
  }

  return { riskScore: score, riskLevel: "low" };
}

function mapPartialToDevice(device: PartialDevice): DetectedDevice {
  const normalizedVendor = inferVendor(device);
  const model = inferModel(normalizedVendor, device);
  const { riskScore, riskLevel } = scoreRisk(device);
  const seed = `${device.ip}-${device.mac ?? "na"}-${model}`;

  return {
    id: hashDeviceSeed(seed),
    ip: device.ip,
    mac: device.mac,
    hostname: normalizeHostname(device.hostname),
    vendor: normalizedVendor,
    model,
    deviceType: inferDeviceType(device),
    openPorts: [...new Set(device.openPorts)].sort((a, b) => a - b),
    services: [...new Set(device.services.map((service) => service.toLowerCase()))],
    os: device.os,
    confidence: device.openPorts.length > 0 ? 0.82 : 0.56,
    riskScore,
    riskLevel,
    lastSeen: new Date().toISOString()
  };
}

function parseGrepableNmap(input: string): PartialDevice[] {
  const devices: PartialDevice[] = [];
  const lines = input.split(/\r?\n/);
  const macByIp = new Map<string, { mac: string; vendor?: string }>();

  for (const line of lines) {
    const macMatch = line.match(
      /^Host:\s+([0-9a-fA-F:.]+)\s+\(.+\)\s+Status:\s+Up\s+MAC Address:\s+([0-9A-F:]{17})\s+\(([^)]+)\)/
    );
    if (macMatch) {
      macByIp.set(macMatch[1], { mac: macMatch[2], vendor: macMatch[3] });
    }
  }

  for (const line of lines) {
    if (!line.startsWith("Host:")) {
      continue;
    }

    const hostMatch = line.match(/^Host:\s+([0-9a-fA-F:.]+)\s+\(([^)]*)\)(.*)$/);
    if (!hostMatch) {
      continue;
    }

    const ip = hostMatch[1];
    const hostname = normalizeHostname(hostMatch[2]);
    const remainder = hostMatch[3];

    const portsBlockMatch = remainder.match(/Ports:\s+([^\t]+)/);
    const openPorts: number[] = [];
    const services: string[] = [];

    if (portsBlockMatch) {
      const portEntries = portsBlockMatch[1].split(",").map((entry) => entry.trim());
      for (const entry of portEntries) {
        const openMatch = entry.match(/^(\d+)\/open\/\w+\/\/([^\/]*)/);
        if (openMatch) {
          openPorts.push(Number.parseInt(openMatch[1], 10));
          if (openMatch[2]) {
            services.push(openMatch[2]);
          }
        }
      }
    }

    if (openPorts.length === 0) {
      continue;
    }

    const macMeta = macByIp.get(ip);

    devices.push({
      ip,
      hostname,
      mac: macMeta?.mac,
      vendor: macMeta?.vendor,
      openPorts,
      services
    });
  }

  return devices;
}

function parseStandardNmap(input: string): PartialDevice[] {
  const devices: PartialDevice[] = [];
  const lines = input.split(/\r?\n/);
  let current: PartialDevice | null = null;
  let inPortTable = false;

  for (const line of lines) {
    const reportMatch = line.match(/^Nmap scan report for\s+(.+)$/);
    if (reportMatch) {
      if (current && current.openPorts.length > 0) {
        devices.push(current);
      }

      const hostData = reportMatch[1].trim();
      const ipInParenthesis = hostData.match(/\(([^)]+)\)$/);
      let ip = hostData;
      let hostname: string | undefined;

      if (ipInParenthesis) {
        ip = ipInParenthesis[1];
        hostname = hostData.replace(/\s*\([^)]+\)$/, "");
      }

      current = {
        ip,
        hostname,
        openPorts: [],
        services: []
      };
      inPortTable = false;
      continue;
    }

    if (!current) {
      continue;
    }

    const macMatch = line.match(/^MAC Address:\s+([0-9A-F:]{17})\s+\(([^)]+)\)/i);
    if (macMatch) {
      current.mac = macMatch[1].toUpperCase();
      current.vendor = macMatch[2];
      continue;
    }

    const osMatch = line.match(/^OS details:\s+(.+)$/);
    if (osMatch) {
      current.os = osMatch[1];
      continue;
    }

    if (line.startsWith("PORT")) {
      inPortTable = true;
      continue;
    }

    if (inPortTable && line.trim() === "") {
      inPortTable = false;
      continue;
    }

    if (!inPortTable) {
      continue;
    }

    const portLineMatch = line.match(/^(\d+)\/(tcp|udp)\s+open\s+([^\s]+)/i);
    if (portLineMatch) {
      current.openPorts.push(Number.parseInt(portLineMatch[1], 10));
      current.services.push(portLineMatch[3]);
    }
  }

  if (current && current.openPorts.length > 0) {
    devices.push(current);
  }

  return devices;
}

function parseJsonScan(input: string): PartialDevice[] {
  const parsed = JSON.parse(input) as unknown;

  if (!Array.isArray(parsed)) {
    throw new Error("JSON scan input must be an array of devices");
  }

  const partials: PartialDevice[] = [];

  for (const entry of parsed) {
    if (!entry || typeof entry !== "object") {
      continue;
    }

    const candidate = entry as Record<string, unknown>;
    const ip = typeof candidate.ip === "string" ? candidate.ip : undefined;
    const ports = Array.isArray(candidate.openPorts)
      ? candidate.openPorts
          .map((port) => Number(port))
          .filter((port) => Number.isFinite(port) && port > 0)
      : [];

    if (!ip || ports.length === 0) {
      continue;
    }

    partials.push({
      ip,
      hostname: typeof candidate.hostname === "string" ? candidate.hostname : undefined,
      mac: typeof candidate.mac === "string" ? candidate.mac : undefined,
      vendor: typeof candidate.vendor === "string" ? candidate.vendor : undefined,
      os: typeof candidate.os === "string" ? candidate.os : undefined,
      openPorts: ports,
      services: Array.isArray(candidate.services)
        ? candidate.services
            .filter((service): service is string => typeof service === "string")
            .map((service) => service.toLowerCase())
        : []
    });
  }

  return partials;
}

export function parseScanOutput(scanOutput: string): DetectedDevice[] {
  const trimmed = scanOutput.trim();

  if (!trimmed) {
    return [];
  }

  let devices: PartialDevice[] = [];

  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    try {
      devices = parseJsonScan(trimmed);
    } catch {
      devices = [];
    }
  }

  if (devices.length === 0 && trimmed.includes("Host:") && trimmed.includes("Ports:")) {
    devices = parseGrepableNmap(trimmed);
  }

  if (devices.length === 0 && trimmed.includes("Nmap scan report for")) {
    devices = parseStandardNmap(trimmed);
  }

  const deduped = new Map<string, PartialDevice>();

  for (const device of devices) {
    const key = device.mac ? `${device.ip}-${device.mac}` : device.ip;
    deduped.set(key, device);
  }

  return [...deduped.values()].map(mapPartialToDevice);
}

export function getSampleScanCommands() {
  return {
    macLinux:
      "sudo nmap -sS -sV -O --open --script vuln 192.168.1.0/24 -oN iot_scan.txt",
    windows:
      "nmap.exe -sS -sV -O --open --script vuln 192.168.1.0/24 -oN iot_scan.txt",
    grepable:
      "sudo nmap -sV --open 192.168.1.0/24 -oG iot_scan.gnmap"
  };
}
