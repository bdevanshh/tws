/* THE WISH SOCIETY — Mystery Engine (PRD §9). Pure functions, no DOM. */
window.TWS_Engine = (() => {
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  function rollRarity(odds) {
    const total = Object.values(odds).reduce((s, v) => s + v, 0);
    let r = Math.random() * total;
    for (const k of ["common","rare","epic","legendary","ultrarare"]) {
      r -= odds[k] || 0;
      if (r <= 0) return k;
    }
    return "common";
  }

  // Weighted rarity pick from a pool with stock + tier eligibility + rarity gate.
  function drawFrom(pool, tierId, rolledRarity, excludeIds = new Set()) {
    const order = ["common","rare","epic","legendary","ultrarare"];
    const maxIdx = order.indexOf(rolledRarity);
    let cands = pool.filter(x =>
      (x.tiers || []).includes(tierId) && (x.stock ?? 1) > 0 &&
      order.indexOf(x.rarity) <= maxIdx && !excludeIds.has(x.id));
    if (!cands.length) cands = pool.filter(x => (x.tiers || []).includes(tierId) && (x.stock ?? 1) > 0 && !excludeIds.has(x.id));
    if (!cands.length) return null;
    // bias toward rolled rarity, then higher tiers of rarity
    cands.sort((a, b) => {
      const da = Math.abs(order.indexOf(a.rarity) - maxIdx);
      const db = Math.abs(order.indexOf(b.rarity) - maxIdx);
      return da - db || (b.stock - a.stock);
    });
    return cands[Math.floor(Math.random() * Math.min(3, cands.length))];
  }

  /**
   * generateBox — Customer Order → Character Pool → Story/Card/Product Pools
   * → Rarity + Inventory Rules → Duplicate Prevention → Cultural grouping → Sealed combo.
   */
  function generateBox(tierId, db) {
    const tier = db.tiers[tierId];
    if (!tier) throw new Error("Unknown tier " + tierId);
    const spec = tier.contents;
    const used = new Set();
    const take = (arr) => { const it = drawFrom(arr, tierId, rollRarity(tier.odds), used); if (it) used.add(it.id); return it; };

    // 1. Primary character — weighted by tier odds vs card rarity proxy
    const charPool = db.characters.filter(c => (c.stock ?? 1) > 0);
    const charWeights = charPool.map(c => {
      const order = ["common","rare","epic","legendary","ultrarare"];
      const ri = order.indexOf(c.rarity);
      // premium tiers lift rare characters up
      const lift = tierId === "premium" ? 2.2 : tierId === "medium" ? 1.4 : 1.0;
      const odds = tier.odds;
      const gate = [odds.common, odds.rare, odds.epic, odds.legendary, odds.ultrarare][ri] / 100;
      return 0.2 + gate * (1 + ri * 0.35 * lift);
    });
    let primary = null;
    { let r = Math.random() * charWeights.reduce((s, w) => s + w, 0);
      for (let i = 0; i < charPool.length; i++) { r -= charWeights[i]; if (r <= 0) { primary = charPool[i]; break; } }
      primary = primary || pick(charPool);
    }

    // 2. Story — prefer one linked to primary (cultural grouping rule), else same tradition
    const linked = db.stories.filter(s => (s.charIds || []).includes(primary.id));
    const sameTrad = db.stories.filter(s => s.tradition.split(" ")[0] === primary.tradition.split(" ")[0]);
    const story = linked.length && Math.random() < 0.85 ? pick(linked)
      : sameTrad.length ? pick(sameTrad) : pick(db.stories);

    // 3. Cards — always include 1 character card of primary if available (duplicate prevention otherwise)
    const cards = [];
    const primaryCards = db.cards.filter(c => c.charId === primary.id && c.tiers.includes(tierId) && c.stock > 0);
    if (primaryCards.length && spec.cards >= 1) { const c = pick(primaryCards); used.add(c.id); cards.push({ ...c, sealedRarity: c.rarity }); }
    while (cards.length < spec.cards) {
      const c = take(db.cards);
      if (!c) break;
      // cultural rule: max 2 traditions per box besides wish cards
      cards.push({ ...c, sealedRarity: c.rarity });
    }
    // always ensure a wish card exists physically (PRD §6)
    if (!cards.some(c => c.kind === "wish")) {
      const wishPool = db.cards.filter(c => c.kind === "wish" && c.tiers.includes(tierId) && c.stock > 0 && !used.has(c.id));
      if (wishPool.length) { const w = pick(wishPool); used.add(w.id); cards.push({ ...w, sealedRarity: w.rarity }); }
    }

    // 4. Products — books first (tier-matched), then surprises/collectibles/art
    const products = [];
    const need = [];
    for (let i = 0; i < (spec.books || 0); i++) need.push("book");
    for (let i = 0; i < (spec.bookmarks || 0); i++) need.push("bookmark");
    for (let i = 0; i < (spec.artprints || 0); i++) need.push("artprint");
    for (let i = 0; i < (spec.surprises || 0); i++) need.push("surprise");
    for (let i = 0; i < (spec.collectibles || 0); i++) need.push("collectible");
    for (const type of need) {
      const pool = db.products.filter(p => p.type === type && p.tiers.includes(tierId));
      const got = drawFrom(pool.length ? pool : db.products.filter(p => p.tiers.includes(tierId)), tierId, rollRarity(tier.odds), used);
      if (got) { used.add(got.id); products.push({ ...got, sealedRarity: got.rarity }); }
    }
    if (Math.random() < (spec.bonusChance || 0)) {
      const bonus = drawFrom(db.products.filter(p => ["bonus","ministory","surprise"].includes(p.type)), tierId, rollRarity(tier.odds), used);
      if (bonus) { used.add(bonus.id); products.push({ ...bonus, sealedRarity: bonus.rarity, bonus: true }); }
    }

    // 5. Box value + top hit
    const value = products.reduce((s, p) => s + (p.price || 0), 0) + cards.length * 2.5 + 6;
    const rank = ["common","rare","epic","legendary","ultrarare"];
    const topHit = [...cards, ...products].sort((a, b) => rank.indexOf(b.sealedRarity || b.rarity) - rank.indexOf(a.sealedRarity || a.rarity))[0];

    return {
      character: primary, story,
      cards, products,
      estValue: Math.round(value * 100) / 100,
      topHit: topHit ? { name: topHit.name, rarity: topHit.sealedRarity || topHit.rarity } : null,
      sealedAt: new Date().toISOString(),
      seed: Math.floor(rnd(1e6, 9e6))
    };
  }

  return { rollRarity, generateBox };
})();
