import Link from "next/link";
import { cookies } from "next/headers";
import { DeviceCard } from "@/components/DeviceCard";
import { AccessActivationForm } from "@/components/AccessActivationForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLatestScan } from "@/lib/data-store";
import { ACCESS_COOKIE_NAME, verifyAccessToken } from "@/lib/lemonsqueezy";

export const dynamic = "force-dynamic";

export default async function DevicesPage() {
  const cookieStore = await cookies();
  const accessEmail = verifyAccessToken(cookieStore.get(ACCESS_COOKIE_NAME)?.value);
  const stripeLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;

  if (!accessEmail) {
    return (
      <main className="section-shell py-10">
        <Card className="border-emerald-500/30 bg-emerald-500/10">
          <CardHeader>
            <CardTitle>Device inventory is part of the Pro plan</CardTitle>
            <CardDescription>Buy access, then activate this browser with your checkout email.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <a href={stripeLink} target="_blank" rel="noreferrer">
              <Button className="w-full">Subscribe for $15/mo</Button>
            </a>
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
          <h1 className="text-3xl font-semibold">Device Inventory</h1>
          <p className="text-sm text-slate-400">All discovered devices with vulnerability and exposure context.</p>
        </div>
        <Link href="/scan">
          <Button>Run New Scan</Button>
        </Link>
      </div>

      {!latestScan || latestScan.assessments.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No devices found yet</CardTitle>
            <CardDescription>Complete a scan to populate your inventory and threat recommendations.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/scan">
              <Button>Start a Scan</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {latestScan.assessments.map((assessment) => (
            <DeviceCard key={assessment.device.id} assessment={assessment} />
          ))}
        </div>
      )}
    </main>
  );
}
