import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default: "border-border bg-secondary text-secondary-foreground",
        outline: "border-border text-muted-foreground",
        common:
          "border-rarity-common/50 text-rarity-common bg-rarity-common/10",
        rare: "border-rarity-rare/50 text-rarity-rare bg-rarity-rare/10",
        epic: "border-rarity-epic/50 text-rarity-epic bg-rarity-epic/10",
        legendary:
          "border-rarity-legendary/60 text-rarity-legendary bg-rarity-legendary/10 shadow-[0_0_16px_-4px_var(--color-rarity-legendary)]",
        ultrarare:
          "border-rarity-ultrarare/60 text-rarity-ultrarare bg-rarity-ultrarare/10 shadow-[0_0_18px_-4px_var(--color-rarity-ultrarare)]",
        gold: "border-primary/50 text-primary bg-primary/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
