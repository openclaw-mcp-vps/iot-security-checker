import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IoT Security Checker — Scan Your Home Network for Vulnerabilities",
  description: "Scan your home IoT devices for vulnerabilities. Get detailed security reports and remediation steps to protect your network."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0d1117] text-[#c9d1d9] font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
