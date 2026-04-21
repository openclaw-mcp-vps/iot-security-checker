import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { PurchaseRecord, ScanReport } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");
const SCANS_FILE = path.join(DATA_DIR, "scans.json");
const PURCHASES_FILE = path.join(DATA_DIR, "purchases.json");

async function ensureFile(filePath: string, fallback: unknown) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, JSON.stringify(fallback, null, 2), "utf8");
  }
}

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  await ensureFile(filePath, fallback);
  const data = await fs.readFile(filePath, "utf8");
  try {
    return JSON.parse(data) as T;
  } catch {
    await fs.writeFile(filePath, JSON.stringify(fallback, null, 2), "utf8");
    return fallback;
  }
}

async function writeJsonFile<T>(filePath: string, value: T) {
  await ensureFile(filePath, value);
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), "utf8");
}

export async function listScans() {
  return readJsonFile<ScanReport[]>(SCANS_FILE, []);
}

export async function saveScan(scan: Omit<ScanReport, "id">) {
  const scans = await listScans();
  const withId: ScanReport = {
    ...scan,
    id: randomUUID()
  };
  scans.unshift(withId);
  await writeJsonFile(SCANS_FILE, scans.slice(0, 100));
  return withId;
}

export async function getLatestScan() {
  const scans = await listScans();
  return scans[0] ?? null;
}

export async function listPurchases() {
  return readJsonFile<PurchaseRecord[]>(PURCHASES_FILE, []);
}

export async function savePurchase(record: Omit<PurchaseRecord, "id">) {
  const purchases = await listPurchases();
  const withId: PurchaseRecord = {
    ...record,
    id: randomUUID()
  };
  purchases.unshift(withId);
  await writeJsonFile(PURCHASES_FILE, purchases.slice(0, 500));
  return withId;
}
