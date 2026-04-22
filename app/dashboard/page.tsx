import { AppShell } from "@/components/AppShell";
import { DashboardView } from "@/components/DashboardView";
import { requireAccess } from "@/lib/access";

export default async function DashboardPage() {
  await requireAccess();

  return (
    <AppShell
      title="Security dashboard"
      subtitle="Track exposure trends across your smart home and prioritize high-impact remediation first."
    >
      <DashboardView />
    </AppShell>
  );
}
