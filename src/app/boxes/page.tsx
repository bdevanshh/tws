"use client";

import { ShieldCheck } from "lucide-react";
import { useStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { TierCard } from "@/components/tier-card";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/hooks/motion";

export default function BoxesPage() {
  const { db } = useStore();
  return (
    <div className="pb-10">
      <PageHero
        kicker="The vault"
        title="Mystery Boxes"
        sub={<>You select <strong className="text-foreground">only the tier</strong>. Characters, stories, cards, products and collectibles are sealed by the Mystery Engine.</>}
      />
      <div className="grid gap-4 md:grid-cols-3">
        {Object.values(db.tiers).map((t, i) => (
          <Reveal key={t.id} delay={i * 90} className="h-full">
            <TierCard tier={t} detail className="h-full" />
          </Reveal>
        ))}
      </div>
      <Reveal delay={120}>
      <Card className="mt-6">
        <CardContent className="flex gap-3 p-6 text-sm leading-relaxed text-muted-foreground">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-primary" />
          <span>
            <strong className="text-foreground">Fairness note.</strong> Odds shown per box.
            Premium raises Legendary / Ultra chances and guarantees more collectibles — but any
            tier can spike. Same-tier boxes differ by design. Inventory is live: when a limited
            item sells out, the engine re-weights automatically.
          </span>
        </CardContent>
      </Card>
      </Reveal>
    </div>
  );
}
