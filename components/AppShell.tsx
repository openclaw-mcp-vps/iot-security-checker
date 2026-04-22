import Link from "next/link";

import { Shield } from "lucide-react";

export function AppShell({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-zinc-800/90 bg-[#0d1117]/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-100">
            <Shield className="h-4 w-4 text-cyan-300" />
            IoT Security Checker
          </Link>
          <nav className="flex items-center gap-4 text-sm text-zinc-300">
            <Link href="/dashboard" className="hover:text-cyan-300">
              Dashboard
            </Link>
            <Link href="/scan" className="hover:text-cyan-300">
              Scan
            </Link>
            <Link href="/devices" className="hover:text-cyan-300">
              Devices
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="space-y-2">
          <h1 className="text-3xl font-semibold text-zinc-100">{title}</h1>
          <p className="max-w-3xl text-sm text-zinc-400">{subtitle}</p>
        </section>
        {children}
      </main>
    </div>
  );
}
