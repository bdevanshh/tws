"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { charOf, nextStatus, useStore } from "@/lib/store";
import type { Order, OrderStatus, Rarity } from "@/lib/types";
import { money } from "@/components/tier-card";
import { cn } from "@/lib/utils";

type TabId = "orders" | "books" | "collection" | "wishes" | "settings";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "orders", label: "Active Orders & Dispatch", icon: "local_shipping" },
  { id: "books", label: "Digital Grimoire Bookshelf", icon: "menu_book" },
  { id: "collection", label: "Card & Relic Binder", icon: "collections_bookmark" },
  { id: "wishes", label: "Your Sealed Wishes", icon: "auto_stories" },
  { id: "settings", label: "Sanctum Settings", icon: "tune" },
];

const FLOW: { id: OrderStatus; step: string; sub: string; icon: string }[] = [
  { id: "paid", step: "Manifested in Wax", sub: "Archive Sanctuary IX", icon: "check" },
  { id: "packing", step: "Controlled Engine", sub: "Fairness Key Bound", icon: "check" },
  { id: "shipped", step: "Sealed Courier", sub: "In Transit to Sanctum", icon: "navigation" },
  { id: "delivered", step: "Awaiting Your Hand", sub: "Wax Seal Intact", icon: "lock" },
];

const RARITY_TEXT: Record<Rarity, string> = {
  common: "text-rarity-common",
  rare: "text-rarity-rare",
  epic: "text-rarity-epic",
  legendary: "text-rarity-legendary",
  ultrarare: "text-rarity-mythic",
};

const RARITY_DOT: Record<Rarity, string> = {
  common: "bg-rarity-common shadow-[0_0_6px_#94A3B8]",
  rare: "bg-rarity-rare shadow-[0_0_6px_#38BDF8]",
  epic: "bg-rarity-epic shadow-[0_0_6px_#A855F7]",
  legendary: "bg-rarity-legendary shadow-[0_0_6px_#F59E0B]",
  ultrarare: "bg-rarity-mythic shadow-[0_0_6px_#EC4899]",
};

const RARITY_WORD: Record<Rarity, string> = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
  ultrarare: "Ultra Rare",
};

function sealNo(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 9000;
  return `${1000 + h}-VEIL`;
}

function tierRoman(tier?: string) {
  if (tier === "regular") return "T-I";
  if (tier === "medium") return "T-II";
  if (tier === "premium") return "T-III";
  return "T-0";
}

