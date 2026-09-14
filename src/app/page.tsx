"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Gift, PackageSearch, PenLine, Sparkles } from "lucide-react";
import { useStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RarityBadge } from "@/components/rarity-badge";
import { TierCard } from "@/components/tier-card";
import { RARITY_ORDER } from "@/lib/types";

const STEPS = [
  { icon: PackageSearch, title: "1 · Choose", body: "Pick Regular, Medium or Premium. Nothing else — no character, no story, no card." },
  { icon: Gift, title: "2 · We seal it", body: "The Mystery Engine rolls rarity + inventory and seals a unique combination." },
  { icon: BookOpen, title: "3 · Unbox", body: "Open the physical box. Meet your character, story, cards & surprises." },
  { icon: PenLine, title: "4 · Wish", body: "Write your wish on the YOUR WISH card and send it to us. Good ones are accepted." },
];

export default function HomePage() {
  const { db } = useStore();
  const tiers = Object.values(db.tiers);

  return (
    <div className="pb-10">
      {/* hero */}
      <section className="mx-auto max-w-3xl py-16 text-center sm:py-20">
        <Badge variant="gold" className="mb-5">
          <Sparkles size={11} /> Global mystery-box & collectible experience
        </Badge>
        <h1 className="font-serif text-5xl leading-[1.05] tracking-tight sm:text-6xl">
          You Choose the Box.
          <br />
          <span className="gold-text">We Create the Mystery.</span>
          <br />
          You Discover the Story.
        </h1>
        <p className="mx-auto mt-5 max-w-xl leading-relaxed text-muted-foreground">
          One tier. Zero spoilers. Inside: a sealed <strong className="text-foreground">Mystery Book</strong>,
          character cards, art, collectibles — and a blank{" "}
          <strong className="text-foreground">YOUR WISH</strong> card you fill in{" "}
          <em>after</em> unboxing, then send to us. Good wishes are accepted.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/boxes">
              Choose your box <ArrowRight size={16} />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/unbox">
              <Gift size={16} /> Free unbox demo
            </Link>
          </Button>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-1.5">
          {RARITY_ORDER.map((r) => (
            <RarityBadge key={r} rarity={r} />
          ))}
        </div>
      </section>

      {/* tiers */}
      <section className="grid gap-4 md:grid-cols-3">
        {tiers.map((t) => (
          <TierCard key={t.id} tier={t} />
        ))}
      </section>

      {/* how strip */}
      <Card className="mt-6">
        <CardContent className="p-6 sm:p-8">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            How it works
          </div>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.title} className="flex flex-col gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                  <s.icon size={17} />
                </span>
                <div className="font-semibold">{s.title}</div>
                <p className="text-[13px] leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="mt-6" asChild>
            <Link href="/how">
              Full journey <ArrowRight size={14} />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* universe + live */}
      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6 sm:p-8">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              The universe
            </div>
            <h3 className="mt-2 font-serif text-2xl">
              {db.characters.length} souls · {db.stories.length} stories · 6 continents
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Hindu · Sikh · Buddhist · Jain · Christian · Islamic · Chinese · Greek ·
              Roman · Norse · Egyptian · Japanese · Akan · Aztec. Every figure labeled
              deity / sacred / mythological / cultural / historical — rarity describes the{" "}
              <em>print</em>, never the faith.
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {db.characters.slice(0, 8).map((c) => (
                <Badge key={c.id} variant={c.rarity} title={c.tradition}>
                  {c.emoji} {c.name}
                </Badge>
              ))}
              <span className="text-[13px] text-muted-foreground">
                + {db.characters.length - 8} more…
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 sm:p-8">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              Live drops · just now
            </div>
            <div className="mt-4 flex max-h-56 flex-col gap-2 overflow-auto">
              {db.live
                .slice(-5)
                .reverse()
                .map((l, i) => (
                  <div key={i} className="rounded-xl border px-3.5 py-2.5 text-[13px]">
                    ✨ <strong>{l.who}</strong> pulled <strong>{l.what}</strong>{" "}
                    <RarityBadge rarity={l.rarity} />
                  </div>
                ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" asChild>
                <Link href="/unbox">Try your luck free</Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href="/boxes">Skip to boxes</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
