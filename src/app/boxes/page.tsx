"use client";

import Image from "next/image";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { money } from "@/components/tier-card";
import { cn } from "@/lib/utils";

const ODDS_BAR = [
  { key: "common", label: "COM", color: "bg-rarity-common", text: "text-rarity-common" },
  { key: "rare", label: "RARE", color: "bg-rarity-rare", text: "text-rarity-rare" },
  { key: "epic", label: "EPIC", color: "bg-rarity-epic", text: "text-rarity-epic" },
  { key: "legendary", label: "LEG", color: "bg-rarity-legendary", text: "text-rarity-legendary" },
  { key: "ultrarare", label: "ULTRA", color: "bg-rarity-mythic", text: "text-rarity-mythic" },
] as const;

function OddsSpectrum({
  odds,
  note,
  bold,
}: {
  odds: Record<string, number>;
  note: string;
  bold?: boolean;
}) {
  return (
    <div className="mt-space-md flex flex-col gap-1.5">
      <div className="font-label-sm text-label-sm flex items-center justify-between tracking-wider text-outline uppercase">
        <span>Rarity Dispersal Odds</span>
        <span className={cn("text-gold-radiant", bold && "font-bold")}>{note}</span>
      </div>
      <div className="flex h-3 w-full overflow-hidden rounded bg-surface-container-lowest shadow-inner">
        {ODDS_BAR.map((b) => (
          <div
            key={b.key}
            className={cn(b.color, "h-full")}
            style={{ width: `${odds[b.key]}%` }}
            title={`${b.label}: ${odds[b.key]}%`}
          />
        ))}
      </div>
      <div className="grid grid-cols-5 gap-1 pt-1 text-center">
        {ODDS_BAR.map((b) => (
          <div key={b.key} className="flex flex-col">
            <span className={cn("font-label-sm text-label-sm", b.text, bold && "font-bold")}>
              {odds[b.key]}%
            </span>
            <span className="font-label-sm text-label-sm text-outline-variant">{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BoxesPage() {
  const { db } = useStore();
  const tiers = db.tiers;

  return (
    <div className="pb-10 text-on-surface">
      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-[1280px] px-gutter pt-space-lg pb-space-xl text-center">
        <div className="font-label-sm text-label-sm mb-space-sm inline-flex items-center gap-space-xs rounded-full bg-surface-container-high px-3 py-1 text-gold-radiant uppercase shadow-md">
          <span className="material-symbols-outlined text-sm text-gold-burnished">lock</span>
          <span>The Vault: Mystery Vessels</span>
          <span className="text-outline-variant">•</span>
          <span className="text-parchment-muted">Lexicon Edition 2026</span>
        </div>
        <h2 className="font-display-hero text-display-hero mx-auto mt-space-xs max-w-4xl leading-tight tracking-tight text-parchment-text">
          Sealed Vessels of{" "}
          <span className="bg-gradient-to-r from-gold-radiant via-primary to-ember-glow bg-clip-text text-transparent">
            Arcane Fortune
          </span>
        </h2>
        <p className="font-body-lg text-body-lg mx-auto mt-space-md max-w-2xl text-on-surface-variant">
          You select <span className="font-semibold text-gold-radiant">only the tier</span>.
          Characters, sacred folios, cards, consecrated relics, and sculptures are
          sealed and weighted by the live Controlled Random Mystery Engine.
        </p>
        <div className="mt-space-lg flex flex-wrap items-center justify-center gap-space-md">
          <div className="flex items-center gap-2 rounded-lg bg-surface-container-low px-3 py-1.5 text-on-surface">
            <span className="material-symbols-outlined text-base text-gold-radiant">
              verified_user
            </span>
            <span className="font-label-md text-label-md text-parchment-text">
              Cryptographically Balanced
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-surface-container-low px-3 py-1.5 text-on-surface">
            <span className="material-symbols-outlined text-base text-secondary">shuffle</span>
            <span className="font-label-md text-label-md text-parchment-text">
              Zero Duplicate Collisions
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-surface-container-low px-3 py-1.5 text-on-surface">
            <span className="material-symbols-outlined text-base text-rarity-epic">
              auto_fix_high
            </span>
            <span className="font-label-md text-label-md text-parchment-text">
              Dynamic Realm Re-weighting
            </span>
          </div>
        </div>
      </section>

      {/* 3 Detailed Tier Cards Bento Section */}
      <section className="mx-auto max-w-[1280px] px-gutter pb-space-xl">
        <div className="grid grid-cols-1 items-stretch gap-space-lg lg:grid-cols-3">
          {/* CARD 1: Regular Box */}
          <div className="group relative flex flex-col justify-between rounded-xl bg-surface-midnight p-space-lg shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-b from-surface-container-high/40 to-transparent" />
            <div className="relative z-10 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm tracking-widest text-parchment-muted uppercase">
                  Tier I Sealed Casket
                </span>
                <span className="font-label-sm text-label-sm rounded bg-surface-container-high px-2.5 py-0.5 text-parchment-muted uppercase">
                  Standard Sigil
                </span>
              </div>
              <div className="relative my-space-md h-44 w-full overflow-hidden rounded-lg bg-surface-container-lowest shadow-md">
                <Image
                  src="/stitch/regular-box.jpg"
                  alt="A weathered dark obsidian chest adorned with faint carved mystic runes and subtle brass corners resting atop an ancient altar"
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-midnight via-transparent to-transparent" />
                <div className="absolute bottom-2 left-3 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-secondary">
                    menu_book
                  </span>
                  <span className="font-label-sm text-label-sm font-semibold text-parchment-text uppercase">
                    1 Tome Guaranteed
                  </span>
                </div>
              </div>
              <div className="mt-space-xs flex items-baseline justify-between">
                <h3 className="font-headline-md text-headline-md font-bold text-parchment-text">
                  Regular Box
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="font-display-hero text-headline-lg font-bold text-gold-radiant">
                    {money(tiers.regular.price)}
                  </span>
                  <span className="font-label-sm text-label-sm text-parchment-muted uppercase">
                    / vessel
                  </span>
                </div>
              </div>
              <p className="font-body-md text-body-md mt-space-xs text-on-surface-variant">
                The foundational unboxing initiation. Encapsulates 1 authentic
                Mystery Book, 2 character lore cards, consecrated bookmark, 1
                surprise artifact, and an engine bonus.
              </p>
              <div className="mt-space-md space-y-2 rounded-lg bg-surface-container-low/70 px-space-sm py-space-sm">
                {[
                  "1 Mystery Softcover/Hardcover Tome",
                  "2 Illustrated Archetype Cards",
                  "Archival Bookmark & Surprising Relic",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-on-surface">
                    <span className="material-symbols-outlined text-sm text-gold-burnished">
                      check_circle
                    </span>
                    <span className="font-body-sm text-body-sm text-parchment-text">{f}</span>
                  </div>
                ))}
              </div>
              <OddsSpectrum odds={tiers.regular.odds} note="Verified Probabilities" />
            </div>
            <div className="relative z-10 mt-space-md border-t border-surface-container-high/40 pt-space-lg">
              <p className="font-body-sm text-body-sm mb-space-sm text-center text-parchment-muted italic">
                “Same tier, different fate — two buyers never draw the same hand.”
              </p>
              <div className="flex flex-col gap-2">
                <Link
                  href="/checkout/regular"
                  className="font-label-md text-label-md w-full rounded-lg bg-surface-container-high px-4 py-3 text-center font-bold tracking-wider text-parchment-text uppercase transition-all hover:bg-gold-burnished hover:text-on-primary"
                >
                  Claim Regular Tier
                </Link>
                <Link
                  href="/unbox"
                  className="font-label-sm text-label-sm w-full px-3 py-2 text-center tracking-wider text-outline uppercase transition-colors hover:text-gold-radiant"
                >
                  Inspect Simulator Roll →
                </Link>
              </div>
            </div>
          </div>

          {/* CARD 2: Medium Box (MOST POPULAR) */}
          <div className="group relative flex flex-col justify-between rounded-xl bg-surface-vault p-space-lg shadow-[0_16px_40px_-10px_rgba(212,175,55,0.25)] transition-all duration-300 hover:-translate-y-2 lg:-mt-4 -mt-2">
            <div className="font-label-sm text-label-sm absolute -top-3.5 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-gradient-to-r from-gold-burnished via-gold-radiant to-primary-container px-4 py-1 font-bold whitespace-nowrap text-on-primary uppercase shadow-md">
              <span className="material-symbols-outlined text-sm">star</span>
              <span>Most Coveted Vessel</span>
            </div>
            <div className="relative z-10 flex flex-col pt-1">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm font-semibold tracking-widest text-gold-radiant uppercase">
                  Tier II Reliquary
                </span>
                <span className="font-label-sm text-label-sm rounded bg-primary/20 px-2.5 py-0.5 font-bold text-gold-radiant uppercase">
                  Sculpted Artifact
                </span>
              </div>
              <div className="relative my-space-md h-44 w-full overflow-hidden rounded-lg bg-surface-container-lowest shadow-lg">
                <Image
                  src="/stitch/medium-box.jpg"
                  alt="An ornate gilded wooden reliquary box glowing with warm golden ambient light, intricate filigree metal corners"
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-vault via-transparent to-transparent" />
                <div className="absolute bottom-2 left-3 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-gold-radiant">trophy</span>
                  <span className="font-label-sm text-label-sm font-bold text-gold-radiant uppercase">
                    1 Cast Figurine Included
                  </span>
                </div>
              </div>
              <div className="mt-space-xs flex items-baseline justify-between">
                <h3 className="font-headline-md text-headline-md font-bold text-gold-radiant">
                  Medium Box
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="font-display-hero text-headline-lg font-bold text-gold-radiant">
                    {money(tiers.medium.price)}
                  </span>
                  <span className="font-label-sm text-label-sm text-parchment-muted uppercase">
                    / vessel
                  </span>
                </div>
              </div>
              <p className="font-body-md text-body-md mt-space-xs text-on-surface-variant">
                The premier seeker&apos;s standard. Imbued with 1 Mystery Book, 4
                archetypal cards, 1 handcrafted sculpted collectible, gallery art
                print, ribbon bookmark, micro-lore scroll, and 2 surprises.
              </p>
              <div className="mt-space-md space-y-2 rounded-lg bg-surface-container-high/80 px-space-sm py-space-sm shadow-inner">
                {[
                  "1 Handcrafted Sculpted Figure",
                  "4 Foil-Tipped Story Archetype Cards",
                  "Archival Art Print + Mini Narrative Scroll",
                ].map((f, i) => (
                  <div key={f} className="flex items-center gap-2 text-on-surface">
                    <span className="material-symbols-outlined text-sm text-gold-radiant">
                      verified
                    </span>
                    <span
                      className={cn(
                        "font-body-sm text-body-sm text-parchment-text",
                        i === 0 && "font-medium"
                      )}
                    >
                      {f}
                    </span>
                  </div>
                ))}
              </div>
              <OddsSpectrum odds={tiers.medium.odds} note="+2.4x Legendary Spike" bold />
            </div>
            <div className="relative z-10 mt-space-md border-t border-gold-burnished/20 pt-space-lg">
              <p className="font-body-sm text-body-sm mb-space-sm text-center text-parchment-muted italic">
                “Sealed under the primary ledger. Guaranteed tangible figurine in
                every casket.”
              </p>
              <div className="flex flex-col gap-2">
                <Link
                  href="/checkout/medium"
                  className="font-label-md text-label-md w-full rounded-lg bg-gradient-to-b from-primary-container via-gold-burnished to-primary px-4 py-3.5 text-center font-bold tracking-wider text-on-primary uppercase shadow-md transition-all hover:brightness-110"
                >
                  Summon Medium Box
                </Link>
                <Link
                  href="/unbox"
                  className="font-label-sm text-label-sm flex w-full items-center justify-center gap-1 px-3 py-2 text-center tracking-wider text-gold-radiant uppercase transition-colors hover:underline"
                >
                  <span className="material-symbols-outlined text-sm">casino</span> Test Odds In
                  Simulator
                </Link>
              </div>
            </div>
          </div>

          {/* CARD 3: Premium Box */}
          <div className="group relative flex flex-col justify-between rounded-xl bg-surface-midnight p-space-lg shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-rarity-epic/10 via-transparent to-rarity-mythic/10" />
            <div className="relative z-10 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm font-semibold tracking-widest text-rarity-epic uppercase">
                  Tier III Archival Sanctum
                </span>
                <span className="font-label-sm text-label-sm rounded bg-rarity-epic/20 px-2.5 py-0.5 font-bold text-rarity-epic uppercase">
                  Grand Masterwork
                </span>
              </div>
              <div className="relative my-space-md h-44 w-full overflow-hidden rounded-lg bg-surface-container-lowest shadow-md">
                <Image
                  src="/stitch/premium-box.jpg"
                  alt="A grand deluxe collector chest forged with dark wrought iron, deep violet amethyst crystals glowing on the seal"
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-midnight via-transparent to-transparent" />
                <div className="absolute bottom-2 left-3 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-rarity-epic">
                    auto_awesome
                  </span>
                  <span className="font-label-sm text-label-sm font-bold text-rarity-epic uppercase">
                    2 Heavy Metal/Stone Relics
                  </span>
                </div>
              </div>
              <div className="mt-space-xs flex items-baseline justify-between">
                <h3 className="font-headline-md text-headline-md font-bold text-parchment-text">
                  Premium Box
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="font-display-hero text-headline-lg font-bold text-rarity-epic">
                    {money(tiers.premium.price)}
                  </span>
                  <span className="font-label-sm text-label-sm text-parchment-muted uppercase">
                    / vessel
                  </span>
                </div>
              </div>
              <p className="font-body-md text-body-md mt-space-xs text-on-surface-variant">
                The high-tier ceremonial sanctum. Unveils a Deluxe Leatherette
                Bound Mystery Volume, 6 gold gilded cards, 2 heavy stone/metal
                sculptures, deluxe portfolio, and heightened Ultra-Rare affinity.
              </p>
              <div className="mt-space-md space-y-2 rounded-lg bg-surface-container-low/70 px-space-sm py-space-sm">
                {[
                  "Deluxe Leatherette Binding Book",
                  "2 Heavy Stone or Cold-Cast Totems",
                  "6 Gold Trim Cards + Masterwork Portfolio",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-on-surface">
                    <span className="material-symbols-outlined text-sm text-rarity-epic">stars</span>
                    <span className="font-body-sm text-body-sm text-parchment-text">{f}</span>
                  </div>
                ))}
              </div>
              <OddsSpectrum odds={tiers.premium.odds} note="4.0% Mythic Threshold" bold />
            </div>
            <div className="relative z-10 mt-space-md border-t border-surface-container-high/40 pt-space-lg">
              <p className="font-body-sm text-body-sm mb-space-sm text-center text-parchment-muted italic">
                “Maximum potency. Common chance compressed down to a mere 20%.”
              </p>
              <div className="flex flex-col gap-2">
                <Link
                  href="/checkout/premium"
                  className="font-label-md text-label-md w-full rounded-lg bg-surface-container-high px-4 py-3 text-center font-bold tracking-wider text-rarity-epic uppercase shadow transition-all hover:bg-rarity-epic hover:text-on-primary"
                >
                  Claim Ultimate Ritual
                </Link>
                <Link
                  href="/unbox"
                  className="font-label-sm text-label-sm w-full px-3 py-2 text-center tracking-wider text-outline uppercase transition-colors hover:text-rarity-epic"
                >
                  Inspect Simulator Roll →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Arcane Engine Transparency & Fairness Core */}
      <section className="mx-auto max-w-[1280px] px-gutter py-space-xl">
        <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-xl shadow-2xl">
          <div className="pointer-events-none absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-primary/5 blur-[100px]" />
          <div className="relative z-10 grid grid-cols-1 items-center gap-space-lg lg:grid-cols-12">
            <div className="flex flex-col gap-space-sm lg:col-span-5">
              <div className="font-label-sm text-label-sm flex items-center gap-2 tracking-widest text-gold-burnished uppercase">
                <span className="material-symbols-outlined text-base">balance</span>
                <span>Ceremonial Covenant</span>
              </div>
              <h3 className="font-headline-lg text-headline-lg leading-tight text-parchment-text">
                Fairness Engine &amp; Cryptographic Odds
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Every drop event within The Wish Society is governed by our open
                seed allocation protocol. Rarity reflects authentic edition
                scarcity — never cultural worth or religious rank.
              </p>
              <div className="mt-space-xs flex items-start gap-space-sm rounded-lg bg-surface-container-low p-space-md text-on-surface">
                <span className="material-symbols-outlined mt-0.5 text-xl text-gold-radiant">
                  menu_book
                </span>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md font-bold text-parchment-text uppercase">
                    Respectful Cultural Sanctity
                  </span>
                  <span className="font-body-sm text-body-sm mt-1 text-parchment-muted">
                    Deity, mythological, and historical archetypes are honored and
                    categorized, never ranked into hierarchy. Rarity badges apply
                    solely to the manufacturing run.
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-space-md md:grid-cols-3 lg:col-span-7">
              {[
                {
                  icon: "token",
                  color: "text-secondary",
                  title: "Unbiased Roll Engine",
                  body: "Odds shown apply genuinely per box. Every tier holds potential for high rarity spikes via entropy seeds generated at order sealing.",
                },
                {
                  icon: "inventory_2",
                  color: "text-gold-radiant",
                  title: "No Duplicate Rules",
                  body: "Engine rules dynamically suppress duplicate figurine sculpts within the same tier order. Two buyers in the same realm receive distinct destinies.",
                },
                {
                  icon: "sync_saved_locally",
                  color: "text-rarity-epic",
                  title: "Live Re-weighting",
                  body: "Sanctuary inventories track in real-time. If a limited relic batch exhausts, weight pools redistribute instantly to preserve declared odds.",
                },
              ].map((c) => (
                <div
                  key={c.title}
                  className="flex flex-col gap-2 rounded-lg bg-surface-midnight p-space-md shadow-sm"
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high",
                      c.color
                    )}
                  >
                    <span className="material-symbols-outlined text-xl">{c.icon}</span>
                  </div>
                  <h4 className="font-title-lg text-title-lg font-bold text-parchment-text">
                    {c.title}
                  </h4>
                  <p className="font-body-sm text-body-sm text-parchment-muted">{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Unboxing Comparison Matrix Section */}
      <section className="mx-auto max-w-[1280px] px-gutter pb-space-xl">
        <div className="mx-auto mb-space-lg max-w-2xl text-center">
          <span className="font-label-sm text-label-sm tracking-widest text-gold-burnished uppercase">
            Lexicon Cross-Reference
          </span>
          <h3 className="font-headline-lg text-headline-lg mt-1 text-parchment-text">
            Tier Matrix &amp; Guaranteed Contents
          </h3>
          <p className="font-body-md text-body-md mt-2 text-on-surface-variant">
            Compare the exact guaranteed physical artifacts, lore scrolls, and
            probability thresholds embedded inside each ritual grade.
          </p>
        </div>
        <div className="w-full overflow-x-auto rounded-xl bg-surface-midnight p-space-md shadow-2xl">
          <table className="w-full min-w-[700px] border-collapse text-left">
            <thead>
              <tr className="border-b border-surface-container-high">
                <th className="font-label-md text-label-md px-4 py-4 tracking-wider text-outline uppercase">
                  Contents &amp; Attributes
                </th>
                <th className="font-label-md text-label-md px-4 py-4 text-center tracking-wider text-parchment-text uppercase">
                  Regular Tier ({money(tiers.regular.price)})
                </th>
                <th className="font-label-md text-label-md rounded-t-lg bg-surface-vault/60 px-4 py-4 text-center tracking-wider text-gold-radiant uppercase">
                  Medium Tier ({money(tiers.medium.price)})
                </th>
                <th className="font-label-md text-label-md px-4 py-4 text-center tracking-wider text-rarity-epic uppercase">
                  Premium Tier ({money(tiers.premium.price)})
                </th>
              </tr>
            </thead>
            <tbody className="font-body-md text-body-md divide-y divide-surface-container-high/40">
              <MatrixRow
                icon="auto_stories"
                label="Mystery Book Edition"
                cells={[
                  "Standard Curated Tome",
                  "Deluxe Illustrated Tome",
                  "Faux-Leatherette Collector's Folio",
                ]}
              />
              <MatrixRow
                icon="style"
                label="Character & Story Cards"
                cells={["2 Cards", "4 Cards (Foil Gilt)", "6 Cards (Gold Embossed)"]}
              />
              <MatrixRow
                icon="qr_code_2"
                label="Sculpted Character Collectibles"
                cells={[
                  "Chance Drop Only",
                  "1 Guaranteed Cast Figure",
                  "2 Heavy Stone/Metal Statuettes",
                ]}
              />
              <MatrixRow
                icon="palette"
                label="Art Prints & Portfolios"
                cells={[
                  "—",
                  "1 Archival Matte Print",
                  "Masterwork Art Portfolio (3+ Sheets)",
                ]}
              />
              <MatrixRow
                icon="bookmark"
                label="Relic Accessories"
                cells={[
                  "Bookmark + Surprise Relic",
                  "Bookmark + Micro-Story + Surprise",
                  "Curator Reliquary + Wax Seal + Bonus",
                ]}
              />
              <tr className="transition-colors hover:bg-surface-container-high/20">
                <td className="flex items-center gap-2 px-4 py-3.5 font-medium text-parchment-text">
                  <span className="material-symbols-outlined text-base text-gold-burnished">
                    casino
                  </span>
                  <span>Ultra-Rare (Mythic) Odds</span>
                </td>
                <td className="font-label-md text-label-md px-4 py-3.5 text-center text-parchment-muted">
                  {tiers.regular.odds.ultrarare}%
                </td>
                <td className="font-label-md text-label-md bg-surface-vault/30 px-4 py-3.5 text-center font-bold text-gold-radiant">
                  {tiers.medium.odds.ultrarare}% (2x)
                </td>
                <td className="font-label-md text-label-md px-4 py-3.5 text-center font-bold text-rarity-epic">
                  {tiers.premium.odds.ultrarare}% (8x Surge)
                </td>
              </tr>
              <MatrixRow
                icon="inventory"
                label="Packaging Architecture"
                cells={[
                  "Archival Sealed Mailer",
                  "Rigid Gilded Storage Box",
                  "Velvet-Lined Wooden Vault Casket",
                ]}
              />
              <tr>
                <td className="px-4 py-4 font-medium text-parchment-text">Select Vessel</td>
                <td className="px-4 py-4 text-center">
                  <Link
                    href="/checkout/regular"
                    className="font-label-sm text-label-sm inline-block rounded bg-surface-container-high px-4 py-2 font-bold tracking-wider uppercase transition-all hover:bg-gold-burnished hover:text-on-primary"
                  >
                    Choose Regular
                  </Link>
                </td>
                <td className="bg-surface-vault/30 px-4 py-4 text-center">
                  <Link
                    href="/checkout/medium"
                    className="font-label-sm text-label-sm inline-block rounded bg-primary-container px-5 py-2.5 font-bold tracking-wider text-on-primary uppercase shadow-md transition-all hover:brightness-110"
                  >
                    Choose Medium
                  </Link>
                </td>
                <td className="px-4 py-4 text-center">
                  <Link
                    href="/checkout/premium"
                    className="font-label-sm text-label-sm inline-block rounded bg-rarity-epic/20 px-4 py-2 font-bold tracking-wider text-rarity-epic uppercase transition-all hover:bg-rarity-epic hover:text-on-primary"
                  >
                    Choose Premium
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Cultural Sanctity Callout */}
      <section className="mx-auto max-w-[1280px] px-gutter pb-space-xl">
        <div className="font-label-md text-label-md flex flex-col items-center justify-between gap-space-md rounded-lg bg-surface-container p-space-md text-center md:flex-row">
          <div className="flex items-center gap-3 text-left">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-vault text-gold-radiant">
              <span className="material-symbols-outlined text-xl">shield</span>
            </div>
            <div>
              <h5 className="font-title-lg text-title-lg text-parchment-text">
                Covenant of Sanctity
              </h5>
              <p className="font-body-sm text-body-sm text-parchment-muted">
                All artifacts and lore items honor historical mythos. No spiritual
                pantheon is reduced to a commercial hierarchy.
              </p>
            </div>
          </div>
          <Link
            href="/about"
            className="font-label-md text-label-md inline-flex shrink-0 items-center gap-1 tracking-wider text-gold-radiant uppercase hover:underline"
          >
            Read Sanctity Manifesto{" "}
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
      </section>

      {/* Persistent Floating Interactive CTA Dock */}
      <aside className="fixed bottom-6 left-1/2 z-40 flex w-[92%] max-w-xl -translate-x-1/2 items-center justify-between rounded-full bg-surface-container-lowest/95 px-4 py-3 shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-md sm:w-auto sm:gap-6">
        <div className="flex items-center gap-2.5 pl-2">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-radiant opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-gold-burnished" />
          </span>
          <div className="flex flex-col text-left">
            <span className="font-label-sm text-label-sm font-bold tracking-wider text-parchment-text uppercase">
              Engine Live
            </span>
            <span className="font-label-sm text-label-sm hidden text-outline sm:inline">
              98.4% Seed Pool Ready
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/unbox"
            className="font-label-sm text-label-sm flex items-center gap-1 rounded-full bg-surface-container-high px-4 py-2 tracking-wider text-gold-radiant uppercase transition-all hover:bg-surface-vault"
          >
            <span className="material-symbols-outlined text-sm">casino</span>
            <span>Free Demo</span>
          </Link>
          <Link
            href="#"
            className="font-label-sm text-label-sm flex items-center gap-1 rounded-full bg-gradient-to-r from-primary-container to-gold-burnished px-5 py-2 font-bold tracking-wider text-on-primary uppercase shadow-[0_2px_12px_rgba(212,175,55,0.4)] hover:brightness-110"
          >
            <span>Summon Vessel</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
      </aside>
    </div>
  );
}

function MatrixRow({
  icon,
  label,
  cells,
}: {
  icon: string;
  label: string;
  cells: [string, string, string];
}) {
  return (
    <tr className="transition-colors hover:bg-surface-container-high/20">
      <td className="flex items-center gap-2 px-4 py-3.5 font-medium text-parchment-text">
        <span className="material-symbols-outlined text-base text-gold-burnished">{icon}</span>
        <span>{label}</span>
      </td>
      <td className="px-4 py-3.5 text-center text-on-surface-variant">{cells[0]}</td>
      <td className="bg-surface-vault/30 px-4 py-3.5 text-center font-semibold text-gold-radiant">
        {cells[1]}
      </td>
      <td className="px-4 py-3.5 text-center font-bold text-parchment-text">{cells[2]}</td>
    </tr>
  );
}
