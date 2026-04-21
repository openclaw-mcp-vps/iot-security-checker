import Link from "next/link";
import { ArrowRight, CheckCircle2, Shield, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const faqs = [
  {
    question: "How does scanning work if your server cannot see my home network?",
    answer:
      "You run a local scanner script on your own machine. It discovers devices and open services, then you upload the JSON report for vulnerability analysis and monitoring."
  },
  {
    question: "Will this break my devices or router?",
    answer:
      "No. The scanner performs lightweight host discovery and port checks designed for home environments. It does not exploit vulnerabilities."
  },
  {
    question: "What happens after I pay?",
    answer:
      "Use the same email from checkout in your dashboard activation form. Once webhook confirmation is received, access is unlocked via secure cookie token."
  },
  {
    question: "Do I get alerts for new threats?",
    answer:
      "Yes. The app tracks your device fingerprints and flags newly mapped vulnerabilities, with optional SMTP email alerts for critical findings."
  }
];

export default function HomePage() {
  const stripeLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;

  return (
    <main className="pb-24">
      <section className="section-shell grid-glow relative overflow-hidden rounded-b-[2.5rem] border-x border-b border-slate-700/40 pt-8 md:pt-14">
        <nav className="mb-14 flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold">IoT Security Checker</p>
            <p className="text-xs text-slate-400">Home network attack surface intelligence</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="text-sm text-slate-300 hover:text-white">
              Dashboard
            </Link>
            <Link href="/scan" className="text-sm text-slate-300 hover:text-white">
              Scan
            </Link>
          </div>
        </nav>

        <div className="fade-up mx-auto max-w-4xl pb-20 text-center">
          <p className="mb-4 inline-flex rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-300">
            Scan your home IoT devices for vulnerabilities
          </p>
          <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl">
            Stop weak smart devices from becoming your network&apos;s entry point.
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-base text-slate-300 md:text-lg">
            Identify every camera, thermostat, smart speaker, and router on your home network. Match each one against active CVEs,
            prioritize by exploit risk, and follow practical remediation steps before attackers target your model.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href={stripeLink} target="_blank" rel="noreferrer">
              <Button size="lg">
                Start Monitoring - $15/mo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
            <Link href="/dashboard">
              <Button variant="outline" size="lg">
                View Product Tour
              </Button>
            </Link>
          </div>
          <p className="mt-3 text-xs text-slate-400">Hosted Stripe checkout. No card data touches your app.</p>
        </div>
      </section>

      <section className="section-shell mt-14 grid gap-5 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Wifi className="h-5 w-5 text-sky-300" />
              Device Discovery
            </CardTitle>
            <CardDescription>Find all IoT nodes, not just what appears in your router UI.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-slate-300">
            Use downloadable local scan scripts or manual import mode to map active hosts, exposed ports, and weak service footprints.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Shield className="h-5 w-5 text-emerald-300" />
              Vulnerability Intelligence
            </CardTitle>
            <CardDescription>Map discovered fingerprints to known CVEs and active advisories.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-slate-300">
            Prioritize critical threats first using CVSS-aware risk scoring and explicit mitigation guidance per affected device.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CheckCircle2 className="h-5 w-5 text-amber-300" />
              Ongoing Monitoring
            </CardTitle>
            <CardDescription>Watch for newly published threats targeting your specific models.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-slate-300">
            Save scans, compare exposure changes over time, and trigger email alerts when critical findings appear.
          </CardContent>
        </Card>
      </section>

      <section className="section-shell mt-16 grid gap-6 rounded-3xl border border-slate-700/50 bg-slate-900/40 p-6 md:grid-cols-2 md:p-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">The problem</p>
          <h2 className="mt-2 text-3xl font-semibold">Most home networks run 20+ connected devices with default-grade security.</h2>
          <p className="mt-4 text-slate-300">
            Attackers target outdated firmware in smart cameras, cheap plugs, and vulnerable routers because those devices are rarely
            patched and often reachable from compromised internal hosts.
          </p>
        </div>
        <div className="space-y-3 text-sm text-slate-200">
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            Breaches commonly start with one weak IoT endpoint, then pivot into laptops, NAS storage, and work accounts.
          </div>
          <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-4">
            Router dashboards typically hide risk context, so users miss active CVEs tied to device model and firmware age.
          </div>
          <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-4">
            IoT Security Checker converts raw network data into prioritized, actionable remediation in under 5 minutes.
          </div>
        </div>
      </section>

      <section className="section-shell mt-16">
        <h2 className="text-center text-3xl font-semibold">Simple pricing for serious home network security</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-slate-300">
          One plan for security-conscious households and remote workers who need enterprise-style visibility without enterprise tooling.
        </p>
        <Card className="mx-auto mt-8 max-w-2xl border-emerald-500/40 bg-emerald-500/10">
          <CardHeader>
            <CardTitle className="text-2xl">IoT Security Checker Pro</CardTitle>
            <CardDescription>Continuous vulnerability monitoring for your personal smart-home footprint.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-4xl font-bold">
              $15<span className="text-lg font-medium text-slate-300">/month</span>
            </p>
            <ul className="mb-6 space-y-2 text-sm text-slate-100">
              <li>Full network scan ingestion and fingerprinting</li>
              <li>CVSS-based prioritization with remediation steps</li>
              <li>Saved scan history and risk trend visibility</li>
              <li>Webhook-driven purchase access and secure cookie auth</li>
            </ul>
            <a href={stripeLink} target="_blank" rel="noreferrer">
              <Button size="lg" className="w-full">
                Buy Now via Stripe
              </Button>
            </a>
          </CardContent>
        </Card>
      </section>

      <section className="section-shell mt-16">
        <h2 className="mb-6 text-3xl font-semibold">FAQ</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {faqs.map((faq) => (
            <Card key={faq.question}>
              <CardHeader>
                <CardTitle className="text-base">{faq.question}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-300">{faq.answer}</CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
