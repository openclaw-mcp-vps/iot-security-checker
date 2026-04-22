import Link from "next/link";
import { CheckCircle2, ChevronRight, Lock, Radar, ShieldAlert, WalletCards } from "lucide-react";

import { UnlockAccessForm } from "@/components/UnlockAccessForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface LandingPageProps {
  searchParams: Promise<{ paywall?: string }>;
}

const faqs = [
  {
    q: "How does the scan work without exposing my network data?",
    a: "Scan output is analyzed only for device fingerprints, open services, and vulnerability matches. Raw scan text never leaves your control unless you submit it in the app, and you can clear stored results any time."
  },
  {
    q: "Do I need enterprise security tools to use this?",
    a: "No. The scanner uses familiar Nmap commands and translates the output into clear priorities: what to patch, what to isolate, and what to disable first."
  },
  {
    q: "What happens after I buy?",
    a: "Complete Stripe checkout, then verify your purchase email in the app to unlock your protected dashboard. Access is stored with a secure cookie for ongoing monitoring."
  },
  {
    q: "Can this monitor new threats over time?",
    a: "Yes. The dashboard cross-checks your detected device profile against a curated vulnerability catalog and optional live KEV feed so you can react when new exploits appear."
  }
];

export default async function LandingPage({ searchParams }: LandingPageProps) {
  const params = await searchParams;

  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-800/90 bg-[#0d1117]/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-100">
            <ShieldAlert className="h-4 w-4 text-cyan-300" />
            IoT Security Checker
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link href="#pricing" className="text-zinc-300 hover:text-cyan-300">
              Pricing
            </Link>
            <Button asChild variant="secondary" size="sm">
              <Link href="/dashboard">Open app</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-20">
          <div className="space-y-7">
            <Badge variant="outline" className="border-cyan-500/20 bg-cyan-500/10 text-cyan-200">
              Scan your home IoT devices for vulnerabilities
            </Badge>
            <h1 className="text-4xl font-semibold tracking-tight text-zinc-100 sm:text-5xl">
              Stop smart home devices from becoming your network&apos;s weakest link
            </h1>
            <p className="max-w-2xl text-lg text-zinc-300">
              IoT Security Checker identifies cameras, routers, thermostats, and hubs on your network, maps exposed ports, and matches them against known CVEs with clear, prioritized fixes.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <a href={process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK} target="_blank" rel="noreferrer">
                  Buy Secure Plan - $15/mo
                  <ChevronRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/scan">Try scanner interface</Link>
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-zinc-800 bg-[#0f1723] p-4">
                <p className="text-2xl font-semibold text-zinc-100">20+</p>
                <p className="text-sm text-zinc-400">Typical connected devices in modern homes</p>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-[#0f1723] p-4">
                <p className="text-2xl font-semibold text-zinc-100">Critical CVEs</p>
                <p className="text-sm text-zinc-400">Detected across routers and cameras every quarter</p>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-[#0f1723] p-4">
                <p className="text-2xl font-semibold text-zinc-100">Under 5 min</p>
                <p className="text-sm text-zinc-400">From scan upload to prioritized remediation plan</p>
              </div>
            </div>
          </div>

          <Card className="border-cyan-500/30 bg-[#111c2a]">
            <CardHeader>
              <CardTitle className="text-zinc-100">Unlock paid dashboard</CardTitle>
              <CardDescription className="text-zinc-300">
                After checkout, verify the purchase email to activate your protected monitoring workspace.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <UnlockAccessForm />
              {params.paywall ? (
                <p className="rounded-md border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-200">
                  Your scanner and device inventory are protected behind the paid plan. Complete checkout and unlock access.
                </p>
              ) : null}
              <div className="rounded-md border border-zinc-700 bg-[#0b121c] p-3 text-xs text-zinc-400">
                Need to wire payments? Set `NEXT_PUBLIC_STRIPE_PAYMENT_LINK` and `STRIPE_WEBHOOK_SECRET` in your environment.
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="border-y border-zinc-800 bg-[#0f1723]/60">
          <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
            <Card>
              <CardHeader>
                <CardTitle className="inline-flex items-center gap-2 text-zinc-100">
                  <Radar className="h-4 w-4 text-cyan-300" />
                  Discover devices
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-zinc-300">
                Run one scan command and uncover hidden IoT endpoints, unknown open ports, and mislabeled devices.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="inline-flex items-center gap-2 text-zinc-100">
                  <Lock className="h-4 w-4 text-cyan-300" />
                  Prioritize risk
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-zinc-300">
                Cross-reference fingerprints with known exploited vulnerabilities and focus on the highest-impact fixes first.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="inline-flex items-center gap-2 text-zinc-100">
                  <WalletCards className="h-4 w-4 text-cyan-300" />
                  Stay protected
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-zinc-300">
                Monitor for new threats targeting your exact device profile and receive actionable updates for ongoing hardening.
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="pricing" className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold text-zinc-100">Built for serious home network defense</h2>
              <p className="text-zinc-300">
                Ideal for tech-savvy homeowners and remote workers with smart home setups who need enterprise-grade visibility without enterprise complexity.
              </p>
              <ul className="space-y-3 text-sm text-zinc-300">
                {["Full IoT inventory with risk scoring", "Known CVE and exploited-threat matching", "Weekly monitoring workflow and mitigation guidance", "Cookie-gated paid dashboard for private findings"].map((item) => (
                  <li key={item} className="inline-flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-cyan-300" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <Card className="border-cyan-500/30 bg-[#111c2a]">
              <CardHeader>
                <CardTitle className="text-2xl text-zinc-100">Security Plan</CardTitle>
                <CardDescription className="text-zinc-300">
                  Continuous IoT vulnerability monitoring for <span className="font-semibold text-zinc-100">$15/month</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full" size="lg">
                  <a href={process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK} target="_blank" rel="noreferrer">
                    Start with Stripe Checkout
                  </a>
                </Button>
                <p className="text-xs text-zinc-400">
                  Payment is handled on Stripe-hosted checkout. After purchase, use your checkout email to unlock access.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-zinc-100">Frequently asked questions</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {faqs.map((item) => (
              <Card key={item.q}>
                <CardHeader>
                  <CardTitle className="text-base text-zinc-100">{item.q}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-zinc-300">{item.a}</CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
