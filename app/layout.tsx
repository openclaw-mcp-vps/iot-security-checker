import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const headingFont = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"]
});

const monoFont = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"]
});

export const metadata: Metadata = {
  title: {
    default: "IoT Security Checker | Scan Home IoT Devices for Vulnerabilities",
    template: "%s | IoT Security Checker"
  },
  description:
    "Scan your home IoT devices for known vulnerabilities, prioritize risk, and get clear remediation actions before attackers exploit weak smart home defaults.",
  metadataBase: new URL("https://iot-security-checker.com"),
  openGraph: {
    title: "IoT Security Checker",
    description:
      "Home network IoT security monitoring for smart cameras, thermostats, routers, and everything in between.",
    type: "website",
    url: "https://iot-security-checker.com",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "IoT Security Checker dashboard preview"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "IoT Security Checker",
    description:
      "Identify weak IoT devices on your network and receive practical, ongoing threat alerts.",
    images: ["/og-image.svg"]
  },
  robots: {
    index: true,
    follow: true
  },
  keywords: [
    "iot security",
    "home network scanner",
    "smart home vulnerabilities",
    "device fingerprinting",
    "security recommendations"
  ]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${headingFont.variable} ${monoFont.variable} bg-[#0d1117] text-slate-100 antialiased`}
        style={{ fontFamily: "var(--font-heading), sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
