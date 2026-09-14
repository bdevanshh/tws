"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Dices, FastForward, RotateCcw } from "lucide-react";
import { generateBox } from "@/lib/engine";
import { charOf, engineInput, useStore } from "@/lib/store";
import type { SealedBox, TierId } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RarityBadge } from "@/components/rarity-badge";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/hooks/motion";
import { MysteryBox3D, type BoxPrize, type RitualStage } from "@/components/mystery-box-3d";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { money } from "@/components/tier-card";

const NAMES = ["Lena · Germany", "Kabir · India", "Mina · Japan", "Omar · UAE", "Zoe · USA", "Lucas · Brazil", "Aisha · UK"];

/** One medieval chest, always sealed with two iron padlocks. */
const LOCK_COUNT = 2;

const buzz = (pattern: number | number[]) => {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* haptics unsupported — the animation carries it */
  }
};

export default function UnboxPage() {
  const { db, patch } = useStore();
  const [tier, setTier] = useState<TierId>("medium");
  const [stage, setStage] = useState<RitualStage>("locked");
  const [locks, setLocks] = useState<boolean[]>(() => Array(LOCK_COUNT).fill(false));
  const [prize, setPrize] = useState<BoxPrize | null>(null);
  const [result, setResult] = useState<SealedBox | null>(null);
  const [suspense, setSuspense] = useState<string | null>(null);
  const boxRef = useRef<SealedBox | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const later = (ms: number, fn: () => void) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(fn, ms);
  };

  const fullReset = (nextTier: TierId) => {
    if (timer.current) clearTimeout(timer.current);
    setTier(nextTier);
    setStage("locked");
    setLocks(Array(LOCK_COUNT).fill(false));
    setPrize(null);
    setResult(null);
    setSuspense(null);
    boxRef.current = null;
  };

  /* Act 1 — pick a padlock. Fate is sealed the moment the chest is first touched. */
  const breakLock = (index: number) => {
    if (stage !== "locked" || locks[index]) return;
    if (!boxRef.current) {
      const box = generateBox(tier, engineInput(db));
      boxRef.current = box;
      const ch = charOf(db, box.character.id);
      setPrize({
        emoji: ch?.emoji ?? "🌟",
        name: box.topHit?.name ?? box.character.name,
        rarity: box.topHit?.rarity ?? "common",
      });
    }
    buzz(25);
    const next = locks.map((b, i) => (i === index ? true : b));
    setLocks(next);
    if (next.every(Boolean)) {
      buzz([15, 40, 15]);
      setStage("ready");
    }
  };

  /* Act 2 complete — lid fully lifted (via swipe or the fallback button). */
  const beginAnticipation = () => {
    if (stage !== "ready") return;
    buzz([30, 50, 30]);
    setStage("lifting");
    later(950, () => {
      setStage("reveal1");
      setSuspense("Both locks lie broken…");
      later(1600, () => {
        setStage("reveal2");
        const tradition = boxRef.current
          ? charOf(db, boxRef.current.character.id)?.tradition ?? ""
          : "";
        setSuspense(tradition ? `The ${tradition} spirits lean closer…` : "Something stirs in the dark…");
        later(1800, revealAll);
      });
    });
  };

  const revealAll = () => {
    const box = boxRef.current;
    if (!box) return;
    setStage("revealed");
    setSuspense(null);
    setResult(box);
    patch((db) => {
      db.live.push({
        who: NAMES[Math.floor(Math.random() * NAMES.length)],
        what: box.topHit?.name ?? box.character.name,
        rarity: box.topHit?.rarity ?? "common",
      });
      return db;
    });
  };

  const char = result ? charOf(db, result.character.id) : null;
  const broken = locks.filter(Boolean).length;

  const statusLine =
    stage === "locked"
      ? `Pick the ${locks.length} iron padlocks — ${broken} of ${locks.length} open. Drag to rotate, tap each lock.`
      : stage === "ready"
        ? "Both locks are off. Swipe up on the chest — or lift the lid."
        : stage === "lifting"
          ? "The lid is creaking open…"
          : stage === "revealed"
            ? "Revealed! This is what a real sealed chest feels like."
            : "Hold still… let it come to you.";

  return (
    <div className="pb-10">
      <PageHero
        kicker="The ritual"
        title="Unbox Demo"
        sub="Free, unlimited, no account. Pick the locks, lift the lid, hold your nerve."
      />

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Reveal className="h-full">
          <Card className="h-full overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <MysteryBox3D
              stage={stage}
              locks={locks}
              onBreakLock={breakLock}
              prize={prize}
              tierName={db.tiers[tier].name}
              suspense={stage === "revealed" ? null : suspense}
              onOpened={beginAnticipation}
            />
            <div className="flex flex-wrap items-center gap-3 border-t pt-4">
              <span className="text-sm text-muted-foreground">Demo tier:</span>
              <Select value={tier} onValueChange={(v) => fullReset(v as TierId)}>
                <SelectTrigger className="w-52">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(db.tiers).map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} — {money(t.price)} · 2 iron locks
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex-1" />
              {stage === "ready" && (
                <Button onClick={beginAnticipation}>
                  <Dices size={16} /> Lift the lid
                </Button>
              )}
              {(stage === "lifting" || stage === "reveal1" || stage === "reveal2") && (
                <Button variant="outline" onClick={revealAll}>
                  <FastForward size={15} /> Reveal now
                </Button>
              )}
              {stage === "revealed" && (
                <Button variant="outline" onClick={() => fullReset(tier)}>
                  <RotateCcw size={15} /> Begin a new ritual
                </Button>
              )}
            </div>
            <p className="mt-2 text-[13px] text-muted-foreground">{statusLine}</p>
          </CardContent>
        </Card>
        </Reveal>

        <div className="flex flex-col gap-4">
          <Reveal delay={110} className="flex-1">
            <Card className="h-full min-h-44">
            <CardContent className="p-6">
              {result && char ? (
                <>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                    Your fate · {db.tiers[tier].name} demo
                  </div>
                  <h2 className="mt-1.5 font-serif text-2xl">
                    {char.emoji} {char.name}{" "}
                    <span className="font-sans text-sm font-normal text-muted-foreground">
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
                    Break the locks, lift the lid, and hold your nerve — your character,
                    story and top hit emerge slowly, like the physical chest.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          </Reveal>
          <Reveal delay={180}>
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
          </Reveal>
        </div>
      </div>
    </div>
  );
}
