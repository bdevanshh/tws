"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRight, Gift, Sparkles } from "lucide-react";
import { useStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GodsSection } from "@/components/gods-section";
import { RARITY_BADGE_CLASS, GOLD_BADGE_CLASS, RarityBadge } from "@/components/rarity-badge";
import { TierCard } from "@/components/tier-card";
import { RARITY_ORDER } from "@/lib/types";
import { Reveal } from "@/hooks/motion";

/** Deterministic ambient dust — identical on server and client. */
const DUST = Array.from({ length: 12 }, (_, i) => ({
  left: `${(i * 37 + 11) % 100}%`,
  bottom: `${(i * 23) % 40}%`,
  size: 3 + (i % 3),
  duration: `${7 + (i % 5)}s`,
  delay: `${(i * 0.9) % 7}s`,
}));

export default function HomePage() {
  const { db } = useStore();
  const tiers = Object.values(db.tiers);
  const traditions = [...new Set(db.characters.map((c) => c.tradition))].sort();

  return (
    <div className="pb-10">
      {/* hero */}
      <section className="relative mx-auto max-w-3xl overflow-visible py-16 text-center sm:py-20">
        {DUST.map((d, i) => (
          <span
            key={i}
            aria-hidden
            className="dust"
            style={
              {
                left: d.left,
                bottom: d.bottom,
                width: d.size,
                height: d.size,
                "--dd": d.duration,
                "--dl": d.delay,
              } as CSSProperties
            }
          />
        ))}
        <div className="rise" style={{ "--rd": "0ms" } as CSSProperties}>
          <Badge variant="outline" className={`mb-5 ${GOLD_BADGE_CLASS}`}>
            <Sparkles size={11} /> Global mystery-box & collectible experience
          </Badge>
        </div>
        <h1 className="font-serif text-5xl leading-[1.05] tracking-tight sm:text-6xl">
          <span className="rise block" style={{ "--rd": "80ms" } as CSSProperties}>
            You Choose the Box.
          </span>
          <span className="rise block" style={{ "--rd": "200ms" } as CSSProperties}>
            <span className="gold-text">We Create the Mystery.</span>
          </span>
          <span className="rise block" style={{ "--rd": "320ms" } as CSSProperties}>
            You Discover the Story.
          </span>
        </h1>
        <p
          className="rise mx-auto mt-5 max-w-xl leading-relaxed text-muted-foreground"
          style={{ "--rd": "430ms" } as CSSProperties}
        >
          One tier. Zero spoilers. Inside: a sealed <strong className="text-foreground">Mystery Book</strong>,
          character cards, art, collectibles — and a blank{" "}
          <strong className="text-foreground">YOUR WISH</strong> card you fill in{" "}
          <em>after</em> unboxing, then send to us. Good wishes are accepted.
        </p>
        <div
          className="rise mt-7 flex flex-wrap justify-center gap-3"
          style={{ "--rd": "530ms" } as CSSProperties}
        >
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
        <div
          className="rise mt-6 flex flex-wrap justify-center gap-1.5"
          style={{ "--rd": "630ms" } as CSSProperties}
        >
          {RARITY_ORDER.map((r) => (
            <RarityBadge key={r} rarity={r} />
          ))}
        </div>
      </section>

      {/* traditions marquee */}
      <div className="marquee rise border-y py-3.5" style={{ "--rd": "700ms" } as CSSProperties}>
        <div className="marqueeTrack text-[13px] uppercase tracking-[0.22em] text-muted-foreground">
          {[0, 1].map((half) => (
            <div key={half} className="flex shrink-0 items-center" aria-hidden={half === 1}>
              {traditions.map((t) => (
                <span key={t} className="mx-6 flex items-center gap-6 whitespace-nowrap">
                  <span className="text-primary">✦</span> {t}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* tiers */}
      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {tiers.map((t, i) => (
          <Reveal key={t.id} delay={i * 90} className="h-full">
            <TierCard tier={t} className="h-full" />
          </Reveal>
        ))}
      </section>

      {/* gods + legends */}
      <GodsSection />

      {/* universe + live */}
      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <Reveal className="h-full">
          <Card className="h-full">
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
                <Badge key={c.id} variant="outline" className={RARITY_BADGE_CLASS[c.rarity]} title={c.tradition}>
                  {c.emoji} {c.name}
                </Badge>
              ))}
              <span className="text-[13px] text-muted-foreground">
                + {db.characters.length - 8} more…
              </span>
            </div>
          </CardContent>
        </Card>
        </Reveal>
        <Reveal delay={120} className="h-full">
          <Card className="h-full">
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
        </Reveal>
      </section>
    </div>
  );
}
