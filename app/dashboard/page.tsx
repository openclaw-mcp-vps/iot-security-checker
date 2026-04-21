import Link from "next/link";
import { cookies } from "next/headers";
import { Activity, Database, Lock, ShieldAlert, Terminal } from "lucide-react";
import { AccessActivationForm } from "@/components/AccessActivationForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLatestScan } from "@/lib/data-store";
import { ACCESS_COOKIE_NAME, verifyAccessToken } from "@/lib/lemonsqueezy";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const accessEmail = verifyAccessToken(cookieStore.get(ACCESS_COOKIE_NAME)?.value);
  const stripeLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;

  if (!accessEmail) {
    return (
      <main className="section-shell py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Security Dashboard</h1>
          <Link href="/" className="text-sm text-slate-300 hover:text-white">
            Back to landing
          </Link>
        </div>

        <Card className="border-emerald-500/30 bg-emerald-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Lock className="h-5 w-5 text-emerald-300" />
              Pro Access Required
            </CardTitle>
            <CardDescription>
              Complete checkout, then activate this browser using the same email to unlock scans and vulnerability intelligence.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-4">
              <h2 className="mb-2 text-lg font-medium">How to unlock</h2>
              <ol className="space-y-2 text-sm text-slate-300">
                <li>1. Open Stripe checkout and complete the $15/mo subscription.</li>
                <li>2. Ensure webhook delivery is configured to `/api/webhooks/lemonsqueezy`.</li>
                <li>3. Enter the same checkout email in the activation form.</li>
                <li>4. Access is stored in a secure HTTP-only cookie for this browser.</li>
              </ol>
              <a href={stripeLink} target="_blank" rel="noreferrer">
                <Button className="mt-4 w-full">Buy Access via Stripe</Button>
              </a>
            </div>
            <AccessActivationForm />
          </CardContent>
        </Card>
      </main>
    );
  }

  const latestScan = await getLatestScan();

  return (
    <main className="section-shell py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Welcome back</h1>
          <p className="text-sm text-slate-400">Monitoring enabled for {accessEmail}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/scan">
            <Button>Run New Scan</Button>
          </Link>
          <Link href="/devices">
            <Button variant="outline">View Devices</Button>
          </Link>
        </div>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-4 w-4 text-emerald-300" />
              Threat Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-300">Continuous checks against known vulnerabilities and service exposure advisories.</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="h-4 w-4 text-sky-300" />
              Scan History
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-300">Stores up to 100 recent scans for trend comparison and remediation progress.</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Terminal className="h-4 w-4 text-amber-300" />
              Script + Browser Modes
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-300">Import local script output or manually add devices when auditing segmented networks.</CardContent>
        </Card>
      </div>

      {latestScan ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <ShieldAlert className="h-5 w-5 text-red-300" />
              Latest Risk Snapshot
            </CardTitle>
            <CardDescription>{formatDateTime(latestScan.scannedAt)}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-4">
            <div className="rounded-lg border border-slate-700/60 bg-slate-900/45 p-3">
              <p className="text-slate-400">Devices</p>
              <p className="text-2xl font-semibold">{latestScan.totalDevices}</p>
            </div>
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3">
              <p className="text-red-200">Critical</p>
              <p className="text-2xl font-semibold text-red-100">{latestScan.criticalCount}</p>
            </div>
            <div className="rounded-lg border border-orange-500/40 bg-orange-500/10 p-3">
              <p className="text-orange-200">High</p>
              <p className="text-2xl font-semibold text-orange-100">{latestScan.highCount}</p>
            </div>
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3">
              <p className="text-amber-200">Medium</p>
              <p className="text-2xl font-semibold text-amber-100">{latestScan.mediumCount}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No scans yet</CardTitle>
            <CardDescription>Run your first scan to build a baseline security inventory.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/scan">
              <Button>Start Initial Scan</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
