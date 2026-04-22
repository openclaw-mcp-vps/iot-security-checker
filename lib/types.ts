export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface DetectedDevice {
  id: string;
  ip: string;
  mac?: string;
  hostname?: string;
  vendor?: string;
  model?: string;
  deviceType: string;
  openPorts: number[];
  services: string[];
  os?: string;
  confidence: number;
  riskScore: number;
  riskLevel: RiskLevel;
  lastSeen: string;
}

export type VulnerabilitySeverity = "low" | "medium" | "high" | "critical";

export interface VulnerabilityFinding {
  id: string;
  deviceId: string;
  deviceLabel: string;
  cve: string;
  title: string;
  description: string;
  severity: VulnerabilitySeverity;
  cvss: number;
  exploitedInTheWild: boolean;
  recommendation: string;
  source: string;
  publishedAt: string;
}

export interface ScanResult {
  devices: DetectedDevice[];
  vulnerabilities: VulnerabilityFinding[];
  recommendations: string[];
  generatedAt: string;
  riskSummary: {
    deviceCount: number;
    vulnerableDeviceCount: number;
    criticalCount: number;
    highCount: number;
    averageRiskScore: number;
  };
}
