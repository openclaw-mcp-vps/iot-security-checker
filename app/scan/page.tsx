import { AppShell } from "@/components/AppShell";
import { NetworkScanner } from "@/components/NetworkScanner";
import { requireAccess } from "@/lib/access";

export default async function ScanPage() {
  await requireAccess();

  return (
    <AppShell
      title="Network scan"
      subtitle="Import your latest network scan and map each device to known vulnerability advisories."
    >
      <NetworkScanner />
    </AppShell>
  );
}
