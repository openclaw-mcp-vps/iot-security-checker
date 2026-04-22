import { AppShell } from "@/components/AppShell";
import { DevicesView } from "@/components/DevicesView";
import { requireAccess } from "@/lib/access";

export default async function DevicesPage() {
  await requireAccess();

  return (
    <AppShell
      title="Device inventory"
      subtitle="Audit every discovered IoT endpoint and validate that high-risk services are being reduced over time."
    >
      <DevicesView />
    </AppShell>
  );
}
