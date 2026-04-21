import { randomUUID } from "crypto";
import { z } from "zod";
import type { FingerprintedDevice } from "@/lib/types";
import { normalizeText } from "@/lib/utils";

const ouiMap: Record<string, string> = {
  "b8:27:eb": "Raspberry Pi Foundation",
  "dc:a6:32": "Raspberry Pi Trading",
  "44:65:0d": "Amazon Technologies",
  "a4:77:33": "Google Nest",
  "ec:fa:bc": "Samsung Electronics",
  "e0:76:d0": "TP-Link",
  "00:1a:11": "Cisco",
  "3c:5a:b4": "Apple",
  "f4:f5:d8": "Xiaomi",
  "d8:bb:2c": "Arlo"
};

const rawDeviceSchema = z.object({
  ip: z.string().min(3),
  mac: z.string().optional().default("unknown"),
  hostname: z.string().optional().default("unknown"),
  vendor: z.string().optional(),
  model: z.string().optional(),
  osGuess: z.string().optional(),
  openPorts: z.array(z.number().int().positive().max(65535)).optional().default([])
});

const scannerPayloadSchema = z.union([
  z.object({
    devices: z.array(rawDeviceSchema)
  }),
  z.array(rawDeviceSchema)
]);

type RawDevice = z.infer<typeof rawDeviceSchema>;

function normalizeMac(mac: string) {
  return mac
    .trim()
    .toLowerCase()
    .replace(/[^a-f0-9:]/g, "")
    .replace(/-{1,}/g, ":");
}

function inferVendor(device: RawDevice) {
  if (device.vendor && device.vendor.trim().length > 0) {
    return device.vendor.trim();
  }
  const normalized = normalizeMac(device.mac);
  const prefix = normalized.split(":").slice(0, 3).join(":");
  return ouiMap[prefix] ?? "Unknown Vendor";
}

function inferCategory(hostname: string, model: string, ports: number[]) {
  const lookup = `${hostname} ${model}`.toLowerCase();
  if (lookup.includes("camera") || ports.includes(554)) {
    return "Camera";
  }
  if (lookup.includes("thermostat")) {
    return "Thermostat";
  }
  if (lookup.includes("router") || ports.includes(53) || ports.includes(1900)) {
    return "Router / Gateway";
  }
  if (lookup.includes("speaker") || lookup.includes("echo")) {
    return "Voice Assistant";
  }
  if (lookup.includes("tv") || lookup.includes("chromecast")) {
    return "Media Device";
  }
  return "IoT Device";
}

function inferOsGuess(device: RawDevice) {
  if (device.osGuess && device.osGuess.length > 0) {
    return device.osGuess;
  }

  if (device.openPorts.includes(22)) {
    return "Embedded Linux (SSH exposed)";
  }
  if (device.openPorts.includes(80) || device.openPorts.includes(443)) {
    return "Linux-based firmware";
  }
  return "Unknown firmware";
}

function calculateConfidence(device: RawDevice, vendor: string, model: string) {
  let score = 0.45;
  if (vendor !== "Unknown Vendor") score += 0.2;
  if (model !== "Unknown Model") score += 0.15;
  if (device.openPorts.length > 0) score += 0.15;
  if (normalizeText(device.hostname) !== "unknown") score += 0.05;
  return Number(Math.min(score, 0.99).toFixed(2));
}

export function parseScannerPayload(payload: unknown): RawDevice[] {
  const parsed = scannerPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error("Scanner payload is invalid. Ensure JSON includes a devices array.");
  }

  if (Array.isArray(parsed.data)) {
    return parsed.data;
  }

  return parsed.data.devices;
}

export function fingerprintDevices(payload: unknown) {
  const rawDevices = parseScannerPayload(payload);

  return rawDevices.map<FingerprintedDevice>((device) => {
    const vendor = inferVendor(device);
    const model = device.model?.trim() || "Unknown Model";
    const hostname = device.hostname?.trim() || "unknown";

    return {
      id: randomUUID(),
      ip: device.ip,
      mac: normalizeMac(device.mac),
      hostname,
      vendor,
      model,
      category: inferCategory(hostname, model, device.openPorts),
      osGuess: inferOsGuess(device),
      openPorts: [...new Set(device.openPorts)].sort((a, b) => a - b),
      confidence: calculateConfidence(device, vendor, model),
      discoveredAt: new Date().toISOString()
    };
  });
}
