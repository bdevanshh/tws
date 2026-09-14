"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Dices } from "lucide-react";
import { generateBox } from "@/lib/engine";
import { charOf, engineInput, useStore } from "@/lib/store";
import { RARITY_LABEL, type Rarity, type SealedBox, type TierId } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RarityBadge } from "@/components/rarity-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { money } from "@/components/tier-card";

interface StripDrop {
  name: string;
  rarity: Rarity;
  emoji: string;
}

const STRIP_LEN = 44;
const WIN_INDEX = 36;
const NAMES = ["Lena · Germany", "Kabir · India", "Mina · Japan", "Omar · UAE", "Zoe · USA", "Lucas · Brazil", "Aisha · UK"];

export default function UnboxPage() {
  const { db, patch } = useStore();
  const [tier, setTier] = useState<TierId>("medium");
  const buildPool = (): StripDrop[] => [
    ...db.cards.map((c) => ({
      name: c.name,
      rarity: c.rarity,
      emoji: charOf(db, c.charId ?? "")?.emoji ?? "🃏",
    })),
    ...db.products.map((p) => ({ name: p.name, rarity: p.rarity, emoji: "📦" })),
  ];

  // Deterministic initial strip (SSR-safe: identical on server + client).
  const [strip, setStrip] = useState<StripDrop[]>(() => {
    const pool = buildPool();
    return Array.from({ length: STRIP_LEN }, (_, i) => pool[i % pool.length]);
  });
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<SealedBox | null>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const randomDrop = (): StripDrop => {
    const pool = buildPool();
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const spin = () => {
    if (spinning) return;
    // Seal the outcome FIRST (provably-fair style), then animate to it.
    const box = generateBox(tier, engineInput(db));
    const ch = charOf(db, box.character.id);
    const win: StripDrop = {
      name: box.topHit?.name ?? box.character.name,
      rarity: box.topHit?.rarity ?? "common",
      emoji: ch?.emoji ?? "🌟",
    };
    const next = Array.from({ length: STRIP_LEN }, (_, i) => (i === WIN_INDEX ? win : randomDrop()));
    setStrip(next);
    setResult(null);
    setSpinning(true);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const shell = shellRef.current;
        const el = stripRef.current;
        if (!shell || !el) return;
        const target = el.children[WIN_INDEX] as HTMLElement;
        const x = target.offsetLeft + target.offsetWidth / 2 - shell.clientWidth / 2;
        el.style.transition = "none";
        el.style.transform = "translateX(0)";
        void el.offsetWidth;
        el.style.transition = "transform 4.4s cubic-bezier(.12,.8,.08,1)";
        el.style.transform = `translateX(${-x}px)`;
      });
    });

    timer.current = setTimeout(() => {
      setResult(box);
      setSpinning(false);
      patch((db) => {
        db.live.push({
          who: NAMES[Math.floor(Math.random() * NAMES.length)],
          what: box.topHit?.name ?? box.character.name,
          rarity: box.topHit?.rarity ?? "common",
        });
        return db;
      });
    }, 4600);
  };

  const char = result ? charOf(db, result.character.id) : null;

  return (
    <div className="py-10">
      <h1 className="font-serif text-4xl tracking-tight">
        Unbox Demo{" "}
        <span className="align-middle text-sm font-sans font-normal text-muted-foreground">
          — free, unlimited, no account
        </span>
      </h1>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted-foreground">Demo tier:</span>
        <Select value={tier} onValueChange={(v) => setTier(v as TierId)}>
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.values(db.tiers).map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name} — {money(t.price)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={spin} disabled={spinning}>
          <Dices size={16} /> {spinning ? "Rolling…" : "Spin — reveal my fate"}
        </Button>
      </div>

      <div ref={shellRef} className="relative mt-5 overflow-hidden rounded-2xl border bg-card/50 py-6">
        <div className="needle-glow pointer-events-none absolute inset-y-0 left-1/2 z-10 w-0.5 bg-primary" />
        <div ref={stripRef} className="flex w-max gap-3 px-4">
          {strip.map((d, i) => (
            <div
              key={i}
              className="w-[150px] shrink-0 rounded-xl border bg-card p-3.5 text-center"
              style={{ borderColor: `color-mix(in srgb, var(--color-rarity-${d.rarity}) 55%, transparent)` }}
            >
              <div className="text-3xl">{d.emoji}</div>
              <div className="mt-1.5 line-clamp-2 min-h-8 text-[12.5px] font-semibold leading-snug">
                {d.name}
              </div>
              <Badge variant={d.rarity} className="mt-1.5">
                {RARITY_LABEL[d.rarity]}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="min-h-44">
          <CardContent className="p-6">
            {result && char ? (
              <>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                  Your fate · {db.tiers[tier].name} demo
                </div>
                <h2 className="mt-1.5 font-serif text-2xl">
                  {char.emoji} {char.name}{" "}
                  <span className="text-sm font-sans font-normal text-muted-foreground">
                    · {char.tradition}
                  </span>
                </h2>
                <p className="mt-2 text-sm leading-relaxed">{char.desc}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Story: <strong className="text-foreground">{result.story.title}</strong> ·
                  Est. box value {money(result.estValue)}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {result.topHit && <RarityBadge rarity={result.topHit.rarity} />}
                  <span className="text-sm">
                    Top hit: <strong>{result.topHit?.name}</strong>
                  </span>
                </div>
                <Button size="sm" className="mt-4" asChild>
                  <Link href={`/checkout/${tier}`}>Get this tier for real →</Link>
                </Button>
              </>
            ) : (
              <>
                <strong>Your pull appears here.</strong>
                <p className="mt-1 text-sm text-muted-foreground">
                  Outcome is pre-sealed before the strip moves (like provably-fair drops),
                  then revealed under the needle.
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              Live drops
            </div>
            <div className="mt-3 flex max-h-56 flex-col gap-2 overflow-auto">
              {db.live
                .slice(-8)
                .reverse()
                .map((l, i) => (
                  <div key={i} className="rounded-xl border px-3.5 py-2.5 text-[13px]">
                    ✨ <strong>{l.who}</strong> pulled <strong>{l.what}</strong>{" "}
                    <RarityBadge rarity={l.rarity} />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
