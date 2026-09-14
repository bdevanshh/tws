/* THE WISH SOCIETY — Mystery Engine (PRD §9). Pure functions, no React. */
import { RARITY_ORDER, type CardItem, type Character, type Product, type Rarity, type SealedBox, type Story, type Tier, type TierId } from "./types";

export interface EngineDB {
  tiers: Record<TierId, Tier>;
  characters: Character[];
  stories: Story[];
  cards: CardItem[];
  products: Product[];
}

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export function rollRarity(odds: Record<Rarity, number>): Rarity {
  const total = Object.values(odds).reduce((s, v) => s + v, 0);
  let r = Math.random() * total;
  for (const k of RARITY_ORDER) {
    r -= odds[k] || 0;
    if (r <= 0) return k;
  }
  return "common";
}

interface PoolItem {
  id: string;
  rarity: Rarity;
  stock?: number;
  tiers: TierId[];
}

/** Weighted pick honoring tier eligibility, live stock, rarity gate + duplicate prevention. */
function drawFrom<T extends PoolItem>(
  pool: T[],
  tierId: TierId,
  rolledRarity: Rarity,
  excludeIds: Set<string>
): T | null {
  const maxIdx = RARITY_ORDER.indexOf(rolledRarity);
  let cands = pool.filter(
    (x) =>
      x.tiers.includes(tierId) &&
      (x.stock ?? 1) > 0 &&
      RARITY_ORDER.indexOf(x.rarity) <= maxIdx &&
      !excludeIds.has(x.id)
  );
  if (!cands.length)
    cands = pool.filter(
      (x) => x.tiers.includes(tierId) && (x.stock ?? 1) > 0 && !excludeIds.has(x.id)
    );
  if (!cands.length) return null;
  cands = [...cands].sort((a, b) => {
    const da = Math.abs(RARITY_ORDER.indexOf(a.rarity) - maxIdx);
    const db = Math.abs(RARITY_ORDER.indexOf(b.rarity) - maxIdx);
    return da - db || (b.stock ?? 0) - (a.stock ?? 0);
  });
  return cands[Math.floor(Math.random() * Math.min(3, cands.length))];
}

/**
 * Customer Order → Character Pool → Story/Card/Product Pools
 * → Rarity + Inventory Rules → Duplicate Prevention → Cultural grouping → Sealed combo.
 */
export function generateBox(tierId: TierId, db: EngineDB): SealedBox {
  const tier = db.tiers[tierId];
  if (!tier) throw new Error("Unknown tier " + tierId);
  const spec = tier.contents;
  const used = new Set<string>();
  const takeCards = () => {
    const it = drawFrom(db.cards, tierId, rollRarity(tier.odds), used);
    if (it) used.add(it.id);
    return it;
  };
  const takeProducts = (pool: Product[]) => {
    const it = drawFrom(pool.length ? pool : db.products.filter((p) => p.tiers.includes(tierId)), tierId, rollRarity(tier.odds), used);
    if (it) used.add(it.id);
    return it;
  };

  // 1. Primary character — weighted by tier odds
  const charPool = db.characters.filter((c) => (c.stock ?? 1) > 0);
  const lift = tierId === "premium" ? 2.2 : tierId === "medium" ? 1.4 : 1.0;
  const weights = charPool.map((c) => {
    const ri = RARITY_ORDER.indexOf(c.rarity);
    const gate =
      [tier.odds.common, tier.odds.rare, tier.odds.epic, tier.odds.legendary, tier.odds.ultrarare][ri] / 100;
    return 0.2 + gate * (1 + ri * 0.35 * lift);
  });
  let primary: Character = charPool[0];
  {
    let r = Math.random() * weights.reduce((s, w) => s + w, 0);
    for (let i = 0; i < charPool.length; i++) {
      r -= weights[i];
      if (r <= 0) {
        primary = charPool[i];
        break;
      }
    }
  }

  // 2. Story — prefer one linked to primary, else same tradition
  const linked = db.stories.filter((s) => s.charIds.includes(primary.id));
  const sameTrad = db.stories.filter(
    (s) => s.tradition.split(" ")[0] === primary.tradition.split(" ")[0]
  );
  const story: Story =
    linked.length && Math.random() < 0.85
      ? pick(linked)
      : sameTrad.length
        ? pick(sameTrad)
        : pick(db.stories);

  // 3. Cards — 1 character card of primary when available, then controlled draws
  const cards: CardItem[] = [];
  const primaryCards = db.cards.filter(
    (c) => c.charId === primary.id && c.tiers.includes(tierId) && c.stock > 0
  );
  if (primaryCards.length && spec.cards >= 1) {
    const c = pick(primaryCards);
    used.add(c.id);
    cards.push({ ...c, sealedRarity: c.rarity });
  }
  while (cards.length < spec.cards) {
    const c = takeCards();
    if (!c) break;
    cards.push({ ...c, sealedRarity: c.rarity });
  }
  // A blank wish card always travels inside the physical book (PRD §6)
  if (!cards.some((c) => c.kind === "wish")) {
    const wishPool = db.cards.filter(
      (c) => c.kind === "wish" && c.tiers.includes(tierId) && c.stock > 0 && !used.has(c.id)
    );
    if (wishPool.length) {
      const w = pick(wishPool);
      used.add(w.id);
      cards.push({ ...w, sealedRarity: w.rarity });
    }
  }

  // 4. Products — tier-matched books first, then surprises / collectibles / art
  const products: Product[] = [];
  const need: Product["type"][] = [];
  for (let i = 0; i < (spec.books || 0); i++) need.push("book");
  for (let i = 0; i < (spec.bookmarks || 0); i++) need.push("bookmark");
  for (let i = 0; i < (spec.artprints || 0); i++) need.push("artprint");
  for (let i = 0; i < (spec.surprises || 0); i++) need.push("surprise");
  for (let i = 0; i < (spec.collectibles || 0); i++) need.push("collectible");
  for (const type of need) {
    const got = takeProducts(db.products.filter((p) => p.type === type && p.tiers.includes(tierId)));
    if (got) products.push({ ...got, sealedRarity: got.rarity });
  }
  if (Math.random() < (spec.bonusChance || 0)) {
    const bonus = takeProducts(
      db.products.filter((p) => ["bonus", "ministory", "surprise"].includes(p.type))
    );
    if (bonus) products.push({ ...bonus, sealedRarity: bonus.rarity, bonus: true });
  }

  // 5. Box value + top hit
  const value =
    products.reduce((s, p) => s + (p.price || 0), 0) + cards.length * 2.5 + 6;
  const topHit = [...cards, ...products].sort(
    (a, b) =>
      RARITY_ORDER.indexOf(b.sealedRarity || b.rarity) -
      RARITY_ORDER.indexOf(a.sealedRarity || a.rarity)
  )[0];

  return {
    character: primary,
    story,
    cards,
    products,
    estValue: Math.round(value * 100) / 100,
    topHit: topHit ? { name: topHit.name, rarity: topHit.sealedRarity || topHit.rarity } : null,
    sealedAt: new Date().toISOString(),
    seed: Math.floor(rnd(1e6, 9e6)),
  };
}
