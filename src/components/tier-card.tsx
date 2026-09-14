import Link from "next/link";
import { ArrowRight, Sparkles, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RARITY_LABEL, RARITY_ORDER, type Tier } from "@/lib/types";
import { cn } from "@/lib/utils";
import { GOLD_BADGE_CLASS, RARITY_BADGE_CLASS } from "./rarity-badge";

export function money(n: number) {
  return "$" + Number(n).toFixed(2);
}

export function TierCard({ tier, detail, className }: { tier: Tier; detail?: boolean; className?: string }) {
  return (
    <Card
      className={cn(
        "relative flex flex-col transition-transform duration-200 hover:-translate-y-1",
        tier.popular && "border-primary/60 shadow-[0_0_40px_-12px_var(--color-primary)]",
        className
      )}
    >
      {tier.popular && (
        <Badge variant="outline" className={cn(GOLD_BADGE_CLASS, "absolute right-4 top-4")}>
          <Star size={11} /> Most popular
        </Badge>
      )}
      <CardContent className="flex flex-1 flex-col gap-3 p-6">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
          {tier.tag}
        </div>
        <h3 className="font-serif text-2xl">{tier.name} Box</h3>
        <div className="text-4xl font-extrabold tracking-tight" style={{ color: tier.color }}>
          {money(tier.price)}
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{tier.desc}</p>
        {detail && (
          <>
            <div className="flex flex-wrap gap-1.5">
              {RARITY_ORDER.map((k) => (
                <Badge key={k} variant="outline" className={RARITY_BADGE_CLASS[k]}>
                  {RARITY_LABEL[k]} {tier.odds[k]}%
                </Badge>
              ))}
            </div>
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              Same tier, different fate — two {tier.name} buyers never receive the same
              combination. Contents stay sealed until delivery.
            </p>
          </>
        )}
        <div className="mt-auto flex gap-2 pt-2">
          <Button asChild className="flex-1">
            <Link href={`/checkout/${tier.id}`}>
              Choose {tier.name} <ArrowRight size={15} />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/unbox" aria-label="Try the free unbox demo">
              <Sparkles size={15} />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
