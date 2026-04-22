"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function UnlockAccessForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submitUnlock() {
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch("/api/access/unlock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const payload = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        throw new Error(payload.error || "Could not verify purchase");
      }

      setStatus(payload.message || "Access granted. Redirecting...");
      router.push("/dashboard");
      router.refresh();
    } catch (unlockError) {
      setStatus(unlockError instanceof Error ? unlockError.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <Input
        type="email"
        placeholder="email used at checkout"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <Button type="button" onClick={submitUnlock} disabled={!email || loading} className="w-full">
        {loading ? "Verifying purchase..." : "Unlock paid access"}
      </Button>
      {status ? <p className="text-sm text-zinc-300">{status}</p> : null}
    </div>
  );
}