export default function AccountPage() {
  const { db, user, patch } = useStore();
  const [tab, setTab] = useState<TabId>("orders");

  if (!user) {
    return (
      <div className="mx-auto max-w-lg py-10 text-on-surface">
        <div className="rounded-xl bg-surface-midnight p-8 text-center shadow-xl">
          <span className="material-symbols-outlined mx-auto text-[32px] text-gold-radiant">
            lock
          </span>
          <h2 className="font-headline-md text-headline-md mt-3 text-parchment-text">
            Login required
          </h2>
          <p className="font-body-md text-body-md mt-1 text-parchment-muted">
            Track orders, read digital books and submit wishes.
          </p>
          <Link
            href="/auth"
            className="font-label-md text-label-md mt-5 inline-block rounded-lg bg-gradient-to-b from-primary-container to-gold-burnished px-6 py-3 font-bold tracking-wider text-on-primary uppercase"
          >
            Login / Register
          </Link>
        </div>
      </div>
    );
  }

  const orders = db.orders.filter((o) => o.userId === user.id);
  const sealed = orders.filter((o) => o.status !== "delivered");
  const delivered = orders.filter((o) => o.status === "delivered");
  const wishes = db.wishes.filter((w) => w.userId === user.id);
  const collected = delivered.flatMap((o) =>
    o.box.cards.map((c, i) => ({ ...c, order: o.id, idx: i }))
  );
  const latestTier = orders[0]?.tier;
  const active = sealed[0] ?? orders[0] ?? null;

  const advance = (id: string) => {
    patch((d) => {
      const o = d.orders.find((x) => x.id === id);
      if (!o) return d;
      o.status = nextStatus(o.status);
      if (o.status === "delivered") o.revealed = true;
      return d;
    });
    const o = db.orders.find((x) => x.id === id);
    const ns = o ? nextStatus(o.status) : "delivered";
    toast.success(
      ns === "delivered"
        ? "📦 Delivered! Mystery revealed — open your book!"
        : `Order ${id} → ${ns}`
    );
  };

  return (
    <div className="pb-10 text-on-surface">
      {/* Seeker identity header */}
      <div className="relative z-10 mx-auto max-w-[1280px] px-gutter">
        <div className="relative flex flex-col items-start justify-between gap-space-lg rounded-xl bg-surface-midnight/90 p-space-lg shadow-xl backdrop-blur-md">
          <div className="absolute top-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-gold-burnished/50 to-transparent" />
          <div className="flex min-w-0 items-center gap-space-md">
            <div className="relative flex-shrink-0">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-vault p-1 shadow-lg shadow-gold-burnished/20">
                <div className="font-headline-md text-headline-md flex h-full w-full items-center justify-center rounded-full bg-surface-container-high text-gold-radiant">
                  <span>{user.name.charAt(0).toUpperCase()}</span>
                </div>
              </div>
              <div className="absolute -right-1 -bottom-1 rounded-full bg-surface-container-lowest px-2 py-0.5 shadow-md">
                <span className="font-label-sm text-label-sm font-bold tracking-widest text-gold-radiant uppercase">
                  {tierRoman(latestTier)}
                </span>
              </div>
            </div>
            <div className="flex min-w-0 flex-col">
              <div className="flex flex-wrap items-center gap-space-xs">
                <h1 className="font-headline-md text-headline-md truncate tracking-wide text-parchment-text">
                  {user.name}
                </h1>
                <span className="font-label-sm text-label-sm rounded-full bg-surface-vault px-2 py-0.5 tracking-widest text-gold-radiant uppercase">
                  {latestTier ? `Initiate Tier ${latestTier === "regular" ? "I" : latestTier === "medium" ? "II" : "III"}` : "Uninitiated Seeker"}
                </span>
              </div>
              <div className="font-label-sm text-label-sm mt-1 flex flex-wrap items-center gap-space-md tracking-wider text-parchment-muted uppercase">
                <span className="flex items-center gap-1 text-gold-burnished">
                  <span className="material-symbols-outlined text-[14px]">vpn_key</span>
                  Sanctum Seal #{sealNo(user.id)}
                </span>
                <span className="text-outline-variant">•</span>
                <span className="flex items-center gap-1 text-parchment-muted">
                  <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                  {user.joined}
                </span>
                <span className="text-outline-variant">•</span>
                <span className="font-medium text-secondary">Lexicon Verified Seeker</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-space-xs self-stretch md:self-auto">
            <button
              onClick={() => toast.success("Sanctuary Oath renewed — the vault recognizes you.")}
              className="font-label-md text-label-md flex items-center gap-2 rounded-lg bg-surface-vault px-4 py-2.5 tracking-wider text-parchment-text shadow-md transition-all hover:text-gold-radiant"
            >
              <span className="material-symbols-outlined text-[16px] text-gold-burnished">
                shield_with_heart
              </span>
              Sanctuary Oath
            </button>
            <Link
              href="/boxes"
              className="font-label-md text-label-md flex items-center gap-2 rounded-lg bg-gradient-to-b from-primary-container to-gold-burnished px-4 py-2.5 font-bold tracking-wider text-on-primary shadow-md transition-all hover:brightness-110"
            >
              <span className="material-symbols-outlined text-[16px]">add_box</span>
              Summon Box
            </Link>
          </div>
        </div>

        {/* Stat strip */}
        <div className="mt-space-md grid grid-cols-2 gap-space-md md:grid-cols-4">
          <StatCard icon="inventory_2" iconColor="text-gold-radiant" value={String(delivered.length)} label="Boxes Opened" />
          <div className="group relative flex items-center gap-space-sm overflow-hidden rounded-lg bg-surface-midnight/70 p-space-md shadow-md backdrop-blur-sm transition-colors hover:bg-surface-midnight">
            <div className="absolute top-0 right-0 bottom-0 w-1 bg-amber-500/60" />
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-surface-vault text-rarity-legendary transition-transform group-hover:scale-105">
              <span className="material-symbols-outlined text-[24px]">mark_email_read</span>
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="font-headline-sm text-headline-sm flex items-center gap-2 leading-none font-bold text-gold-radiant">
                {sealed.length}
                {sealed.length > 0 && (
                  <span className="h-2 w-2 animate-pulse rounded-full bg-ember-glow" />
                )}
              </span>
              <span className="font-label-sm text-label-sm mt-1 truncate tracking-wider text-parchment-muted uppercase">
                In Transit (Veiled)
              </span>
            </div>
          </div>
          <StatCard icon="style" iconColor="text-rarity-rare" value={String(collected.length)} label="Artifact Cards" />
          <StatCard icon="history_edu" iconColor="text-rarity-mythic" value={String(wishes.length)} label="Wish Preserved" />
        </div>
      </div>

      {/* Sticky tab bar */}
      <div className="sticky top-20 z-40 mt-space-md w-full bg-surface-container-low shadow-sm">
        <div className="mx-auto flex max-w-[1280px] items-center gap-space-sm overflow-x-auto px-gutter py-2.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "font-label-md text-label-md flex flex-shrink-0 items-center gap-2 rounded-lg px-4 py-2 tracking-wider whitespace-nowrap transition-all",
                tab === t.id
                  ? "bg-surface-vault text-gold-radiant shadow-sm"
                  : "text-parchment-muted hover:bg-surface-midnight hover:text-parchment-text"
              )}
            >
              <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-space-xl px-gutter py-space-xl">
        {tab === "orders" && (
          <section className="flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <div className="h-3 w-3 rotate-45 bg-gold-burnished" />
                <h2 className="font-headline-sm text-headline-sm tracking-wider text-parchment-text uppercase">
                  Active Consecrated Shipment
                </h2>
              </div>
              {active && (
                <span className="font-label-sm text-label-sm flex items-center gap-1.5 rounded-full bg-surface-vault px-3 py-1 tracking-widest text-gold-radiant uppercase shadow-sm">
                  <span className="h-1.5 w-1.5 animate-ping rounded-full bg-rarity-legendary" />
                  Seal Active #{active.id}
                </span>
              )}
            </div>
            {active ? (
              <ShipmentCard order={active} onAdvance={() => advance(active.id)} />
            ) : (
              <div className="rounded-xl bg-surface-midnight p-8 text-center shadow-xl">
                <p className="font-body-md text-body-md text-parchment-muted">
                  No consecrated shipments yet — your sealed vessels will manifest here.
                </p>
                <Link
                  href="/boxes"
                  className="font-label-md text-label-md mt-4 inline-block rounded-lg bg-gradient-to-b from-primary-container to-gold-burnished px-6 py-3 font-bold tracking-wider text-on-primary uppercase"
                >
                  Choose a box →
                </Link>
              </div>
            )}
            {orders.length > 1 && (
              <div className="flex flex-col gap-3">
                {orders.slice(1).map((o) => (
                  <ShipmentCard key={o.id} order={o} onAdvance={() => advance(o.id)} compact />
                ))}
              </div>
            )}
          </section>
        )}

        {tab === "books" && (
          <section className="flex flex-col gap-space-md">
            <SectionHead
              gem="bg-secondary-container"
              title="Digital Grimoire Bookshelf"
              sub="Your unlocked library of illustrated chronicles. Sealed orders cannot be peeked."
            />
            {delivered.length ? (
              <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2 lg:grid-cols-3">
                {delivered.map((o) => {
                  const ch = charOf(db, o.box.character.id);
                  return (
                    <div
                      key={o.id}
                      className="rounded-xl bg-surface-midnight p-6 shadow-xl transition-all hover:-translate-y-1"
                    >
                      <div className="text-4xl">{ch?.emoji ?? "📖"}</div>
                      <div className="font-title-lg text-title-lg mt-2 font-bold text-parchment-text">
                        {o.box.story.title}
                      </div>
                      <div className="font-body-sm text-body-sm text-parchment-muted">
                        {ch?.name} · {o.id}
                      </div>
                      <Link
                        href={`/book/${o.id}`}
                        className="font-label-md text-label-md mt-3 inline-block rounded-lg bg-gradient-to-b from-primary-container to-gold-burnished px-4 py-2 font-bold tracking-wider text-on-primary uppercase"
                      >
                        Read book →
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyPanel
                title="Shelf's empty — for now"
                body="Your bookshelf unlocks on delivery. Sealed orders can't be peeked."
              />
            )}
          </section>
        )}

        {tab === "collection" && (
          <section className="flex flex-col gap-space-md">
            <div className="flex flex-col justify-between gap-space-sm md:flex-row md:items-center">
              <div className="flex items-center gap-space-sm">
                <div className="h-3 w-3 rotate-45 bg-secondary-container" />
                <div>
                  <h2 className="font-headline-sm text-headline-sm tracking-wider text-parchment-text uppercase">
                    Sanctum Reliquary &amp; Pulled Artifacts
                  </h2>
                  <p className="font-body-sm text-body-sm mt-0.5 text-parchment-muted">
                    All pulled deity, mythological &amp; historical cards. Respectfully
                    labeled, never ranked. Rarity reflects print volume only.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-label-sm text-label-sm flex items-center gap-1 rounded bg-surface-vault px-3 py-1.5 tracking-wider text-parchment-muted uppercase">
                  <span className="material-symbols-outlined text-[16px]">filter_list</span>
                  All Pantheons ({collected.length})
                </span>
                <span className="font-label-sm text-label-sm flex items-center gap-1 rounded bg-surface-vault px-3 py-1.5 tracking-wider text-gold-radiant uppercase">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  NFC Verified
                </span>
              </div>
            </div>
            {collected.length ? (
              <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2 lg:grid-cols-4">
                {collected.map((c, i) => {
                  const ch = charOf(db, c.charId ?? "");
                  const r = (c.sealedRarity ?? c.rarity) as Rarity;
                  return (
                    <div
                      key={`${c.order}-${i}`}
                      className="group relative flex flex-col rounded-xl bg-surface-midnight p-3 shadow-xl transition-all duration-300 hover:-translate-y-1.5"
                    >
                      <div className="relative flex h-80 w-full items-center justify-center overflow-hidden rounded-lg bg-surface-vault shadow-inner">
                        <div className="absolute inset-0 bg-gradient-to-b from-surface-container-high via-surface-vault to-surface-midnight" />
                        <span className="relative z-10 text-7xl drop-shadow-[0_0_24px_rgba(212,175,55,0.35)] transition-transform duration-500 group-hover:scale-110">
                          {ch?.emoji ?? "🃏"}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-t from-surface-midnight via-transparent to-transparent opacity-90" />
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full bg-surface-midnight/80 px-2 py-0.5 backdrop-blur-md">
                          <span className={cn("h-1.5 w-1.5 rounded-full", RARITY_DOT[r])} />
                          <span className={cn("font-label-sm text-label-sm font-bold tracking-widest uppercase", RARITY_TEXT[r])}>
                            {RARITY_WORD[r]}
                          </span>
                        </div>
                        <div className="absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-surface-vault/90 text-gold-radiant shadow-sm backdrop-blur-md" title="Cryptographic Wax Verified">
                          <span className="material-symbols-outlined text-[15px]">verified_user</span>
                        </div>
                        <div className="absolute right-3 bottom-3 left-3 flex flex-col">
                          <span className="font-label-sm text-label-sm tracking-widest text-gold-radiant uppercase">
                            {ch?.tradition ?? "Unknown Pantheon"}
                          </span>
                          <h3 className="font-headline-sm text-headline-sm leading-tight font-bold text-parchment-text drop-shadow-md">
                            {c.name}
                          </h3>
                          <span className="font-body-sm text-body-sm mt-0.5 text-parchment-muted italic">
                            {ch?.category ?? "Relic"} · {c.order}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-surface-container-highest/50 pt-2">
                        <span className="font-label-sm text-label-sm text-parchment-muted uppercase">
                          Card #{String(i + 1).padStart(3, "0")} / Vault Mint
                        </span>
                        <Link
                          href={`/book/${c.order}`}
                          className="font-label-sm text-label-sm flex items-center gap-0.5 tracking-wider text-gold-radiant uppercase hover:text-white"
                        >
                          Inspect
                          <span className="material-symbols-outlined text-[14px]">360</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyPanel
                title="No collectibles yet"
                body="Cards, art and limited editions reveal at unboxing — then live here in your binder."
              />
            )}
          </section>
        )}

        {tab === "wishes" && (
          <section className="flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <div className="h-3 w-3 rotate-45 bg-gold-radiant" />
                <div>
                  <h2 className="font-headline-sm text-headline-sm tracking-wider text-parchment-text uppercase">
                    Physical Wish Card Sanctuary Record
                  </h2>
                  <p className="font-body-sm text-body-sm mt-0.5 text-parchment-muted">
                    Your submitted ceremonial parchment, permanently sealed into the
                    monolithic Hall of Wishes.
                  </p>
                </div>
              </div>
              <span className="font-label-sm text-label-sm flex items-center gap-1.5 rounded-full bg-surface-vault px-3 py-1 tracking-wider text-gold-burnished uppercase shadow-sm">
                <span className="material-symbols-outlined text-[15px]">lock</span>
                Archived &amp; Blessed
              </span>
            </div>
            {wishes.length ? (
              <>
                <WishParchment
                  no={wishes[0].id.slice(-4).toUpperCase()}
                  text={wishes[0].text}
                  author={user.name}
                  status={wishes[0].status}
                />
                {wishes.slice(1).map((w) => (
                  <div key={w.id} className="rounded-xl bg-surface-midnight p-5 shadow-xl">
                    <div className="font-serif text-lg text-parchment-text">“{w.text}”</div>
                    <div className="font-body-sm text-body-sm mt-2 text-parchment-muted">
                      {w.id} · {w.status.toUpperCase()}
                      {w.note ? ` · Note: ${w.note}` : ""}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <EmptyPanel
                title="No wishes sent"
                body="Open a delivered book, write your wish on the YOUR WISH page, and send it to us. Good ones are accepted."
                action={
                  <Link
                    href="/unbox"
                    className="font-label-md text-label-md mt-4 inline-block rounded-lg bg-surface-vault px-5 py-2.5 tracking-wider text-gold-radiant uppercase"
                  >
                    Try the unbox demo →
                  </Link>
                }
              />
            )}
          </section>
        )}

        {tab === "settings" && (
          <section className="flex flex-col gap-space-md">
            <SectionHead
              gem="bg-gold-burnished"
              title="Sanctum Settings"
              sub="Mortal vessel details, sanctuary seal, and preservation preferences."
            />
            <div className="grid grid-cols-1 gap-space-md lg:grid-cols-12">
              <div className="rounded-xl bg-surface-midnight p-6 shadow-xl lg:col-span-7">
                <ProfileForm
                  userId={user.id}
                  initialName={user.name}
                  initialAddress={user.address}
                  joined={user.joined}
                  orderCount={orders.length}
                />
              </div>
              <div className="flex flex-col gap-space-sm lg:col-span-5">
                {[
                  { k: "Sanctuary Vault", v: "Alcove 14-C", vc: "text-gold-radiant" },
                  { k: "Preservation State", v: "Gilded Brass Casket", vc: "text-rarity-rare" },
                  { k: "Blessing Cycle", v: "Eternal Perpetual", vc: "text-parchment-text" },
                ].map((s) => (
                  <div key={s.k} className="flex flex-col rounded-lg bg-surface-vault p-3">
                    <span className="font-label-sm text-label-sm text-parchment-muted uppercase">
                      {s.k}
                    </span>
                    <span className={cn("font-label-md text-label-md mt-1 font-bold", s.vc)}>
                      {s.v}
                    </span>
                  </div>
                ))}
                <button
                  onClick={() => {
                    patch((d) => ({ ...d, session: null }));
                    toast.success("Seal re-applied — signed out of the vault.");
                  }}
                  className="font-label-md text-label-md rounded-lg border border-ember-glow/50 px-4 py-2.5 tracking-wider text-ember-glow uppercase transition-all hover:bg-ember-glow hover:text-on-primary"
                >
                  Seal the vault (sign out)
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  iconColor,
  value,
  label,
}: {
  icon: string;
  iconColor: string;
  value: string;
  label: string;
}) {
  return (
    <div className="group flex items-center gap-space-sm rounded-lg bg-surface-midnight/70 p-space-md shadow-md backdrop-blur-sm transition-colors hover:bg-surface-midnight">
      <div
        className={cn(
          "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-surface-vault transition-transform group-hover:scale-105",
          iconColor
        )}
      >
        <span className="material-symbols-outlined text-[24px]">{icon}</span>
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="font-headline-sm text-headline-sm leading-none font-bold text-parchment-text">
          {value}
        </span>
        <span className="font-label-sm text-label-sm mt-1 truncate tracking-wider text-parchment-muted uppercase">
          {label}
        </span>
      </div>
    </div>
  );
}

function SectionHead({ gem, title, sub }: { gem: string; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-space-sm">
      <div className={cn("h-3 w-3 rotate-45", gem)} />
      <div>
        <h2 className="font-headline-sm text-headline-sm tracking-wider text-parchment-text uppercase">
          {title}
        </h2>
        <p className="font-body-sm text-body-sm mt-0.5 text-parchment-muted">{sub}</p>
      </div>
    </div>
  );
}

function EmptyPanel({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-surface-midnight p-8 text-center shadow-xl">
      <p className="font-title-lg text-title-lg font-bold text-parchment-text">{title}</p>
      <p className="font-body-md text-body-md mx-auto mt-1 max-w-md text-parchment-muted">{body}</p>
      {action}
    </div>
  );
}

function ShipmentCard({
  order,
  onAdvance,
  compact,
}: {
  order: Order;
  onAdvance: () => void;
  compact?: boolean;
}) {
  const { db } = useStore();
  const t = db.tiers[order.tier];
  const sealed = order.status !== "delivered";
  const stepIdx = FLOW.findIndex((x) => x.id === order.status);
  const ch = charOf(db, order.box.character.id);
  const width = `${((stepIdx + 1) / 4) * 100}%`;

  return (
    <div className="relative overflow-hidden rounded-xl bg-surface-midnight p-space-lg shadow-xl">
      <div className="pointer-events-none absolute -right-16 -bottom-16 h-64 w-64 rounded-full bg-gold-burnished/5 blur-3xl" />
      <div className="mb-space-lg flex flex-col items-start justify-between gap-space-lg border-b border-surface-container-highest/40 pb-space-lg lg:flex-row lg:items-center">
        <div className="flex items-start gap-space-md">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-surface-vault shadow-inner">
            <span className="material-symbols-outlined text-[36px] text-gold-radiant">
              markunread_mailbox
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-space-xs">
              <span className="font-title-lg text-title-lg font-bold text-parchment-text">
                {order.id} · {t.name} Vessel · {money(order.price)}
              </span>
              <span className="font-label-sm text-label-sm rounded bg-surface-container-high px-2 py-0.5 tracking-wider text-gold-radiant uppercase">
                Tier {order.tier === "regular" ? "I" : order.tier === "medium" ? "II" : "III"} Curation
              </span>
            </div>
            <p className="font-body-sm text-body-sm mt-1 max-w-xl text-parchment-muted">
              Cryptographically dispersed ritual reliquary. Contents veiled beneath
              unbroken celestial wax until physical unboxing ritual is consummated.
            </p>
          </div>
        </div>
        <div className="flex flex-shrink-0 flex-col items-start rounded-lg bg-surface-container-lowest/80 p-3 shadow-inner lg:items-end">
          <span className="font-label-sm text-label-sm tracking-wider text-outline uppercase">
            Courier Sanctum Tracking
          </span>
          <span className="font-label-md text-label-md mt-0.5 font-bold tracking-widest text-gold-radiant">
            SL-{order.id.replace(/\D/g, "").slice(-6) || "000000"}-DX
          </span>
          <span className="font-body-sm text-body-sm mt-1 text-parchment-muted">
            {sealed ? "Estimated Arrival: Moon Crescent, 3 Days" : "Delivered to your sanctum"}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-space-sm">
        <div className="font-label-sm text-label-sm mb-2 flex items-center justify-between tracking-wider text-parchment-muted uppercase">
          <span>Ritual Courier Transit Path</span>
          <span className="font-bold text-gold-radiant">
            Step {stepIdx + 1} of 4: {stepIdx === 2 ? "In Royal Transit" : FLOW[stepIdx].step}
          </span>
        </div>
        <div className="relative w-full">
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold-burnished via-gold-radiant to-ember-glow shadow-[0_0_12px_rgba(245,215,127,0.5)] transition-all duration-1000"
              style={{ width }}
            />
          </div>
          <div className="mt-space-md grid grid-cols-4 text-center">
            {FLOW.map((s, i) => {
              const done = i <= stepIdx;
              const current = i === stepIdx && sealed;
              return (
                <div key={s.id} className={cn("flex flex-col items-center gap-1.5", !done && "opacity-40")}>
                  <div
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shadow-md",
                      done
                        ? "bg-gold-burnished text-surface-container-lowest"
                        : "bg-surface-container-high text-parchment-muted",
                      current &&
                        "bg-gold-radiant text-surface-container-lowest shadow-lg ring-4 ring-gold-radiant/20"
                    )}
                  >
                    <span className="material-symbols-outlined text-[16px]">{done ? (current && sealed ? s.icon : "check") : s.icon}</span>
                  </div>
                  <span
                    className={cn(
                      "font-label-sm text-label-sm font-bold",
                      current ? "text-gold-radiant" : done ? "text-parchment-text" : "text-parchment-muted"
                    )}
                  >
                    {s.step}
                  </span>
                  <span
                    className={cn(
                      "font-body-sm text-body-sm hidden sm:block",
                      current ? "text-gold-burnished" : "text-parchment-muted"
                    )}
                  >
                    {s.sub}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        {sealed ? (
          <div className="font-body-sm text-body-sm mt-space-md flex items-center justify-between rounded bg-surface-container-lowest p-space-sm text-parchment-muted">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-gold-burnished">
                lock_clock
              </span>
              <span className="italic">
                The dispersion algorithms verify physical unbroken seal prior to divine
                ledger unmasking.
              </span>
            </div>
            <button
              onClick={onAdvance}
              className="font-label-sm text-label-sm flex items-center gap-1 tracking-wider text-gold-radiant uppercase hover:underline"
            >
              Simulate next step
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            </button>
          </div>
        ) : (
          !compact && (
            <div className="font-body-sm text-body-sm mt-space-md flex flex-wrap items-center gap-2 rounded bg-surface-container-lowest p-space-sm">
              <span className="text-parchment-text">
                Top hit: <strong className="text-gold-radiant">{order.box.topHit?.name}</strong>{" "}
                · {ch?.name} {ch?.emoji}
              </span>
              <Link
                href={`/book/${order.id}`}
                className="font-label-sm text-label-sm ml-auto rounded-lg bg-gradient-to-b from-primary-container to-gold-burnished px-4 py-2 font-bold tracking-wider text-on-primary uppercase"
              >
                Open digital Mystery Book
              </Link>
            </div>
          )
        )}
      </div>
    </div>
  );
}

function WishParchment({
  no,
  text,
  author,
  status,
}: {
  no: string;
  text: string;
  author: string;
  status: string;
}) {
  return (
    <div className="grid grid-cols-1 items-center gap-space-lg rounded-xl bg-surface-midnight p-space-lg shadow-xl lg:grid-cols-12">
      <div className="flex justify-center lg:col-span-5">
        <div className="group relative w-full max-w-sm overflow-hidden rounded-lg bg-surface-container-lowest p-3 shadow-2xl">
          <div className="font-headline-sm relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded bg-[#ECE3D0] p-6 text-[#2C2416] shadow-inner">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#2C2416_1px,transparent_1px)] opacity-10 [background-size:16px_16px]" />
            <div className="flex items-center justify-between border-b border-[#2C2416]/20 pb-2">
              <span className="font-label-sm text-label-sm font-bold tracking-widest text-[#594A33] uppercase">
                The Wish Society • Sanctum
              </span>
              <span className="font-label-sm text-label-sm font-bold text-[#812500]">№ {no}</span>
            </div>
            <div className="my-auto flex flex-col py-4">
              <span className="font-label-sm text-label-sm mb-2 font-mono tracking-widest text-[#85755E] uppercase">
                Seeker Consecration:
              </span>
              <p className="font-headline-sm text-headline-sm leading-snug font-normal text-[#1F190F] italic">
                “{text}”
              </p>
              <span className="font-label-sm text-label-sm mt-4 text-right font-mono text-[#594A33]">
                — {author}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-[#2C2416]/20 pt-3">
              <div className="flex items-center gap-1 font-mono text-[10px] text-[#594A33] uppercase">
                <span>Ink: Iron Gall</span>
                <span>•</span>
                <span>{status}</span>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#812500] text-xs font-bold text-[#ECE3D0] shadow-md">
                <span>印</span>
              </div>
            </div>
          </div>
          <div className="font-label-sm absolute right-5 bottom-5 flex items-center gap-1 rounded bg-surface-midnight/90 px-2.5 py-1 text-xs text-parchment-text shadow-md backdrop-blur">
            <span className="material-symbols-outlined text-[14px] text-gold-radiant">
              photo_camera
            </span>
            Vault High-Res Scan
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-space-md lg:col-span-7">
        <div className="flex flex-col gap-1">
          <span className="font-label-sm text-label-sm font-bold tracking-widest text-gold-radiant uppercase">
            Hall of Wishes Archive File #{no}
          </span>
          <h3 className="font-headline-sm text-headline-sm font-bold text-parchment-text">
            The Vow of the Silver Horizon
          </h3>
          <p className="font-body-md text-body-md text-parchment-muted">
            Received in physical hand. Your physical card was treated with ceremonial
            lavender oil, inscribed into the monolithic brass ledger, and safely
            deposited in Vault Alcove 14-C.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-space-sm py-space-xs sm:grid-cols-3">
          {[
            { k: "Sanctuary Vault", v: "Alcove 14-C", vc: "text-gold-radiant" },
            { k: "Preservation State", v: "Gilded Brass Casket", vc: "text-rarity-rare" },
            { k: "Blessing Cycle", v: "Eternal Perpetual", vc: "text-parchment-text" },
          ].map((s) => (
            <div key={s.k} className="flex flex-col rounded-lg bg-surface-vault p-3">
              <span className="font-label-sm text-label-sm text-parchment-muted uppercase">
                {s.k}
              </span>
              <span className={cn("font-label-md text-label-md mt-1 font-bold", s.vc)}>{s.v}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-space-sm pt-2">
          <span className="font-label-md text-label-md flex items-center gap-1 rounded-lg bg-surface-vault px-4 py-2 tracking-wider text-gold-radiant uppercase">
            <span className="material-symbols-outlined text-[16px]">file_download</span>
            Certified Archive Copy
          </span>
          <Link
            href="/boxes"
            className="font-label-md text-label-md flex items-center gap-1 rounded-lg bg-surface-container-high px-4 py-2 tracking-wider text-parchment-muted uppercase transition-all hover:text-parchment-text"
          >
            <span className="material-symbols-outlined text-[16px]">edit_note</span>
            Submit New Wish in Transit Vessel
          </Link>
        </div>
      </div>
    </div>
  );
}

function ProfileForm({
  userId,
  initialName,
  initialAddress,
  joined,
  orderCount,
}: {
  userId: string;
  initialName: string;
  initialAddress: string;
  joined: string;
  orderCount: number;
}) {
  const { patch } = useStore();
  const [pN, setPN] = useState(initialName);
  const [pA, setPA] = useState(initialAddress);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="pn"
          className="font-label-sm text-label-sm font-semibold tracking-wider text-parchment-text uppercase"
        >
          Seeker Moniker
        </label>
        <input
          id="pn"
          value={pN}
          onChange={(e) => setPN(e.target.value)}
          className="font-body-md text-body-md w-full rounded-md bg-surface-container-lowest px-4 py-3 text-parchment-text shadow-inner focus:ring-1 focus:ring-gold-radiant focus:outline-none"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="pa"
          className="font-label-sm text-label-sm font-semibold tracking-wider text-parchment-text uppercase"
        >
          Sanctum Address
        </label>
        <textarea
          id="pa"
          value={pA}
          onChange={(e) => setPA(e.target.value)}
          rows={3}
          className="font-body-md text-body-md w-full rounded-md bg-surface-container-lowest px-4 py-3 text-parchment-text shadow-inner focus:ring-1 focus:ring-gold-radiant focus:outline-none"
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            patch((d) => {
              const u = d.users.find((x) => x.id === userId);
              if (u) {
                u.name = pN;
                u.address = pA;
              }
              return d;
            });
            toast.success("Profile saved");
          }}
          className="font-label-md text-label-md rounded-lg bg-gradient-to-b from-primary-container to-gold-burnished px-6 py-2.5 font-bold tracking-wider text-on-primary uppercase"
        >
          Save
        </button>
        <span className="font-body-sm text-body-sm text-parchment-muted">
          Member since {joined} · {orderCount} orders
        </span>
      </div>
    </div>
  );
}
