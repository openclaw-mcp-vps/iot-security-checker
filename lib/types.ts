export type Severity = "low" | "medium" | "high" | "critical";

export interface FingerprintedDevice {
  id: string;
  ip: string;
  mac: string;
  hostname: string;
  vendor: string;
  model: string;
  category: string;
  osGuess: string;
  openPorts: number[];
  confidence: number;
  discoveredAt: string;
}

export interface Vulnerability {
  id: string;
  cve: string;
  title: string;
  severity: Severity;
  cvss: number;
  summary: string;
  remediation: string;
  references: string[];
  publishedAt: string;
}

export interface DeviceAssessment {
  device: FingerprintedDevice;
  vulnerabilities: Vulnerability[];
  riskScore: number;
}

export interface ScanReport {
  id: string;
  source: "script" | "browser" | "manual";
  subnet: string;
  scannedAt: string;
  totalDevices: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  assessments: DeviceAssessment[];
}

export interface PurchaseRecord {
  id: string;
  emailHash: string;
  emailHint: string;
  purchasedAt: string;
  stripeCheckoutId: string | null;
}
