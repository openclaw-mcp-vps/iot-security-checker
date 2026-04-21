import Link from "next/link";
import { cookies } from "next/headers";
import { Download, Lock, Terminal } from "lucide-react";
import { NetworkScanner } from "@/components/NetworkScanner";
import { AccessActivationForm } from "@/components/AccessActivationForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ACCESS_COOKIE_NAME, verifyAccessToken } from "@/lib/lemonsqueezy";

export const dynamic = "force-dynamic";

export default async function ScanPage() {
  const cookieStore = await cookies();
  const accessEmail = verifyAccessToken(cookieStore.get(ACCESS_COOKIE_NAME)?.value);
  const stripeLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;

  if (!accessEmail) {
    return (
      <main className="section-shell py-10">
        <Card className="border-emerald-500/30 bg-emerald-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Lock className="h-5 w-5 text-emerald-300" />
              Unlock Scanner Access
            </CardTitle>
            <CardDescription>
              Scanning analysis is available to subscribers. Complete checkout and activate with your purchase email.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <div>
              <a href={stripeLink} target="_blank" rel="noreferrer">
                <Button className="w-full">Buy Access</Button>
              </a>
              <p className="mt-3 text-xs text-slate-300">Webhook endpoint: `/api/webhooks/lemonsqueezy`</p>
            </div>
            <AccessActivationForm />
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="section-shell py-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Run Security Scan</h1>
          <p className="text-sm text-slate-400">Detect devices, fingerprint firmware exposure, and prioritize vulnerabilities.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a href="/api/scan?download=script">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download Scanner Script
            </Button>
          </a>
          <Link href="/devices">
            <Button variant="secondary">View Device Inventory</Button>
          </Link>
        </div>
      </header>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Terminal className="h-5 w-5 text-sky-300" />
            Local Script Workflow
          </CardTitle>
          <CardDescription>Run this command on a machine connected to your home network:</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-xl border border-slate-700/60 bg-slate-950/80 p-4 font-mono text-xs text-slate-200">
{`python3 scripts/network-scanner.py --subnet 192.168.1.0/24 --output scan-results.json`}
          </pre>
          <p className="mt-3 text-sm text-slate-300">
            Paste the resulting JSON below to run vulnerability matching and risk scoring.
          </p>
        </CardContent>
      </Card>

      <NetworkScanner />
    </main>
  );
}
