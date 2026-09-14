"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { generateBox } from "@/lib/engine";
import { charOf, engineInput, useStore } from "@/lib/store";
import type { Rarity, SealedBox, TierId } from "@/lib/types";
import { money } from "@/components/tier-card";
import { cn } from "@/lib/utils";

type Stage = "locked" | "ready" | "lifting" | "reveal1" | "reveal2" | "revealed";

const NAMES = ["Lena · Germany", "Kabir · India", "Mina · Japan", "Omar · UAE", "Zoe · USA", "Lucas · Brazil", "Aisha · UK"];

const TIERS: { id: TierId; vessel: string; active: string }[] = [
  { id: "regular", vessel: "Regular Vessel", active: "Regular Vessel (Active)" },
  { id: "medium", vessel: "Medium Chest", active: "Medium Chest (Active)" },
  { id: "premium", vessel: "Premium Casket", active: "Premium Casket (Active)" },
];

const RARITY_BADGE: Record<Rarity, string> = {
  common: "bg-rarity-common/20 text-rarity-common",
  rare: "bg-rarity-rare/20 text-rarity-rare",
  epic: "bg-rarity-epic/20 text-rarity-epic",
  legendary: "bg-rarity-legendary/20 text-rarity-legendary",
  ultrarare: "bg-rarity-mythic/20 text-rarity-mythic",
};

