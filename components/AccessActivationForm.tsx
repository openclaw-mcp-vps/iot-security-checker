"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const activationSchema = z.object({
  email: z.string().email("Enter the same email used during Stripe checkout.")
});

type ActivationInput = z.infer<typeof activationSchema>;

export function AccessActivationForm() {
  const [message, setMessage] = useState<string>("");
  const [isError, setIsError] = useState(false);

  const form = useForm<ActivationInput>({
    resolver: zodResolver(activationSchema),
    defaultValues: {
      email: ""
    }
  });

  async function onSubmit(values: ActivationInput) {
    setMessage("");
    setIsError(false);

    const response = await fetch("/api/access/activate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(values)
    });

    const payload = (await response.json()) as { message: string };

    if (!response.ok) {
      setIsError(true);
      setMessage(payload.message);
      return;
    }

    setMessage(payload.message);
    form.reset();
    window.location.reload();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 rounded-xl border border-slate-700/60 bg-slate-900/40 p-4">
      <label className="block text-sm font-medium text-slate-200" htmlFor="activation-email">
        Unlock with your purchase email
      </label>
      <Input
        id="activation-email"
        type="email"
        placeholder="you@homeoffice.com"
        autoComplete="email"
        {...form.register("email")}
      />
      {form.formState.errors.email ? <p className="text-xs text-red-300">{form.formState.errors.email.message}</p> : null}
      {message ? (
        <p className={`text-xs ${isError ? "text-red-300" : "text-emerald-300"}`}>{message}</p>
      ) : (
        <p className="text-xs text-slate-400">
          After a successful Stripe payment, webhook confirmation enables account activation for this email.
        </p>
      )}
      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Checking purchase..." : "Activate Access"}
      </Button>
    </form>
  );
}
