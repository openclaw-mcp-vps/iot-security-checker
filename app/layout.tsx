import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "@/app/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: {
    default: "IoT Security Checker | Scan your home IoT devices for vulnerabilities",
    template: "%s | IoT Security Checker"
  },
  description:
    "Identify vulnerable smart home devices, map exposure risk, and get prioritized remediation steps with continuous threat monitoring.",
  keywords: [
    "IoT security",
    "home network scanner",
    "smart home vulnerability scan",
    "device security monitoring",
    "router camera security"
  ],
  openGraph: {
    title: "IoT Security Checker",
    description:
      "Scan your home IoT devices for known vulnerabilities and get actionable recommendations.",
    url: "https://iotsecuritychecker.com",
    siteName: "IoT Security Checker",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "IoT Security Checker",
    description: "Scan smart devices, detect exposed services, and prioritize high-risk fixes."
  },
  metadataBase: new URL("https://iotsecuritychecker.com")
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