const RARITY_WORD: Record<Rarity, string> = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
  ultrarare: "Ultra Rare",
};

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
  const [stage, setStage] = useState<Stage>("locked");
  const [locks, setLocks] = useState<boolean[]>([false, false]);
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
    setLocks([false, false]);
    setResult(null);
    setSuspense(null);
    boxRef.current = null;
  };

  /* Pick a padlock — fate seals the moment the chest is first touched. */
  const toggleLock = (index: number) => {
    if (stage === "revealed" || stage === "lifting" || stage === "reveal1" || stage === "reveal2")
      return;
    if (locks[index]) return;
    if (!boxRef.current) {
      boxRef.current = generateBox(tier, engineInput(db));
    }
    buzz(25);
    const next = locks.map((b, i) => (i === index ? true : b));
    setLocks(next);
    if (next.every(Boolean)) {
      buzz([15, 40, 15]);
      setStage("ready");
    }
  };

  const breakSealAndUnveil = () => {
    if (!locks.every(Boolean) || stage === "revealed") return;
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
        setSuspense(
          tradition ? `The ${tradition} spirits lean closer…` : "Something stirs in the dark…"
        );
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
    patch((d) => {
      d.live.push({
        who: NAMES[Math.floor(Math.random() * NAMES.length)],
        what: box.topHit?.name ?? box.character.name,
        rarity: box.topHit?.rarity ?? "common",
      });
      return d;
    });
  };

  const unveiled = stage === "revealed";
  const unveiling = stage === "lifting" || stage === "reveal1" || stage === "reveal2";
  const lockCount = locks.filter(Boolean).length;
  const char = result ? charOf(db, result.character.id) : null;
  const topRarity = (result?.topHit?.rarity ?? "common") as Rarity;
  const veilText =
    stage === "revealed"
      ? "Cuneiform Ribbon Severed • Vault Open"
      : unveiling
        ? (suspense ?? "The lid is creaking open…")
        : "Lid Sealed with Red Wax & Cuneiform Ribbon";

  return (
    <div className="w-full pb-10 text-on-surface">
      {/* ambient stage light */}
      <div className="pointer-events-none absolute inset-x-0 top-20 -z-10 opacity-40">
        <div className="mx-auto h-64 max-w-[1280px] bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-gold-burnished/20 via-surface-container-lowest to-transparent" />
      </div>

      {/* Hero / Stage Introduction */}
      <section className="relative mx-auto w-full max-w-[1280px] px-gutter pt-8 pb-12">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-surface-container-high px-3 py-1 shadow-inner">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            <span className="font-label-sm text-label-sm font-bold tracking-widest text-gold-radiant uppercase">
              The Ritual • Free Sandbox Initiation
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg mb-3 tracking-tight text-gold-radiant">
            The Ritual: Unbox Demo
          </h1>
          <p className="font-body-lg text-body-lg mb-8 max-w-xl text-parchment-muted">
            Free, unlimited, no account required. Pick the locks, lift the lid, and
            discover your fate under the Archival Covenant.
          </p>
          {/* Tier Selector Relic Switcher */}
          <div className="inline-flex rounded-full bg-surface-container-lowest p-1.5 shadow-2xl">
            {TIERS.map((t) => (
              <button
                key={t.id}
                onClick={() => fullReset(t.id)}
                className={cn(
                  "font-label-md text-label-md rounded-full px-5 py-2.5 tracking-wider uppercase transition-all duration-300",
                  tier === t.id
                    ? "bg-surface-vault font-bold text-gold-radiant shadow-lg"
                    : "text-on-surface-variant hover:text-gold-radiant"
                )}
              >
                {tier === t.id ? t.active : t.vessel}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Ritual Interactive Chamber */}
      <section className="mx-auto w-full max-w-[1280px] px-gutter pb-16">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* Centerpiece Reliquary Vessel Stage */}
          <div className="flex flex-col gap-6 lg:col-span-7">
            <div className="relative flex flex-col overflow-hidden rounded-xl bg-surface-midnight p-6 shadow-2xl md:p-8">
              {/* Atmospheric Header / Status Bar */}
              <div className="mb-6 flex items-center justify-between border-b border-surface-container-high/40 pb-6">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-gold-burnished">lock_clock</span>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm tracking-widest text-outline uppercase">
                      Seal Integrity
                    </span>
                    <span className="font-headline-sm text-headline-sm font-semibold text-parchment-text">
                      2 Iron Padlocks — {lockCount} of 2 picked
                    </span>
                  </div>
                </div>
                <div className="hidden items-center gap-2 rounded-full bg-surface-container-high px-3 py-1.5 sm:flex">
                  <span className="material-symbols-outlined text-sm text-gold-radiant">
                    visibility
                  </span>
                  <span className="font-label-sm text-label-sm tracking-wider text-gold-radiant uppercase">
                    Demo Chamber
                  </span>
                </div>
              </div>

              {/* Chest Stage Canvas */}
              <div className="group relative flex aspect-[4/3] max-h-[440px] w-full items-center justify-center overflow-hidden rounded-lg bg-surface-container-lowest shadow-inner">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold-burnished/15 via-surface-midnight/80 to-surface-container-lowest" />
                <svg
                  className="absolute h-72 w-72 animate-[spin_60s_linear_infinite] text-gold-burnished/10"
                  fill="none"
                  viewBox="0 0 100 100"
                >
                  <circle cx="50" cy="50" r="46" stroke="currentColor" strokeDasharray="2 3" strokeWidth="0.75" />
                  <circle cx="50" cy="50" r="38" stroke="currentColor" strokeDasharray="8 6" strokeWidth="0.5" />
                  <polygon fill="none" points="50,6 90,75 10,75" stroke="currentColor" strokeWidth="0.5" />
                  <polygon fill="none" points="50,94 90,25 10,25" stroke="currentColor" strokeWidth="0.5" />
                </svg>

                <div className="relative z-10 flex w-full max-w-lg flex-col items-center justify-center transition-all duration-700 select-none">
                  <div
                    className={cn(
                      "pointer-events-none absolute -inset-10 rounded-full blur-2xl transition-all duration-1000",
                      unveiled ? "bg-gold-radiant/20" : "bg-gold-radiant/0"
                    )}
                  />
                  <div className="relative aspect-square w-full max-w-[380px] overflow-hidden rounded-xl border border-gold-burnished/50 shadow-[0_10px_40px_rgba(0,0,0,0.8)] sm:max-w-[420px]">
                    <Image
                      src="/stitch/chest.jpg"
                      alt="Ancient mystical mystery chest, ornate weathered dark ebony wood with brass filigree, crimson wax seals, red silk ribbon and two heavy iron padlocks"
                      fill
                      sizes="(max-width: 1024px) 90vw, 420px"
                      className={cn(
                        "object-cover transition-all duration-700",
                        unveiled && "scale-105 brightness-110"
                      )}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface-midnight via-transparent to-surface-midnight/30" />
                    <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-gold-radiant/30 ring-inset" />
                    {/* lid ribbon */}
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 origin-top transition-transform duration-700">
                      <div
                        className={cn(
                          "absolute inset-x-0 bottom-2 flex h-5 items-center justify-around overflow-hidden bg-error-container/80 shadow-md backdrop-blur-sm transition-opacity duration-500",
                          unveiled && "opacity-0"
                        )}
                      >
                        <span className="font-label-sm font-mono text-[9px] font-bold tracking-widest text-error uppercase select-none">
                          • 𒀝 𒊕 𒁺 𒄖 𒄩 • 𒅗 𒈠 𒈾 𒉺 𒋡 •
                        </span>
                      </div>
                    </div>
                    {/* padlocks */}
                    {([0, 1] as const).map((i) => (
                      <button
                        key={i}
                        onClick={() => toggleLock(i)}
                        aria-label={`Pick iron lock ${i + 1}`}
                        className={cn(
                          "absolute top-[34%] z-20 flex cursor-pointer flex-col items-center transition-all duration-300 hover:scale-110",
                          i === 0 ? "left-[24%]" : "right-[24%]"
                        )}
                      >
                        <div
                          className={cn(
                            "h-6 w-5 rounded-t-full border border-gold-burnished/60 bg-outline-variant transition-transform duration-300",
                            locks[i] && "-translate-y-2"
                          )}
                        />
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gold-burnished/80 bg-surface-midnight/90 shadow-[0_0_12px_rgba(212,175,55,0.4)] backdrop-blur-md">
                          <span className="material-symbols-outlined text-base text-gold-radiant">
                            {locks[i] ? "lock_open" : "lock"}
                          </span>
                        </div>
                        <span className="font-label-sm mt-1 rounded border border-gold-burnished/40 bg-surface-container-lowest/90 px-1.5 py-0.5 text-[8px] font-semibold tracking-wider text-gold-radiant uppercase shadow">
                          Lock {i === 0 ? "I" : "II"}
                        </span>
                      </button>
                    ))}
                    <div className="pointer-events-none absolute inset-x-4 bottom-3 flex items-center justify-between">
                      <span className="font-label-sm rounded border border-gold-burnished/30 bg-surface-container-lowest/80 px-2 py-0.5 font-mono text-[9px] tracking-widest text-gold-radiant/70">
                        ᚱ • ᚨ • ᛚ • ᛗ
                      </span>
                      <div
                        className={cn(
                          "h-1.5 w-1.5 rounded-full bg-gold-radiant",
                          !unveiled && "animate-ping"
                        )}
                      />
                      <span className="font-label-sm rounded border border-gold-burnished/30 bg-surface-container-lowest/80 px-2 py-0.5 font-mono text-[9px] tracking-widest text-gold-radiant/70">
                        ᛊ • ᚦ • ᛏ • ᛟ
                      </span>
                    </div>
                  </div>
                </div>

                {unveiled && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-60">
                    <span className="material-symbols-outlined animate-ping text-8xl text-gold-radiant">
                      auto_awesome
                    </span>
                  </div>
                )}
              </div>

              {/* Veil Status Banner */}
              <div className="mt-4 flex items-center justify-between rounded bg-surface-container-lowest p-3">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "h-2.5 w-2.5 rounded-full",
                      unveiled ? "bg-gold-radiant" : "animate-ping bg-error"
                    )}
                  />
                  <span className="font-label-md text-label-md tracking-wider text-parchment-text uppercase">
                    Veil Status:
                  </span>
                  <span
                    className={cn(
                      "font-body-md text-body-md italic",
                      unveiled ? "text-gold-radiant" : "text-parchment-muted"
                    )}
                  >
                    {veilText}
                  </span>
                </div>
                <span className="font-label-sm text-label-sm hidden tracking-widest text-outline uppercase md:inline">
                  Tier: {db.tiers[tier].name}
                </span>
              </div>

              {/* Lock Manipulation Actions */}
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {([0, 1] as const).map((i) => (
                  <button
                    key={i}
                    onClick={() => toggleLock(i)}
                    disabled={locks[i] || unveiled || unveiling}
                    className="font-label-md text-label-md flex items-center justify-center gap-2 rounded-lg bg-surface-vault px-4 py-3 tracking-wider text-parchment-text uppercase transition-all hover:text-gold-radiant disabled:opacity-60"
                  >
                    <span className="material-symbols-outlined text-gold-radiant">key</span>
                    <span>{locks[i] ? `Lock ${i + 1} Picked (Secure)` : `Pick Iron Lock ${i + 1}`}</span>
                  </button>
                ))}
              </div>

              {/* Big Unveil CTA */}
              <button
                onClick={breakSealAndUnveil}
                disabled={!locks.every(Boolean) || unveiled || unveiling}
                className={cn(
                  "font-label-lg text-label-lg mt-4 flex w-full items-center justify-center gap-2 rounded-lg py-4 tracking-widest uppercase transition-all duration-300",
                  unveiled || (locks.every(Boolean) && !unveiling)
                    ? "bg-gradient-to-b from-primary-container to-gold-burnished text-on-primary shadow-[0_4px_20px_rgba(212,175,55,0.35)] hover:brightness-110"
                    : "cursor-not-allowed bg-surface-container-high text-outline"
                )}
              >
                <span className="material-symbols-outlined text-xl">
                  {locks.every(Boolean) && !unveiling && !unveiled ? "auto_awesome" : "lock"}
                </span>
                <span>
                  {unveiled
                    ? "Vault Open — Fate Revealed"
                    : unveiling
                      ? "The Seal Is Breaking…"
                      : locks.every(Boolean)
                        ? "Break Seal & Unveil Artifacts"
                        : `Pick Both Locks (${lockCount}/2 Open)`}
                </span>
              </button>
              {unveiling && (
                <button
                  onClick={revealAll}
                  className="font-label-md text-label-md mt-2 w-full rounded-lg border border-gold-burnished/50 px-4 py-2 tracking-wider text-gold-radiant uppercase transition-all hover:bg-gold-burnished/10"
                >
                  Reveal now →
                </button>
              )}

              {/* Reset Sandbox Control */}
              <div className="mt-4 flex items-center justify-between text-outline">
                <span className="font-label-sm text-label-sm tracking-wider uppercase">
                  {db.tiers[tier].name} Vessel · {money(db.tiers[tier].price)} · 2 iron locks
                </span>
                <button
                  onClick={() => fullReset(tier)}
                  type="button"
                  className="font-label-sm text-label-sm flex items-center gap-1 tracking-wider text-gold-burnished uppercase transition-colors hover:text-gold-radiant"
                >
                  <span className="material-symbols-outlined text-xs">restart_alt</span> Reset Vault
                  Chamber
                </button>
              </div>
            </div>
          </div>

          {/* "Your Pull" Unveiling Pedestal & Live Drops */}
          <div className="flex flex-col gap-6 lg:col-span-5">
            <div className="flex flex-col rounded-xl bg-surface-midnight p-6 shadow-2xl md:p-8">
              <div className="mb-4 flex items-center justify-between border-b border-surface-container-high/40 pb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-gold-radiant">trophy</span>
                  <h2 className="font-headline-sm text-headline-sm text-parchment-text">Your Pull</h2>
                </div>
                <span className="font-label-sm text-label-sm rounded-full bg-surface-container-high px-2.5 py-0.5 tracking-wider text-parchment-muted uppercase">
                  {unveiled ? "Fate Revealed" : "Waiting in Shroud"}
                </span>
              </div>
              <p className="font-body-sm text-body-sm mb-6 text-parchment-muted">
                Break the locks, lift the lid, and hold your nerve — your character,
                mythic story, and consecrated artifact emerge from the physical velvet.
              </p>
              {/* Slot Cards Container */}
              <div className="mb-6 grid grid-cols-3 gap-3">
                <SlotCard
                  icon="style"
                  label="Character"
                  sub="Velvet Pouch"
                  revealed={unveiled}
                  content={char ? char.emoji : null}
                  foot={char?.name}
                />
                <SlotCard
                  icon="auto_stories"
                  label="Myth Book"
                  sub="Wax Binding"
                  revealed={unveiled}
                  content={result ? "📖" : null}
                  foot={result?.story.title}
                />
                <SlotCard
                  icon="history_edu"
                  label="Your Wish"
                  sub="Pure Linen"
                  revealed={unveiled}
                  content={result ? "🕯️" : null}
                  foot="Blank By Design"
                />
              </div>

              {/* Revealing Result Box */}
              {unveiled && result && char && (
                <div className="flex flex-col gap-3 rounded-lg bg-surface-vault p-5 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm flex items-center gap-1.5 rounded bg-rarity-legendary/20 px-2.5 py-1 font-bold tracking-wider text-rarity-legendary uppercase">
                      <span className="h-1.5 w-1.5 rounded-full bg-rarity-legendary" />
                      {RARITY_WORD[topRarity]} Pull
                    </span>
                    <span className="font-label-sm text-label-sm text-outline">
                      {db.tiers[tier].name} Demo
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm font-bold text-gold-radiant">
                    {char.emoji} {result.topHit?.name ?? char.name}
                  </h3>
                  <p className="font-body-sm text-body-sm leading-relaxed text-parchment-text">
                    {char.desc}
                  </p>
                  <p className="font-body-sm text-body-sm text-parchment-muted">
                    Story: <strong className="text-parchment-text">{result.story.title}</strong>{" "}
                    · Est. box value {money(result.estValue)}
                  </p>
                  <Link
                    href={`/checkout/${tier}`}
                    className="font-label-md text-label-md mt-1 rounded-lg bg-gradient-to-b from-primary-container to-gold-burnished px-4 py-2.5 text-center font-bold tracking-wider text-on-primary uppercase"
                  >
                    Get this tier for real →
                  </Link>
                </div>
              )}

              {/* Archival Sanctity Caveat Note */}
              <div className="mt-4 rounded bg-surface-container-lowest p-4">
                <div className="flex gap-3">
                  <span className="material-symbols-outlined shrink-0 text-lg text-gold-burnished">
                    verified_user
                  </span>
                  <p className="font-body-sm text-body-sm text-parchment-muted">
                    <strong className="font-medium text-parchment-text">
                      Respectful Storytelling:
                    </strong>{" "}
                    Deity, sacred, mythological, and historical figures are honored,
                    never ranked.{" "}
                    <span className="text-gold-radiant">
                      Rarity describes the print edition, never the faith.
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Live Global Pulls Ticker Section */}
            <div className="flex flex-col rounded-xl bg-surface-midnight p-6 shadow-xl">
              <div className="mb-3 flex items-center justify-between border-b border-surface-container-high/40 pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-ember-glow" />
                  <span className="font-headline-sm text-headline-sm text-parchment-text">
                    Live Global Drops
                  </span>
                </div>
                <span className="font-label-sm text-label-sm tracking-wider text-outline uppercase">
                  Synchronized Lexicon
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {db.live
                  .slice(-4)
                  .reverse()
                  .map((l, i) => (
                    <div
                      key={`${l.who}-${l.what}-${i}`}
                      className="flex items-center justify-between rounded-lg bg-surface-container-low p-3 transition-colors hover:bg-surface-container"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-vault text-xs font-bold text-gold-radiant">
                          {l.who.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-body-sm text-body-sm font-medium text-parchment-text">
                            ✨ <strong className="font-bold text-gold-radiant">{l.who}</strong>
                          </span>
                          <span className="font-body-sm text-body-sm text-parchment-muted">
                            pulled {l.what}
                          </span>
                        </div>
                      </div>
                      <span
                        className={cn(
                          "rounded px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wider uppercase",
                          RARITY_BADGE[l.rarity as Rarity] ?? RARITY_BADGE.common
                        )}
                      >
                        {RARITY_WORD[(l.rarity as Rarity) ?? "common"] ?? l.rarity}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Arcane Lore & Assurance Band */}
      <section className="mx-auto w-full max-w-[1280px] px-gutter pb-20">
        <div className="mb-12 flex h-[1px] w-full items-center justify-center bg-gradient-to-r from-transparent via-gold-burnished/30 to-transparent">
          <div className="h-2 w-2 rotate-45 bg-surface-container-lowest" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              icon: "key",
              title: "Mechanical Integrity",
              body: "The unboxing chamber utilizes cryptographic seed distribution. Digital lock mechanisms simulate the tactile weight of authentic brass tumblers.",
            },
            {
              icon: "menu_book",
              title: "Historical Lexicon",
              body: "Every unboxed artifact includes its complete scholarly mythos, annotated by resident cultural historians to preserve original folklore context.",
            },
            {
              icon: "diamond",
              title: "Sacred Non-Hierarchy",
              body: "We reject the gamification of spiritual significance. Edition scarcity pertains purely to physical foil, materials, and limited print numbering.",
            },
          ].map((c) => (
            <div key={c.title} className="flex flex-col gap-3 rounded-xl bg-surface-midnight p-6 shadow-lg">
              <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-surface-vault text-gold-radiant">
                <span className="material-symbols-outlined">{c.icon}</span>
              </div>
              <h4 className="font-headline-sm text-headline-sm text-parchment-text">{c.title}</h4>
              <p className="font-body-sm text-body-sm text-parchment-muted">{c.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SlotCard({
  icon,
  label,
  sub,
  revealed,
  content,
  foot,
}: {
  icon: string;
  label: string;
  sub: string;
  revealed: boolean;
  content: React.ReactNode;
  foot?: string;
}) {
  return (
    <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-surface-container-lowest p-3 text-center shadow-inner transition-all duration-700">
      <div className="absolute inset-0 bg-gradient-to-b from-surface-vault to-surface-container-lowest" />
      <div className="relative z-10 flex h-full flex-col items-center justify-center">
        {revealed && content ? (
          <>
            <span className="mb-1 text-3xl">{content}</span>
            <span className="font-label-sm line-clamp-2 text-[10px] tracking-wider text-gold-radiant uppercase">
              {foot}
            </span>
          </>
        ) : (
          <>
            <span className="material-symbols-outlined mb-1 text-3xl text-outline transition-colors">
              {icon}
            </span>
            <span className="font-label-sm text-[10px] tracking-wider text-outline uppercase">
              {label}
            </span>
            <span className="font-label-sm mt-1 text-[8px] text-outline/60">{sub}</span>
          </>
        )}
      </div>
    </div>
  );
}
