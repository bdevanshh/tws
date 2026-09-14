"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { Maximize, Minimize } from "lucide-react";
import { generateBox } from "@/lib/engine";
import { charOf, engineInput, useStore } from "@/lib/store";
import type { Rarity, SealedBox, TierId } from "@/lib/types";
import { money } from "@/components/tier-card";
import { cn } from "@/lib/utils";

const Chest3D = dynamic(() => import("@/components/chest-3d").then((m) => m.Chest3D), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-surface-container-lowest">
      <span className="font-label-sm animate-pulse text-[11px] tracking-widest text-gold-radiant uppercase">
        Conjuring the vessel…
      </span>
    </div>
  ),
});

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
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {});
      return;
    }
    void stageRef.current?.requestFullscreen?.().catch(() => {});
  }, []);

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

      {/* Fullscreen Ritual Chamber */}
      <div
        ref={stageRef}
        className={cn(
          "relative left-1/2 w-screen max-w-none -translate-x-1/2 overflow-hidden bg-[#0d0b13]",
          isFullscreen ? "h-screen" : "h-[calc(100svh-5rem)] min-h-[640px]"
        )}
      >
        {/* Interactive 3D Chest Stage (Three.js) — fills the chamber */}
        <div className="absolute inset-0">
          <Chest3D
            stage={stage}
            locks={locks}
            tier={tier}
            rarity={unveiled ? topRarity : "legendary"}
            prizeEmoji={char?.emoji ?? null}
            onPickLock={toggleLock}
            onOpen={breakSealAndUnveil}
          />
        </div>
        <div className="pointer-events-none absolute inset-0 ring-1 ring-gold-radiant/20 ring-inset" />
        {/* cinematic vignettes */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Top HUD */}
        <div className="pointer-events-none absolute inset-x-0 top-0">
          <div className="mx-auto flex w-full max-w-[1280px] flex-wrap items-center justify-between gap-3 px-gutter pt-5">
            <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-gold-burnished/30 bg-black/55 py-1.5 pr-4 pl-1.5 backdrop-blur-md">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-vault">
                <span className="material-symbols-outlined text-gold-burnished">lock_clock</span>
              </span>
              <div className="flex flex-col leading-tight">
                <span className="font-label-sm text-[10px] tracking-widest text-outline uppercase">
                  Seal Integrity
                </span>
                <span className="font-headline-sm text-sm font-semibold text-parchment-text">
                  {lockCount} of 2 picked
                </span>
              </div>
            </div>
            <div className="pointer-events-auto hidden items-center gap-1 rounded-full border border-gold-burnished/30 bg-black/55 p-1 backdrop-blur-md md:inline-flex">
              {TIERS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => fullReset(t.id)}
                  className={cn(
                    "font-label-sm rounded-full px-4 py-1.5 text-[11px] tracking-wider uppercase transition-all",
                    tier === t.id
                      ? "bg-surface-vault font-bold text-gold-radiant"
                      : "text-parchment-muted hover:text-gold-radiant"
                  )}
                >
                  {t.vessel}
                </button>
              ))}
            </div>
            <div className="pointer-events-auto flex items-center gap-2">
              <span className="font-label-sm hidden items-center gap-2 rounded-full bg-black/55 px-3 py-2 text-[10px] tracking-wider text-gold-radiant uppercase backdrop-blur-md sm:inline-flex">
                <span className="material-symbols-outlined text-sm">visibility</span>
                Demo Chamber
              </span>
              <button
                onClick={toggleFullscreen}
                type="button"
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gold-burnished/40 bg-black/55 text-gold-radiant backdrop-blur-md transition-all hover:bg-gold-burnished hover:text-on-primary"
              >
                {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom HUD — veil status + ritual actions */}
        <div className="pointer-events-none absolute inset-x-0 bottom-12">
          <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-3 px-4">
            <div className="pointer-events-auto flex w-full items-center justify-between gap-2 rounded-full border border-gold-burnished/25 bg-black/60 px-4 py-2 backdrop-blur-md">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className={cn(
                    "h-2.5 w-2.5 shrink-0 rounded-full",
                    unveiled ? "bg-gold-radiant" : "animate-ping bg-error"
                  )}
                />
                <span className="font-body-md truncate text-sm italic text-parchment-muted">
                  {veilText}
                </span>
              </div>
              <span className="font-label-sm hidden shrink-0 tracking-widest text-outline uppercase md:inline">
                {db.tiers[tier].name}
              </span>
            </div>
            <div className="pointer-events-auto grid w-full grid-cols-2 gap-2">
              {([0, 1] as const).map((i) => (
                <button
                  key={i}
                  onClick={() => toggleLock(i)}
                  disabled={locks[i] || unveiled || unveiling}
                  className="font-label-md flex items-center justify-center gap-2 rounded-lg border border-gold-burnished/30 bg-black/60 px-4 py-3 text-sm tracking-wider text-parchment-text uppercase backdrop-blur-md transition-all hover:text-gold-radiant disabled:opacity-60"
                >
                  <span className="material-symbols-outlined text-gold-radiant">key</span>
                  <span>{locks[i] ? `Lock ${i + 1} Picked` : `Pick Lock ${i + 1}`}</span>
                </button>
              ))}
            </div>
            <button
              onClick={breakSealAndUnveil}
              disabled={!locks.every(Boolean) || unveiled || unveiling}
              className={cn(
                "font-label-lg pointer-events-auto flex w-full items-center justify-center gap-2 rounded-lg py-4 text-sm tracking-widest uppercase transition-all duration-300",
                unveiled || (locks.every(Boolean) && !unveiling)
                  ? "bg-gradient-to-b from-primary-container to-gold-burnished text-on-primary shadow-[0_4px_20px_rgba(212,175,55,0.35)] hover:brightness-110"
                  : "cursor-not-allowed bg-black/60 text-outline backdrop-blur-md"
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
            <div className="pointer-events-auto flex items-center gap-3">
              {unveiling && (
                <button
                  onClick={revealAll}
                  className="font-label-md rounded-lg border border-gold-burnished/50 px-4 py-2 text-xs tracking-wider text-gold-radiant uppercase transition-all hover:bg-gold-burnished/10"
                >
                  Reveal now →
                </button>
              )}
              <button
                onClick={() => fullReset(tier)}
                type="button"
                className="font-label-sm flex items-center gap-1 px-2 py-2 text-[11px] tracking-wider text-gold-burnished uppercase transition-colors hover:text-gold-radiant"
              >
                <span className="material-symbols-outlined text-xs">restart_alt</span> Reset Vault
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results & live chamber feed */}
      <section className="mx-auto w-full max-w-[1280px] px-gutter py-10">
        <div className="mb-6 flex items-center justify-between rounded-xl border border-gold-burnished/25 bg-surface-midnight px-5 py-4 text-outline">
          <span className="font-label-sm text-xs tracking-wider uppercase">
            {db.tiers[tier].name} Vessel · {money(db.tiers[tier].price)} · 2 iron locks
          </span>
          <div className="inline-flex rounded-full bg-surface-container-lowest p-1 md:hidden">
            {TIERS.map((t) => (
              <button
                key={t.id}
                onClick={() => fullReset(t.id)}
                className={cn(
                  "font-label-sm rounded-full px-3 py-1.5 text-[10px] tracking-wider uppercase",
                  tier === t.id ? "bg-surface-vault text-gold-radiant" : "text-parchment-muted"
                )}
              >
                {t.id}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* "Your Pull" Unveiling Pedestal */}
          <div className="flex flex-col gap-6 lg:col-span-7">
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
          </div>

          {/* Live Global Pulls Ticker Section */}
          <div className="flex flex-col gap-6 lg:col-span-5">
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
