"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import type { Rarity } from "@/lib/types";
import { cn } from "@/lib/utils";

/* ---- Static Stitch copy: cultural traditions ticker (exact order) ---- */
const TRADITIONS = [
  "Akan · West African",
  "Aztec · Mesoamerican",
  "Buddhist",
  "Chinese",
  "Christian",
  "Egyptian",
  "Greek",
  "Hindu · Indian",
  "Islamic · Sufi",
  "Jain",
  "Japanese · Shinto",
  "Norse",
  "Roman",
  "Sikh",
];

/* ---- Static Stitch copy: rarity ribbon ---- */
const RIBBON: { label: Rarity | "mythic"; text: string; box: string; gem: string }[] = [
  {
    label: "common",
    text: "text-rarity-common",
    box: "border-rarity-common/30",
    gem: "bg-rarity-common shadow-[0_0_8px_currentColor]",
  },
  {
    label: "rare",
    text: "text-rarity-rare",
    box: "border-rarity-rare/40 shadow-[0_0_12px_rgba(56,189,248,0.15)]",
    gem: "bg-rarity-rare shadow-[0_0_10px_currentColor]",
  },
  {
    label: "epic",
    text: "text-rarity-epic",
    box: "border-rarity-epic/40 shadow-[0_0_14px_rgba(168,85,247,0.2)]",
    gem: "bg-rarity-epic shadow-[0_0_12px_currentColor]",
  },
  {
    label: "legendary",
    text: "text-rarity-legendary",
    box: "border-rarity-legendary/50 shadow-[0_0_16px_rgba(245,158,11,0.25)]",
    gem: "bg-rarity-legendary shadow-[0_0_14px_currentColor]",
  },
  {
    label: "mythic",
    text: "text-rarity-mythic",
    box: "border-rarity-mythic/50 shadow-[0_0_20px_rgba(236,72,153,0.3)]",
    gem: "bg-rarity-mythic shadow-[0_0_16px_currentColor]",
  },
];

const RIBBON_LABEL: Record<string, string> = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
  mythic: "Ultra Rare",
};

/* ---- Static Stitch copy: tier feature lists ---- */
const TIER_FEATURES = {
  regular: [
    { icon: "check_circle", text: "1 Foil Sealed Mystery Book" },
    { icon: "check_circle", text: "2 Foil Stamped Character Cards" },
    { icon: "check_circle", text: "Hand-Poured Ritual Bookmark" },
    { icon: "check_circle", text: "Small Cultural Relic Artifact" },
  ],
  medium: [
    { icon: "verified", text: "1 Hardcover Bound Mystery Grimoire" },
    { icon: "verified", text: "4 Foil Character & Lore Relic Cards" },
    { icon: "verified", text: "1 Sculpted Figurine Character Collectible" },
    { icon: "verified", text: "Museum-Grade Cultural Art Print" },
  ],
  premium: [
    { icon: "stars", text: "Deluxe Leatherette Foil Mystery Book" },
    { icon: "stars", text: "6 Gold-Gilded Archetype Cards" },
    { icon: "stars", text: "2 Heavy Metal & Stone Collectibles" },
    { icon: "stars", text: "Exclusive Masterwork Art Portfolio" },
  ],
} as const;

const TIER_ART = {
  regular: {
    src: "/stitch/regular-box.jpg",
    alt: "Dark fantasy medieval reliquary small carved wooden mystery chest with faint brass filigree and runic seal, glowing subtly against obsidian background, high aesthetic photography",
  },
  medium: {
    src: "/stitch/medium-box.jpg",
    alt: "Intricately carved dark oak fantasy chest with radiant polished brass hinges and embossed sigil glowing soft gold light from seams, photorealistic occult relic",
  },
  premium: {
    src: "/stitch/premium-box.jpg",
    alt: "Grand opulent velvet-lined obsidian tome box with gold and violet glowing gemstones, etched constellation filigree, museum luxury artifact styling",
  },
} as const;

/* ---- Static Stitch copy: lore cards (pixel-exact descriptions) ---- */
const STITCH_LORE: Record<string, { desc: string; symbols: string; tales: string }> = {
  krishna: {
    desc: "Cowherd-prince and charioteer whose dialogue in the Bhagavad Gita explores duty, devotion, and detachment.",
    symbols: "Flute · Peacock feather · Sudarshana Chakra",
    tales: "The Song on the Battlefield · The Butter Thief of Vrindavan",
  },
  shiva: {
    desc: "The ascetic-transformer of the Trimurti — cosmic dancer, silent meditator, and destroyer of mortal illusion.",
    symbols: "Trishul · Damru · Third eye",
    tales: "The Dance of Nataraja · The Blue Throat",
  },
  durga: {
    desc: "The invincible mother goddess who rides a lion and restores cosmic equilibrium whenever chaos threatens light.",
    symbols: "Lion · Trident · Lotus",
    tales: "Nine Nights of the Goddess",
  },
  ganesha: {
    desc: "Remover of obstacles and patron of beginnings, wisdom, and letters, invoked before every sacred undertaking.",
    symbols: "Modak · Mouse · Om",
    tales: "Around the World on a Mouse",
  },
  nanak: {
    desc: "Founder of Sikhism who taught one universal Creator, honest labor, communal sharing, and absolute human equality.",
    symbols: "Ik Onkar · Langar · Rabab",
    tales: "Three Days in the River",
  },
  buddha: {
    desc: "Siddhartha Gautama, whose Middle Way, Four Noble Truths, and Eightfold Path shaped contemplative wisdom across Asia.",
    symbols: "Bodhi leaf · Dharma wheel · Lotus",
    tales: "The Night Under the Tree · The Mustard Seed",
  },
};

