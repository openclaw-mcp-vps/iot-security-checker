"use client";

import type { ScanResult } from "@/lib/types";

const STORAGE_KEY = "iot-security-checker/latest-scan";

export function saveLatestScan(result: ScanResult) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
}

export function loadLatestScan(): ScanResult | null {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as ScanResult;
  } catch {
    return null;
  }
}

export function clearLatestScan() {
  localStorage.removeItem(STORAGE_KEY);
}
