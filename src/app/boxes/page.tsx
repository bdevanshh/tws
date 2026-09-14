"use client";

import { ShieldCheck } from "lucide-react";
import { useStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { TierCard } from "@/components/tier-card";

export default function BoxesPage() {
  const { db } = useStore();
  return (
    <div className="py-10">
      <h1 className="font-serif text-4xl tracking-tight">Mystery Boxes</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        You select <strong className="text-foreground">only the tier</strong>. Characters,
        stories, cards, products and collectibles are sealed by the Mystery Engine.
      </p>
      <div className="mt-7 grid gap-4 md:grid-cols-3">
        {Object.values(db.tiers).map((t) => (
          <TierCard key={t.id} tier={t} detail />
        ))}
      </div>
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
    </div>
  );
}