const LORE_TABS = [
  "All",
  "Hindu · Indian",
  "Sikh",
  "Buddhist",
  "Greco-Roman",
  "Norse",
  "Egyptian",
  "East Asian",
] as const;

function tabMatch(tradition: string, tab: string): boolean {
  if (tab === "All") return true;
  if (tab === "Greco-Roman") return tradition === "Greek" || tradition === "Roman";
  if (tab === "East Asian")
    return tradition === "Chinese" || tradition === "Japanese" || tradition === "Japanese · Shinto";
  return tradition === tab;
}

const PILL: Record<Rarity, string> = {
  common: "text-rarity-common border-rarity-common/30",
  rare: "text-rarity-rare border-rarity-rare/40",
  epic: "text-rarity-epic border-rarity-epic/40",
  legendary: "text-rarity-legendary border-rarity-legendary/50",
  ultrarare: "text-rarity-mythic border-rarity-mythic/50",
};

const MEDALLION: Record<Rarity, string> = {
  common:
    "border-rarity-common/30 shadow-[0_0_12px_rgba(148,163,184,0.25)]",
  rare: "border-rarity-rare/40 shadow-[0_0_12px_rgba(56,189,248,0.2)]",
  epic: "border-rarity-epic/40 shadow-[0_0_12px_rgba(168,85,247,0.25)]",
  legendary:
    "border-rarity-legendary/50 shadow-[0_0_14px_rgba(245,158,11,0.3)]",
  ultrarare:
    "border-rarity-mythic/50 shadow-[0_0_14px_rgba(236,72,153,0.3)]",
};

const RARITY_WORD: Record<Rarity, string> = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
  ultrarare: "Ultra Rare",
};

/* ---- Static Stitch copy: live drops ---- */
const DROPS = [
  { emoji: "🌸", who: "Yuki · Japan", what: "Moon Festival Tea", rarity: "Common", hot: false },
  { emoji: "🔱", who: "Arjun · India", what: "Shiva — Cosmic Dancer", rarity: "Legendary", hot: true },
  { emoji: "☀️", who: "Sofia · Spain", what: "Amaterasu — Return of Light", rarity: "Legendary", hot: true },
] as const;

