import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

export function severityToColor(severity: string) {
  switch (severity.toLowerCase()) {
    case "critical":
      return "text-red-300 border-red-500/40 bg-red-500/10";
    case "high":
      return "text-orange-300 border-orange-500/40 bg-orange-500/10";
    case "medium":
      return "text-amber-300 border-amber-500/40 bg-amber-500/10";
    default:
      return "text-sky-300 border-sky-500/40 bg-sky-500/10";
  }
}

export function normalizeText(value: string | undefined | null) {
  return (value ?? "").trim().toLowerCase();
}
