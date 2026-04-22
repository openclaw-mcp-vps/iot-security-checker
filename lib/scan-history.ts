import { promises as fs } from "node:fs";
import path from "node:path";

import type { ScanResult } from "@/lib/types";

interface ScanHistoryEntry {
  id: string;
  networkName: string;
  result: ScanResult;
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const SCANS_FILE = path.join(DATA_DIR, "scan-history.json");

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(SCANS_FILE);
  } catch {
    await fs.writeFile(SCANS_FILE, "[]", "utf8");
  }
}

async function readHistory() {
  await ensureStore();
  const raw = await fs.readFile(SCANS_FILE, "utf8");

  try {
    const parsed = JSON.parse(raw) as ScanHistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveScanHistory(networkName: string, result: ScanResult) {
  const history = await readHistory();
  history.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    networkName,
    result,
    createdAt: new Date().toISOString()
  });

  await fs.writeFile(SCANS_FILE, JSON.stringify(history.slice(0, 30), null, 2), "utf8");
}
