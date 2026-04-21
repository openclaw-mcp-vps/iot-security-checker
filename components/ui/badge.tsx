import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium uppercase tracking-wide",
  {
    variants: {
      variant: {
        default: "border-slate-600 bg-slate-700/40 text-slate-100",
        critical: "border-red-500/50 bg-red-500/10 text-red-300",
        high: "border-orange-500/50 bg-orange-500/10 text-orange-300",
        medium: "border-amber-500/50 bg-amber-500/10 text-amber-300",
        low: "border-sky-500/50 bg-sky-500/10 text-sky-300"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