function OrnateDivider({ gem }: { gem: "arcane" | "epic" | "legendary" | "rare" | "mana" }) {
  const styles = {
    arcane: {
      ring: "border-secondary-container shadow-[0_0_12px_rgba(52,150,227,0.9)]",
      core: "bg-secondary",
      box: "w-3.5 h-3.5",
      dot: "w-1.5 h-1.5",
    },
    epic: {
      ring: "border-rarity-epic shadow-[0_0_12px_rgba(168,85,247,0.8)]",
      core: "bg-rarity-epic",
      box: "w-3 h-3",
      dot: "w-1 h-1",
    },
    legendary: {
      ring: "border-rarity-legendary shadow-[0_0_12px_rgba(245,158,11,0.9)]",
      core: "bg-gold-radiant",
      box: "w-3.5 h-3.5",
      dot: "w-1.5 h-1.5",
    },
    rare: {
      ring: "border-rarity-rare shadow-[0_0_12px_rgba(56,189,248,0.9)]",
      core: "bg-rarity-rare",
      box: "w-3.5 h-3.5",
      dot: "w-1.5 h-1.5",
    },
    mana: {
      ring: "border-secondary shadow-[0_0_12px_rgba(153,203,255,0.9)]",
      core: "bg-secondary",
      box: "w-3 h-3",
      dot: "w-1 h-1",
    },
  }[gem];
  return (
    <div className="relative mx-auto flex w-full max-w-[1280px] items-center justify-center px-gutter py-4">
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-gold-burnished/40 to-transparent" />
      <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1 bg-background px-3">
        <div className="h-1.5 w-1.5 rotate-45 bg-gold-burnished/60" />
        <div
          className={cn(
            "flex items-center justify-center rotate-45 border bg-surface-vault",
            styles.ring,
            styles.box
          )}
        >
          <div className={cn("rotate-45", styles.core, styles.dot)} />
        </div>
        <div className="h-1.5 w-1.5 rotate-45 bg-gold-burnished/60" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const { db } = useStore();
  const [tab, setTab] = useState<string>("All");
  const [expanded, setExpanded] = useState(false);

  const souls = db.characters.length;
  const stories = db.stories.length;

  const loreList = useMemo(
    () => db.characters.filter((c) => tabMatch(c.tradition, tab)),
    [db, tab]
  );
  const visibleLore = expanded ? loreList : loreList.slice(0, 6);

  return (
    <div className="pb-10 text-on-surface">
      {/* HERO */}
      <section className="relative flex w-full flex-col items-center justify-center overflow-hidden px-gutter pt-12 pb-20 text-center">
        <div className="pointer-events-none absolute top-1/4 left-1/2 h-[360px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-container/10 blur-[130px]" />
        <div className="pointer-events-none absolute top-1/2 left-1/4 h-[350px] w-[350px] rounded-full bg-rarity-epic/10 blur-[110px]" />
        <div className="relative mb-6 inline-flex items-center gap-space-xs rounded-full border border-gold-burnished/40 bg-surface-vault/90 px-4 py-1.5 shadow-[0_0_16px_rgba(212,175,55,0.2)]">
          <span className="text-xs text-gold-radiant">✦</span>
          <span className="font-label-sm text-label-sm font-bold tracking-[0.2em] text-gold-radiant uppercase">
            Global Mystery-Box & Collectible Experience
          </span>
          <span className="text-xs text-gold-radiant">✦</span>
        </div>
        <h1 className="font-display-hero text-display-hero mb-6 max-w-4xl leading-[1.1] tracking-tight text-parchment-text drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
          You Choose the Box.
          <br />
          <span className="bg-gradient-to-r from-gold-radiant via-primary to-gold-burnished bg-clip-text text-transparent">
            We Create the Mystery.
          </span>
          <br />
          You Discover the Story.
        </h1>
        <p className="font-body-lg text-body-lg mx-auto mb-10 max-w-2xl leading-relaxed text-parchment-muted">
          One tier. Zero spoilers. Inside: a sealed{" "}
          <strong className="font-bold text-parchment-text">Mystery Book</strong>, character cards,
          art, collectibles — and a blank{" "}
          <strong className="font-bold text-gold-radiant">YOUR WISH</strong> card you fill in{" "}
          <em className="text-parchment-text italic">after</em> unboxing, then send to us. Good
          wishes are accepted.
        </p>
        <div className="z-10 mb-14 flex flex-wrap items-center justify-center gap-space-md">
          <Link
            href="#boxes"
            className="inline-flex items-center gap-2 rounded border-t border-gold-radiant bg-gradient-to-b from-primary-fixed via-primary-container to-gold-burnished px-8 py-4 font-label-lg text-label-lg font-bold tracking-wider text-surface-container-lowest uppercase shadow-[0_0_24px_rgba(212,175,55,0.35)] transition-all hover:scale-[1.02] hover:shadow-[0_0_36px_rgba(245,215,127,0.6)] active:scale-[0.98]"
          >
            <span>Choose Your Box</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
          <Link
            href="#unboxing-ritual"
            className="inline-flex items-center gap-2 rounded border border-gold-burnished/60 bg-surface-vault/80 px-7 py-4 font-label-lg text-label-lg tracking-wider text-gold-radiant uppercase shadow-[0_4px_16px_rgba(0,0,0,0.5)] transition-all hover:border-gold-radiant hover:bg-gold-burnished/20"
          >
            <span>✦ Free Unbox Demo</span>
          </Link>
        </div>
        <div className="w-full max-w-4xl rounded-xl border border-gold-burnished/25 bg-surface-container-low/80 p-4 shadow-[0_12px_32px_rgba(0,0,0,0.7)] backdrop-blur sm:p-5">
          <div className="font-label-sm text-label-sm flex items-center justify-between gap-2 overflow-x-auto pb-1 text-center tracking-wider uppercase">
            {RIBBON.map((r) => (
              <div
                key={r.label}
                className={cn(
                  "flex min-w-[120px] flex-1 items-center justify-center gap-1.5 rounded border bg-surface-vault/50 px-3 py-2",
                  r.text,
                  r.box
                )}
              >
                <span className={cn("inline-block h-2 w-2 rotate-45", r.gem)} />
                <span>{RIBBON_LABEL[r.label]}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <OrnateDivider gem="arcane" />

      {/* CULTURAL TRADITIONS TICKER */}
      <div className="relative left-1/2 w-screen max-w-none -translate-x-1/2 overflow-hidden border-y border-outline-variant/20 bg-surface-container-lowest/60 py-3">
        <div className="marquee">
          <div className="marqueeTrack font-label-md text-label-md tracking-[0.18em] text-outline uppercase">
            {[0, 1].map((half) => (
              <div key={half} className="flex shrink-0 items-center" aria-hidden={half === 1}>
                {TRADITIONS.map((t) => (
                  <span key={t} className="mx-6 flex items-center gap-6 whitespace-nowrap">
                    <span className="text-gold-burnished">✦ {t}</span>
                    <span className="text-outline-variant">•</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TIERS */}
      <section id="boxes" className="mx-auto flex w-full max-w-[1280px] flex-col items-center px-gutter py-20">
        <div className="mb-14 max-w-2xl text-center">
          <div className="font-label-sm text-label-sm mb-2 inline-block font-bold tracking-[0.25em] text-gold-burnished uppercase">
            The Tiers of Summoning
          </div>
          <h2 className="font-headline-lg text-headline-lg mb-3 text-parchment-text">
            Select Your Artifact Vessel
          </h2>
          <p className="font-body-md text-body-md text-parchment-muted">
            The exact characters, deities, and relics remain veiled until opened. Powered by our
            controlled-random Mystery Engine.
          </p>
        </div>
        <div className="grid w-full grid-cols-1 items-stretch gap-8 lg:grid-cols-3">
          {/* Regular */}
          <div className="group relative flex flex-col justify-between rounded-xl border border-gold-burnished/20 bg-surface-midnight p-8 shadow-[0_8px_30px_rgba(0,0,0,0.8)] transition-all hover:-translate-y-1 hover:border-gold-burnished/60">
            <div className="flex flex-col">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-label-sm text-label-sm tracking-widest text-parchment-muted uppercase">
                  Begin The Mystery
                </span>
                <span className="font-label-sm text-label-sm rounded border border-rarity-common/30 bg-surface-vault px-2.5 py-1 text-rarity-common">
                  Tier I
                </span>
              </div>
              <div className="relative mb-6 flex h-44 w-full items-center justify-center overflow-hidden rounded-lg border border-outline-variant/30 bg-surface-container-low">
                <Image
                  src={TIER_ART.regular.src}
                  alt={TIER_ART.regular.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-midnight via-transparent to-transparent" />
                <span className="font-headline-sm text-headline-sm relative z-10 text-gold-radiant drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                  Regular Box
                </span>
              </div>
              <div className="mb-4 flex items-baseline gap-2">
                <span className="font-headline-lg text-headline-lg font-bold text-parchment-text">
                  ${db.tiers.regular.price.toFixed(2)}
                </span>
                <span className="font-label-sm text-label-sm text-outline">/ vessel</span>
              </div>
              <p className="font-body-sm text-body-sm mb-6 border-b border-outline-variant/30 pb-6 text-parchment-muted">
                {db.tiers.regular.desc}
              </p>
              <ul className="font-body-sm text-body-sm mb-8 flex flex-col gap-2.5 text-on-surface-variant">
                {TIER_FEATURES.regular.map((f) => (
                  <li key={f.text} className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-gold-radiant">
                      {f.icon}
                    </span>
                    <span>{f.text}</span>
                  </li>
                ))}
                <li className="flex items-center gap-2 text-outline">
                  <span className="material-symbols-outlined text-[16px] text-outline">
                    hourglass_empty
                  </span>
                  <span>Standard Tier Rarity Odds</span>
                </li>
              </ul>
            </div>
            <Link
              href="/checkout/regular"
              className="font-label-md text-label-md w-full rounded border border-gold-burnished/60 bg-surface-vault py-3.5 text-center font-bold tracking-wider text-gold-radiant uppercase shadow-[0_4px_14px_rgba(0,0,0,0.5)] transition-all hover:bg-gold-burnished hover:text-on-primary"
            >
              Choose Regular →
            </Link>
          </div>

          {/* Medium */}
          <div className="group relative flex flex-col justify-between rounded-xl border-2 border-gold-radiant bg-surface-vault p-8 shadow-[0_0_36px_rgba(212,175,55,0.25)] transition-all hover:-translate-y-4 lg:-translate-y-3">
            <div className="font-label-sm text-label-sm absolute -top-3.5 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-gradient-to-r from-primary-container via-gold-radiant to-primary-container px-4 py-1 font-bold tracking-widest whitespace-nowrap text-surface-container-lowest uppercase shadow-[0_0_12px_rgba(245,215,127,0.7)]">
              <span className="material-symbols-outlined text-[14px]">stars</span>
              <span>Most Popular Vessel</span>
            </div>
            <div className="flex flex-col">
              <div className="mt-1 mb-4 flex items-center justify-between">
                <span className="font-label-sm text-label-sm font-semibold tracking-widest text-gold-radiant uppercase">
                  Elevated Summoning
                </span>
                <span className="font-label-sm text-label-sm rounded border border-gold-burnished/50 bg-surface-container-high px-2.5 py-1 text-gold-radiant">
                  Tier II
                </span>
              </div>
              <div className="relative mb-6 flex h-44 w-full items-center justify-center overflow-hidden rounded-lg border border-gold-burnished/40 bg-surface-container-low">
                <Image
                  src={TIER_ART.medium.src}
                  alt={TIER_ART.medium.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover opacity-85 transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-vault via-transparent to-transparent" />
                <span className="font-headline-sm text-headline-sm relative z-10 text-gold-radiant drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
                  Medium Box
                </span>
              </div>
              <div className="mb-4 flex items-baseline gap-2">
                <span className="font-headline-lg text-headline-lg font-bold text-gold-radiant">
                  ${db.tiers.medium.price.toFixed(2)}
                </span>
                <span className="font-label-sm text-label-sm text-parchment-muted">/ vessel</span>
              </div>
              <p className="font-body-sm text-body-sm mb-6 border-b border-gold-burnished/20 pb-6 text-parchment-muted">
                {db.tiers.medium.desc}
              </p>
              <ul className="font-body-sm text-body-sm mb-8 flex flex-col gap-2.5 text-on-surface">
                {TIER_FEATURES.medium.map((f) => (
                  <li key={f.text} className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-gold-radiant">
                      {f.icon}
                    </span>
                    <span>{f.text}</span>
                  </li>
                ))}
                <li className="flex items-center gap-2 text-rarity-epic">
                  <span className="material-symbols-outlined text-[16px]">bolt</span>
                  <span>Elevated Rare & Epic Probability</span>
                </li>
              </ul>
            </div>
            <Link
              href="/checkout/medium"
              className="font-label-md text-label-md w-full rounded bg-gradient-to-b from-primary-fixed via-primary to-gold-burnished py-3.5 text-center font-bold tracking-wider text-surface-container-lowest uppercase shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all hover:brightness-110"
            >
              Choose Medium →
            </Link>
          </div>

          {/* Premium */}
          <div className="group relative flex flex-col justify-between rounded-xl border border-rarity-epic/40 bg-surface-midnight p-8 shadow-[0_8px_30px_rgba(0,0,0,0.8)] transition-all hover:-translate-y-1 hover:border-rarity-epic/80">
            <div className="flex flex-col">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-label-sm text-label-sm font-semibold tracking-widest text-rarity-epic uppercase">
                  Ultimate Ritual
                </span>
                <span className="font-label-sm text-label-sm rounded border border-rarity-epic/30 bg-surface-vault px-2.5 py-1 text-rarity-epic">
                  Tier III
                </span>
              </div>
              <div className="relative mb-6 flex h-44 w-full items-center justify-center overflow-hidden rounded-lg border border-outline-variant/30 bg-surface-container-low">
                <Image
                  src={TIER_ART.premium.src}
                  alt={TIER_ART.premium.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-midnight via-transparent to-transparent" />
                <span className="font-headline-sm text-headline-sm relative z-10 text-parchment-text drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                  Premium Box
                </span>
              </div>
              <div className="mb-4 flex items-baseline gap-2">
                <span className="font-headline-lg text-headline-lg font-bold text-parchment-text">
                  ${db.tiers.premium.price.toFixed(2)}
                </span>
                <span className="font-label-sm text-label-sm text-outline">/ vessel</span>
              </div>
              <p className="font-body-sm text-body-sm mb-6 border-b border-outline-variant/30 pb-6 text-parchment-muted">
                {db.tiers.premium.desc}
              </p>
              <ul className="font-body-sm text-body-sm mb-8 flex flex-col gap-2.5 text-on-surface-variant">
                {TIER_FEATURES.premium.map((f) => (
                  <li key={f.text} className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-rarity-epic">
                      {f.icon}
                    </span>
                    <span>{f.text}</span>
                  </li>
                ))}
                <li className="flex items-center gap-2 text-rarity-legendary">
                  <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                  <span>Highest Legendary & Ultra Rare Drop Rates</span>
                </li>
              </ul>
            </div>
            <Link
              href="/checkout/premium"
              className="font-label-md text-label-md w-full rounded border border-rarity-epic/60 bg-surface-vault py-3.5 text-center font-bold tracking-wider text-rarity-epic uppercase shadow-[0_4px_16px_rgba(168,85,247,0.25)] transition-all hover:border-rarity-epic hover:bg-rarity-epic/20"
            >
              Choose Premium →
            </Link>
          </div>
        </div>
        <div className="mt-10 flex max-w-3xl items-center gap-3 rounded border border-gold-burnished/30 bg-surface-container-lowest/80 p-4 text-left">
          <span className="material-symbols-outlined shrink-0 text-[24px] text-gold-radiant">
            lock
          </span>
          <p className="font-body-sm text-body-sm text-parchment-muted">
            <strong className="text-gold-radiant">No Content Selection:</strong> The customer
            cannot choose a character or story. The mystery remains veiled until the physical box
            is opened at your altar.
          </p>
        </div>
      </section>

      <OrnateDivider gem="epic" />

      {/* LORE GRIMOIRE */}
      <section
        id="universe"
        className="mx-auto flex w-full max-w-[1280px] flex-col items-center px-gutter py-16"
      >
        <div className="mb-10 max-w-2xl text-center">
          <span className="font-label-sm text-label-sm font-bold tracking-[0.25em] text-gold-burnished uppercase">
            Who You Might Meet
          </span>
          <h2 className="font-headline-lg text-headline-lg mt-0 mb-3 text-parchment-text">
            Gods, Saints, Tricksters & Heroes
          </h2>
          <p className="font-body-md text-body-md text-parchment-muted">
            Every box hides one of these souls — with their story, symbols and cards.{" "}
            <span className="font-serif text-gold-radiant italic">
              Rarity describes the edition, never the faith.
            </span>
          </p>
        </div>
        <div className="font-label-md text-label-md mb-10 flex flex-wrap items-center justify-center gap-2">
          {LORE_TABS.map((t) => {
            const active = tab === t;
            const label = t === "All" ? `All Pantheons (${souls})` : t;
            return (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  setExpanded(false);
                }}
                className={cn(
                  "rounded-full px-3.5 py-1.5 transition-colors",
                  active
                    ? "border border-gold-burnished/50 bg-surface-vault text-gold-radiant shadow-[0_0_10px_rgba(212,175,55,0.2)]"
                    : "border border-outline-variant/30 bg-surface-container-low text-on-surface-variant hover:text-gold-radiant"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
        <div className="mb-12 grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visibleLore.map((c) => {
            const override = STITCH_LORE[c.id];
            const tales = db.stories.filter((s) => s.charIds.includes(c.id));
            const desc = override?.desc ?? c.desc;
            const symbols = override?.symbols ?? c.symbols.join(" · ");
            const talesText = override?.tales ?? tales.map((t) => t.title).join(" · ");
            return (
              <div
                key={c.id}
                className="group relative flex flex-col justify-between rounded-xl border border-gold-burnished/30 bg-surface-midnight p-6 shadow-[0_4px_20px_rgba(0,0,0,0.6)] transition-all hover:border-rarity-epic"
              >
                <div>
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-full border bg-surface-vault text-2xl",
                        MEDALLION[c.rarity]
                      )}
                    >
                      {c.emoji}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={cn(
                          "font-label-sm text-label-sm rounded border bg-surface-vault px-2 py-0.5 font-bold tracking-wider uppercase",
                          PILL[c.rarity]
                        )}
                      >
                        {RARITY_WORD[c.rarity]}
                      </span>
                      <span className="font-label-sm text-label-sm tracking-wider text-outline uppercase">
                        {c.category}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm mb-1 text-parchment-text transition-colors group-hover:text-gold-radiant">
                    {c.name}
                  </h3>
                  <span className="font-label-md text-label-md mb-3 block text-gold-burnished/80">
                    {c.tradition}
                  </span>
                  <p className="font-body-sm text-body-sm mb-4 leading-relaxed text-parchment-muted">
                    {desc}
                  </p>
                </div>
                <div className="font-body-sm text-body-sm flex flex-col gap-2 border-t border-outline-variant/30 pt-3">
                  <div className="text-on-surface-variant">
                    <span className="font-label-sm text-label-sm text-[11px] font-bold tracking-wider text-outline uppercase">
                      Symbols:
                    </span>{" "}
                    {symbols}
                  </div>
                  {talesText && (
                    <div className="text-gold-radiant/90">
                      <span className="font-label-sm text-label-sm text-[11px] font-bold tracking-wider text-outline uppercase">
                        Tales:
                      </span>{" "}
                      {talesText}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex w-full flex-col items-center justify-between gap-6 rounded-xl border border-gold-burnished/30 bg-surface-vault p-6 shadow-[0_8px_24px_rgba(0,0,0,0.7)] md:flex-row">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gold-burnished/40 bg-surface-container-high text-gold-radiant">
              <span className="material-symbols-outlined text-[24px]">public</span>
            </div>
            <div>
              <h4 className="font-headline-sm text-headline-sm text-parchment-text">
                The Universe: {souls} Souls · {stories} Stories · 6 Continents
              </h4>
              <p className="font-body-sm text-body-sm text-parchment-muted">
                Every archetype labeled deity / sacred / mythological / cultural / historical.
              </p>
            </div>
          </div>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="font-label-md text-label-md shrink-0 rounded border border-gold-burnished/60 bg-surface-container-low px-6 py-2.5 tracking-wider text-gold-radiant uppercase transition-all hover:bg-gold-burnished hover:text-on-primary"
          >
            {expanded ? "Show Less ↑" : `Show All ${souls} Souls →`}
          </button>
        </div>
      </section>

      <OrnateDivider gem="legendary" />

      {/* SACRED ARTIFACT */}
      <section id="unboxing-ritual" className="mx-auto w-full max-w-[1280px] px-gutter py-20">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="relative lg:col-span-6">
            <div className="relative flex h-[460px] w-full items-center justify-center overflow-hidden rounded-2xl border border-gold-burnished/40 bg-surface-vault/60 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
              <Image
                src="/stitch/wish-ritual.jpg"
                alt="Dark fantasy tabletop display with antique wax-sealed book grimoire and a heavy textured parchment card with golden heading 'YOUR WISH' written in calligraphy, surrounded by runic brass coins and incense smoke"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-midnight via-surface-midnight/50 to-transparent" />
              <div className="relative z-10 w-80 -rotate-2 rounded-lg border-2 border-gold-burnished bg-surface-container-low/95 p-6 shadow-[0_0_30px_rgba(212,175,55,0.3)] backdrop-blur transition-transform duration-300 hover:rotate-0">
                <div className="mb-4 flex items-center justify-between border-b border-gold-burnished/30 pb-3">
                  <span className="font-headline-sm text-headline-sm tracking-wider text-gold-radiant uppercase">
                    Your Wish
                  </span>
                  <span className="material-symbols-outlined text-[20px] text-gold-burnished">
                    cruelty_free
                  </span>
                </div>
                <p className="font-body-sm text-body-sm mb-6 text-parchment-muted italic">
                  “Fill this parchment after the veil is drawn. State your true intent for the
                  universe to witness.”
                </p>
                <div className="font-label-sm text-label-sm space-y-3 border-t border-dashed border-outline-variant/50 pt-3 text-outline">
                  <div className="flex justify-between">
                    <span>Vessel Edition:</span>{" "}
                    <span className="text-gold-radiant">#7194-VEIL</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Inscription:</span>{" "}
                    <span className="text-parchment-text">[ Blank By Design ]</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sanctuary Seal:</span>{" "}
                    <span className="text-secondary">Awaiting Unboxing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start lg:col-span-6">
            <div className="font-label-sm text-label-sm mb-4 inline-flex items-center gap-2 rounded-full border border-gold-burnished/40 bg-surface-vault px-3 py-1 tracking-widest text-gold-radiant uppercase">
              <span className="material-symbols-outlined text-[14px]">history_edu</span>
              <span>The Sacred Pact</span>
            </div>
            <h2 className="font-headline-lg text-headline-lg mb-6 text-parchment-text">
              The Sealed Mystery Book & Blank “Your Wish” Card
            </h2>
            <div className="font-body-md text-body-md mb-8 space-y-4 leading-relaxed text-parchment-muted">
              <p>
                Unlike automated digital unboxings,{" "}
                <strong className="text-parchment-text">
                  no wish is entered before ordering
                </strong>
                . You do not tell us your desire through a web form.
              </p>
              <p>
                When your artifact vessel arrives, you unseal the wax by hand, read the mythic
                soul bound to your box, and{" "}
                <strong className="text-gold-radiant">
                  inscribe your genuine wish onto the sacred card in ink
                </strong>
                .
              </p>
              <p>
                You may then post the card to our physical sanctuary vault in accordance with
                ancient tradition, where good wishes are archived and accepted into the perpetual
                canon.
              </p>
            </div>
            <div className="grid w-full grid-cols-2 gap-4">
              <div className="rounded-lg border border-gold-burnished/20 bg-surface-midnight p-4">
                <span className="font-label-md text-label-md mb-1 block tracking-wider text-gold-radiant uppercase">
                  Authentic Ritual
                </span>
                <span className="font-body-sm text-body-sm text-parchment-muted">
                  Tactile physical writing creates intention unattainable through screens.
                </span>
              </div>
              <div className="rounded-lg border border-gold-burnished/20 bg-surface-midnight p-4">
                <span className="font-label-md text-label-md mb-1 block tracking-wider text-secondary uppercase">
                  Veiled Mystery
                </span>
                <span className="font-body-sm text-body-sm text-parchment-muted">
                  Zero spoilers. Every deity, tale, and relic is unknown until unwrapped.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <OrnateDivider gem="rare" />

      {/* MYSTERY ENGINE */}
      <section
        id="how-it-works"
        className="mx-auto flex w-full max-w-[1280px] flex-col items-center px-gutter py-20"
      >
        <div className="mb-14 max-w-2xl text-center">
          <span className="font-label-sm text-label-sm font-bold tracking-[0.25em] text-gold-burnished uppercase">
            Algorithmic Fate
          </span>
          <h2 className="font-headline-lg text-headline-lg mt-0 mb-3 text-parchment-text">
            Controlled Random Mystery Engine
          </h2>
          <p className="font-body-md text-body-md text-parchment-muted">
            How every vessel is composed with mathematically verified rarity, zero duplicates,
            and thematic sanctity.
          </p>
        </div>
        <div className="relative grid w-full grid-cols-1 items-center gap-4 md:grid-cols-5">
          <div className="flex flex-col items-center rounded-xl border border-gold-burnished/30 bg-surface-midnight p-5 text-center shadow-[0_6px_20px_rgba(0,0,0,0.6)]">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-gold-burnished/40 bg-surface-vault text-gold-radiant">
              <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
            </div>
            <span className="font-label-sm text-label-sm mb-1 tracking-wider text-outline uppercase">
              Node 01
            </span>
            <h4 className="font-title-lg text-title-lg mb-2 text-parchment-text">Order Tier</h4>
            <p className="font-body-sm text-body-sm text-parchment-muted">
              User selects Regular ($19.99), Medium ($39.99), or Premium ($79.99).
            </p>
          </div>
          <div className="hidden justify-center text-gold-burnished/60 md:flex">
            <span className="material-symbols-outlined text-[28px]">east</span>
          </div>
          <div className="flex flex-col items-center rounded-xl border border-gold-burnished/30 bg-surface-midnight p-5 text-center shadow-[0_6px_20px_rgba(0,0,0,0.6)]">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-rarity-rare/40 bg-surface-vault text-rarity-rare">
              <span className="material-symbols-outlined text-[20px]">groups</span>
            </div>
            <span className="font-label-sm text-label-sm mb-1 tracking-wider text-outline uppercase">
              Node 02
            </span>
            <h4 className="font-title-lg text-title-lg mb-2 text-parchment-text">
              Character Pool
            </h4>
            <p className="font-body-sm text-body-sm text-parchment-muted">
              Filtered across {souls} deities, saints, and heroes across 14 traditions.
            </p>
          </div>
          <div className="hidden justify-center text-gold-burnished/60 md:flex">
            <span className="material-symbols-outlined text-[28px]">east</span>
          </div>
          <div className="flex flex-col items-center rounded-xl border-2 border-gold-radiant bg-surface-vault p-5 text-center shadow-[0_0_24px_rgba(212,175,55,0.3)]">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-container font-bold text-on-primary shadow-[0_0_12px_rgba(245,215,127,0.7)]">
              <span className="material-symbols-outlined text-[22px]">cyclone</span>
            </div>
            <span className="font-label-sm text-label-sm mb-1 font-bold tracking-wider text-gold-radiant uppercase">
              Core Engine
            </span>
            <h4 className="font-title-lg text-title-lg mb-2 text-gold-radiant">
              Dispersion Rules
            </h4>
            <p className="font-body-sm text-body-sm text-parchment-text">
              Enforces rarity curves, live inventory caps & duplicate prevention.
            </p>
          </div>
        </div>
        <div className="mt-8 flex w-full flex-col items-center justify-between gap-4 rounded-xl border border-outline-variant/30 bg-surface-container-low p-5 sm:flex-row">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[28px] text-gold-radiant">
              package_2
            </span>
            <div>
              <span className="font-title-lg text-title-lg block font-bold text-parchment-text">
                Physical Manifestation
              </span>
              <span className="font-body-sm text-body-sm text-parchment-muted">
                The physical box is assembled by curators in wax, silk, and cardstock.
              </span>
            </div>
          </div>
          <span className="font-label-md text-label-md rounded border border-gold-burnished/40 bg-surface-vault px-4 py-1.5 tracking-wider text-gold-radiant uppercase">
            Deterministic Randomness
          </span>
        </div>
      </section>

      <OrnateDivider gem="mana" />

      {/* LIVE DROPS */}
      <section className="mx-auto flex w-full max-w-[1280px] flex-col items-center px-gutter py-16">
        <div className="mb-8 flex w-full items-center justify-between border-b border-outline-variant/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 animate-pulse rounded-full bg-emerald-500" />
            <h3 className="font-headline-sm text-headline-sm text-parchment-text">
              Live Drops · Sanctum Feed
            </h3>
          </div>
          <span className="font-label-sm text-label-sm tracking-widest text-outline uppercase">
            Global Dispatch Log
          </span>
        </div>
        <div className="mb-12 grid w-full grid-cols-1 gap-6 md:grid-cols-3">
          {DROPS.map((d) => (
            <div
              key={d.who}
              className={cn(
                "flex items-center justify-between rounded-xl border p-5",
                d.hot
                  ? "border-rarity-legendary/60 bg-surface-vault shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                  : "border-rarity-common/30 bg-surface-midnight shadow-[0_4px_16px_rgba(0,0,0,0.5)]"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border text-lg",
                    d.hot
                      ? "border-gold-burnished/60 bg-surface-container-high"
                      : "border-outline-variant/40 bg-surface-vault"
                  )}
                >
                  {d.emoji}
                </div>
                <div>
                  <div
                    className={cn(
                      "font-body-md text-body-md font-bold",
                      d.hot ? "text-gold-radiant" : "text-parchment-text"
                    )}
                  >
                    {d.who}
                  </div>
                  <div
                    className={cn(
                      "font-body-sm text-body-sm",
                      d.hot ? "text-parchment-text" : "text-parchment-muted"
                    )}
                  >
                    pulled{" "}
                    <span className={d.hot ? "text-gold-radiant" : "text-parchment-text"}>
                      {d.what}
                    </span>
                  </div>
                </div>
              </div>
              <span
                className={cn(
                  "font-label-sm text-label-sm rounded px-2.5 py-1 font-bold uppercase",
                  d.hot
                    ? "border border-rarity-legendary/60 bg-surface-container-high text-rarity-legendary"
                    : "border border-rarity-common/40 bg-surface-vault text-rarity-common"
                )}
              >
                {d.rarity}
              </span>
            </div>
          ))}
        </div>
        <div className="relative flex w-full flex-col items-center overflow-hidden rounded-2xl border border-gold-burnished/40 bg-gradient-to-r from-surface-vault via-surface-container-high to-surface-vault p-8 text-center shadow-[0_16px_40px_rgba(0,0,0,0.8)] sm:p-12">
          <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-gold-radiant/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-rarity-epic/10 blur-3xl" />
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-gold-burnished bg-surface-midnight shadow-[0_0_16px_rgba(212,175,55,0.35)]">
            <span className="material-symbols-outlined text-[28px] text-gold-radiant">
              auto_stories
            </span>
          </div>
          <h3 className="font-headline-lg text-headline-lg mb-4 max-w-xl text-parchment-text">
            Begin Your Sacred Unboxing Ceremony
          </h3>
          <p className="font-body-md text-body-md mb-8 max-w-lg text-parchment-muted">
            Your sealed box is ready to be summoned. Discover timeless mythologies and carve your
            genuine wish into history.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/unbox"
              className="font-label-md text-label-md rounded border border-gold-burnished bg-surface-vault px-8 py-3.5 tracking-wider text-gold-radiant uppercase transition-all hover:bg-gold-burnished/20"
            >
              Try Your Luck Free
            </Link>
            <Link
              href="#boxes"
              className="font-label-md text-label-md rounded bg-gradient-to-b from-primary-fixed to-gold-burnished px-8 py-3.5 font-bold tracking-wider text-surface-container-lowest uppercase shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all hover:brightness-110"
            >
              Skip to Boxes →
            </Link>
          </div>
          <div className="font-label-sm text-label-sm mt-8 max-w-xl border-t border-outline-variant/30 pt-6 text-center text-outline">
            Respectful storytelling: deity · sacred · mythological · cultural · historical figures
            are labeled, never ranked. Rarity describes the edition — never the faith.
          </div>
        </div>
      </section>
    </div>
  );
}
