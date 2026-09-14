/* THE WISH SOCIETY — SPA prototype: store, router, views, checkout, book, admin */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (s = "") => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const money = n => "$" + Number(n).toFixed(2);
const KEY = "tws_db_v1";

function toast(msg) {
  const t = document.createElement("div"); t.textContent = msg;
  $("#toast").appendChild(t); setTimeout(() => t.remove(), 3200);
}
function uid(p = "id") { return p + "_" + Math.random().toString(36).slice(2, 8); }

/* ---------- store ---------- */
function seedDB() {
  const S = window.TWS_SEED;
  const stock = {};
  [...S.CARDS, ...S.PRODUCTS].forEach(x => stock[x.id] = x.stock);
  S.CHARACTERS.forEach(c => stock["ch_" + c.id] = 999);
  return {
    users: [
      { id: "u_customer", name: "Aarav Sharma", email: "customer@wish.com", pass: "wish123", role: "customer", address: "221B Rosewood Lane, Mumbai", joined: "2026-06-02" },
      { id: "u_admin", name: "Wish Master", email: "admin@wish.com", pass: "admin123", role: "admin", address: "Vault 7, The Wish Society HQ", joined: "2026-01-01" }
    ],
    session: null,
    orders: [], wishes: [],
    tiers: JSON.parse(JSON.stringify(S.TIERS)),
    characters: JSON.parse(JSON.stringify(S.CHARACTERS)),
    stories: JSON.parse(JSON.stringify(S.STORIES)),
    cards: JSON.parse(JSON.stringify(S.CARDS)),
    products: JSON.parse(JSON.stringify(S.PRODUCTS)),
    stock,
    live: [
      { who: "Sofia · Spain", what: "Amaterasu — Return of Light", rarity: "legendary" },
      { who: "Arjun · India", what: "Shiva — Cosmic Dancer", rarity: "legendary" },
      { who: "Yuki · Japan", what: "Moon Festival Tea", rarity: "common" },
    ]
  };
}
function loadDB() {
  try { const raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw); } catch {}
  const db = seedDB(); localStorage.setItem(KEY, JSON.stringify(db)); return db;
}
let DB = loadDB();
function save() { localStorage.setItem(KEY, JSON.stringify(DB)); }
const me = () => DB.users.find(u => u.id === DB.session) || null;
const R = window.TWS_SEED.RARITY;
function badge(r) { return `<span class="badge b-${r}">${esc((R[r] || {}).label || r)}</span>`; }
function charById(id) { return DB.characters.find(c => c.id === id) || {}; }
function storyById(id) { return DB.stories.find(s => s.id === id); }

/* ---------- engine bridge (respects admin stock) ---------- */
function engineDB() {
  return {
    tiers: DB.tiers,
    characters: DB.characters.map(c => ({ ...c, stock: DB.stock["ch_" + c.id] ?? 999 })),
    stories: DB.stories,
    cards: DB.cards.map(c => ({ ...c, stock: DB.stock[c.id] ?? 0 })),
    products: DB.products.map(p => ({ ...p, stock: DB.stock[p.id] ?? 0 })),
  };
}
function sealBox(tierId) {
  const box = window.TWS_Engine.generateBox(tierId, engineDB());
  // decrement stock
  [...box.cards, ...box.products].forEach(it => {
    const base = DB.cards.find(c => c.id === it.id) || DB.products.find(p => p.id === it.id);
    if (base && DB.stock[it.id] > 0) DB.stock[it.id]--;
  });
  return box;
}

/* ---------- nav ---------- */
const NAV = [["#/", "Home"], ["#/boxes", "Mystery Boxes"], ["#/open", "Unbox Demo"], ["#/how", "How It Works"], ["#/about", "About"], ["#/account", "My Account"], ["#/admin", "Admin"]];
function paintNav(route) {
  $("#navLinks").innerHTML = NAV.map(([h, l]) => `<a href="${h}" class="${route === h ? "on" : ""}">${l}</a>`).join("");
  const u = me();
  $("#navUser").textContent = u ? `${u.name} · ${u.role}` : "";
  $("#navAuth").textContent = u ? "Logout" : "Login";
  $("#navAuth").onclick = () => { if (u) { DB.session = null; save(); toast("Logged out"); location.hash = "#/"; paintNav("#/"); } else location.hash = "#/auth"; };
}

/* ---------- shared bits ---------- */
function tierCard(t, detail) {
  const odds = Object.entries(t.odds).map(([k, v]) => `<span class="r-${k}">⬤ ${R[k].label} ${v}%</span>`).join("");
  return `<div class="card tier ${t.popular ? "pop" : ""}">
    ${t.popular ? `<span class="pill" style="position:absolute;top:14px;right:14px">★ Most popular</span>` : ""}
    <div class="kicker">${esc(t.tag)}</div>
    <h2 class="serif" style="margin:6px 0">${t.name} Box</h2>
    <div class="price" style="color:${t.color}">${money(t.price)}</div>
    <p class="small muted">${esc(t.desc)}</p>
    ${detail ? `<div class="odds">${odds}</div>
    <p class="small muted" style="margin-top:10px">Same tier, different fate — two ${t.name} buyers never receive the same combination. Contents sealed until delivery.</p>` : ""}
    <div class="row" style="margin-top:14px">
      <a class="btn gold" href="#/checkout/${t.id}">Choose ${t.name} →</a>
      <a class="btn ghost sm" href="#/open">Simulate</a>
    </div></div>`;
}
function statusTimeline(st) {
  const steps = ["paid", "packing", "shipped", "delivered"];
  const labels = { paid: "Payment", packing: "Mystery Engine", shipped: "Shipped", delivered: "Delivered" };
  return `<div class="timeline">${steps.map(s => `<div class="${steps.indexOf(s) <= steps.indexOf(st) ? "done" : ""}">${labels[s]}</div>`).join("")}</div>`;
}

/* ---------- views ---------- */
function vHome() {
  const tiers = Object.values(DB.tiers).map(t => tierCard(t)).join("");
  return `<section class="hero">
    <span class="pill">◉ Global mystery-box & collectible experience</span>
    <h1 class="serif">You Choose the Box.<br><span style="color:var(--gold)">We Create the Mystery.</span><br>You Discover the Story.</h1>
    <p>One tier. Zero spoilers. Inside: a sealed <b>Mystery Book</b>, character cards, art, collectibles and a blank <b>YOUR WISH</b> card you fill in <i>after</i> unboxing — then send to us. Good wishes are accepted.</p>
    <div class="row" style="justify-content:center;margin-top:18px">
      <a class="btn gold" href="#/boxes">Choose your box →</a>
      <a class="btn" href="#/open">🎁 Free unbox demo</a>
    </div>
    <div class="row" style="justify-content:center;margin-top:12px">
      <span class="badge b-common">Common</span><span class="badge b-rare">Rare</span><span class="badge b-epic">Epic</span><span class="badge b-legendary">Legendary</span><span class="badge b-ultrarare">Ultra Rare</span>
    </div></section>
  <section class="grid g3">${tiers}</section>
  <section class="card" style="margin-top:18px"><div class="kicker">How it works</div>
    <div class="grid g4" style="margin-top:10px">
      ${[["1 · Choose", "Pick Regular, Medium or Premium. Nothing else — no character, no story, no card."], ["2 · We seal it", "The Mystery Engine rolls rarity + inventory and seals a unique combination."], ["3 · Unbox", "Open the physical box. Meet your character, story, cards & surprises."], ["4 · Wish", "Write your wish on the YOUR WISH card, send it to us. Good ones are accepted."]].map(([h, p]) => `<div><b>${h}</b><p class="small muted">${p}</p></div>`).join("")}
    </div>
    <a class="btn sm" href="#/how">Full journey →</a></section>
  <section class="grid g2" style="margin-top:16px">
    <div class="card"><div class="kicker">The universe</div><h3 class="serif">24 souls · 27 stories · 6 continents</h3>
      <p class="small muted">Hindu · Sikh · Buddhist · Jain · Christian · Islamic · Chinese · Greek · Roman · Norse · Egyptian · Japanese · Akan · Aztec. Every figure labeled deity / sacred / mythological / cultural / historical — rarity describes the <i>print</i>, never the faith.</p>
      <div class="row">${DB.characters.slice(0, 8).map(c => `<span class="badge b-${c.rarity}" title="${esc(c.tradition)}">${c.emoji} ${esc(c.name)}</span>`).join("")}<span class="small muted">+ ${DB.characters.length - 8} more…</span></div></div>
    <div class="card"><div class="kicker">Live drops · just now</div><div class="live">${DB.live.slice(-5).reverse().map(l => `<div>✨ <b>${esc(l.who)}</b> pulled <b>${esc(l.what)}</b> ${badge(l.rarity)}</div>`).join("")}</div>
      <div class="row" style="margin-top:10px"><a class="btn sm gold" href="#/open">Try your luck free</a><a class="btn sm ghost" href="#/boxes">Skip to boxes</a></div></div>
  </section>`;
}

function vBoxes() {
  return `<h1 class="serif" style="margin-top:26px">Mystery Boxes</h1>
  <p class="muted">You select <b>only the tier</b>. Characters, stories, cards, products and collectibles are sealed by the Mystery Engine.</p>
  <div class="grid g3">${Object.values(DB.tiers).map(t => tierCard(t, true)).join("")}</div>
  <div class="card" style="margin-top:16px"><b>Fairness note.</b> <span class="small muted">Odds shown per box. Premium raises Legendary/Ultra chances and guarantees more collectibles — but any tier can spike. Same-tier boxes differ by design. Inventory is live: when a limited item sells out, the engine re-weights automatically.</span></div>`;
}

function vHow() {
  const steps = [["Choose", "Create an account, pick Regular / Medium / Premium. No wish is entered at checkout — the site never asks."], ["Order & pay", "Mock payment. The Mystery Engine instantly creates your sealed combination: character → story → cards → products → rarity checks → duplicate prevention."], ["We prepare", "Your physical box is packed: Mystery Book, cards, bookmark, art, surprise products, bonus."], ["Shipping", "Track packing → shipped → delivered in My Account."], ["Unbox & discover", "Meet your character. Read the story. Reveal cards and collectibles."], ["Wish", "Write your wish on the physical YOUR WISH card/page inside the book, submit it here. We accept the good ones."]];
  return `<h1 class="serif" style="margin-top:26px">How It Works</h1>
  <div class="grid g3">${steps.map(([h, p], i) => `<div class="card"><div class="kicker">Step ${i + 1}</div><h3>${h}</h3><p class="small muted">${p}</p></div>`).join("")}</div>`;
}

function vAbout() {
  return `<h1 class="serif" style="margin-top:26px">About The Wish Society</h1>
  <div class="grid g2"><div class="card"><p>We are not selling a book. We are selling <b>uncertainty, done respectfully</b> — Mystery + Stories + Characters + Culture + Collectibles + Surprise.</p>
  <p class="small muted">Every box funds accurate, reverent storytelling: scholars review sacred figures, artists are credited, and rarity always describes the <i>object</i> — the foil, the numbering, the edition — never the holiness of a deity.</p>
  <p class="serif" style="font-size:20px;color:var(--gold)">“You choose the box. We create the mystery. You discover the story.”</p></div>
  <div class="card"><div class="kicker">Brand promise</div><ul class="small muted"><li>Never selectable: character, story, card, product, collectible.</li><li>Always mysterious until the physical seal breaks.</li><li>Wishes live on paper first — then, if good, in our Hall of Wishes.</li><li>Cultures are hosts, not costumes.</li></ul></div></div>`;
}

/* ----- unbox demo (hypedrop style) ----- */
function vOpen() {
  return `<h1 class="serif" style="margin-top:26px">🎁 Unbox Demo <span class="small muted">— free, unlimited, no account</span></h1>
  <div class="row"><label class="small muted">Demo tier:</label>
    <select id="demoTier" class="inp" style="max-width:220px">${Object.values(DB.tiers).map(t => `<option value="${t.id}">${t.name} — ${money(t.price)}</option>`).join("")}</select>
    <button class="btn gold" id="spinBtn">SPIN — reveal my fate</button></div>
  <div class="spinner-shell" style="margin-top:14px"><div class="strip" id="strip"></div></div>
  <div class="grid g2" style="margin-top:14px"><div class="card" id="demoResult"><b>Your pull appears here.</b><p class="small muted">Outcome is pre-sealed before the strip moves (like provably-fair drops), then revealed under the needle.</p></div>
  <div class="card"><div class="kicker">Live drops</div><div class="live" id="liveFeed">${DB.live.slice(-8).reverse().map(l => `<div>✨ <b>${esc(l.who)}</b> pulled <b>${esc(l.what)}</b> ${badge(l.rarity)}</div>`).join("")}</div></div></div>
  <div class="row" style="margin-top:12px"><a class="btn gold" id="demoBuy" href="#/boxes">Love it? Get the real sealed box →</a></div>`;
}
function bindOpen() {
  const names = ["Lena · Germany", "Kabir · India", "Mina · Japan", "Omar · UAE", "Zoe · USA", "Lucas · Brazil", "Aisha · UK"];
  const strip = $("#strip"); if (!strip) return;
  const fillStrip = (win) => {
    strip.style.transition = "none"; strip.style.transform = "translateX(0)";
    let html = "";
    for (let i = 0; i < 42; i++) {
      const it = i === 34 ? win : randomDrop();
      html += `<div class="drop" style="border-color:${(R[it.rarity] || {}).color}"><div class="em">${it.emoji}</div><div class="small"><b>${esc(it.name)}</b></div>${badge(it.rarity)}</div>`;
    }
    strip.innerHTML = html;
  };
  const randomDrop = () => {
    const pool = [...DB.cards.map(c => ({ name: c.name, rarity: c.rarity, emoji: (charById(c.charId) || {}).emoji || "🃏" })), ...DB.products.map(p => ({ name: p.name, rarity: p.rarity, emoji: "📦" }))];
    return pool[Math.floor(Math.random() * pool.length)];
  };
  let currentWin = randomDrop(); fillStrip(currentWin);
  $("#spinBtn").onclick = () => {
    const tierId = $("#demoTier").value;
    const box = window.TWS_Engine.generateBox(tierId, engineDB()); // sealed FIRST
    const top = box.topHit;
    currentWin = { name: top.name, rarity: top.rarity, emoji: (charById(box.character.id) || {}).emoji || "🌟" };
    fillStrip(currentWin); void strip.offsetWidth;
    strip.style.transition = ""; strip.style.transform = "translateX(-5520px)";
    $("#demoResult").innerHTML = `<b>Sealing…</b><p class="small muted">The engine chose. Strip is rolling to position 35…</p>`;
    setTimeout(() => {
      const ch = box.character;
      $("#demoResult").innerHTML = `<div class="kicker">Your fate · ${esc(DB.tiers[tierId].name)} demo</div>
        <h2 class="serif">${ch.emoji} ${esc(ch.name)} <span class="small muted">· ${esc(ch.tradition)}</span></h2>
        <p class="small">${esc(ch.desc)}</p><p class="small muted">Story: <b>${esc(box.story.title)}</b> · Est. box value ${money(box.estValue)}</p>
        <div class="row">${badge(currentWin.rarity)}<span class="small">Top hit: <b>${esc(top.name)}</b></span></div>
        <div class="row" style="margin-top:10px"><a class="btn gold sm" href="#/checkout/${tierId}">Get this tier for real →</a></div>`;
      const entry = { who: names[Math.floor(Math.random() * names.length)], what: top.name, rarity: top.rarity };
      DB.live.push(entry); save();
      $("#liveFeed").innerHTML = DB.live.slice(-8).reverse().map(l => `<div>✨ <b>${esc(l.who)}</b> pulled <b>${esc(l.what)}</b> ${badge(l.rarity)}</div>`).join("");
      toast(`Demo pull: ${top.name} (${(R[top.rarity] || {}).label})`);
    }, 4300);
  };
}

/* ----- auth ----- */
function vAuth() {
  return `<h1 class="serif" style="margin-top:26px">Welcome, Seeker</h1>
  <div class="grid g2"><div class="card"><div class="tabs"><button class="on" id="tL">Login</button><button id="tR">Register</button></div>
    <div id="fL"><label class="lbl">Email</label><input class="inp" id="lE" value="customer@wish.com"><label class="lbl">Password</label><input class="inp" id="lP" type="password" value="wish123"><div style="height:12px"></div><button class="btn gold" id="doL">Login</button>
    <p class="small muted">Demo: customer@wish.com / wish123 · admin@wish.com / admin123</p></div>
    <div id="fR" style="display:none"><label class="lbl">Name</label><input class="inp" id="rN"><label class="lbl">Email</label><input class="inp" id="rE"><label class="lbl">Password</label><input class="inp" id="rP" type="password"><div style="height:12px"></div><button class="btn gold" id="doR">Create account</button></div></div>
  <div class="card"><div class="kicker">Why join?</div><ul class="small muted"><li>Sealed orders + live tracking</li><li>Digital Mystery Bookshelf</li><li>Collectibles binder & wish status</li><li>Admins get the Vault (full control room)</li></ul></div></div>`;
}
function bindAuth() {
  if (!$("#doL")) return;
  $("#tL").onclick = e => { $("#fL").style.display = ""; $("#fR").style.display = "none"; $$(".tabs button").forEach(b => b.classList.remove("on")); e.target.classList.add("on"); };
  $("#tR").onclick = e => { $("#fR").style.display = ""; $("#fL").style.display = "none"; $$(".tabs button").forEach(b => b.classList.remove("on")); e.target.classList.add("on"); };
  $("#doL").onclick = () => {
    const u = DB.users.find(x => x.email === $("#lE").value.trim().toLowerCase() && x.pass === $("#lP").value);
    if (!u) return toast("Invalid credentials");
    DB.session = u.id; save(); toast(`Welcome back, ${u.name}`); location.hash = u.role === "admin" ? "#/admin" : "#/account";
  };
  $("#doR").onclick = () => {
    const n = $("#rN").value.trim(), e = $("#rE").value.trim().toLowerCase(), p = $("#rP").value;
    if (!n || !e || !p) return toast("Fill all fields");
    if (DB.users.some(x => x.email === e)) return toast("Email already registered");
    const u = { id: uid("u"), name: n, email: e, pass: p, role: "customer", address: "", joined: new Date().toISOString().slice(0, 10) };
    DB.users.push(u); DB.session = u.id; save(); toast("Account created — choose your box!"); location.hash = "#/boxes";
  };
}

/* ----- checkout ----- */
function vCheckout(tierId) {
  const t = DB.tiers[tierId]; if (!t) return `<p>Unknown tier. <a href="#/boxes">Back</a></p>`;
  const u = me();
  return `<h1 class="serif" style="margin-top:26px">Checkout — ${t.name} Box</h1>
  <div class="grid g2"><div class="card">
    <div class="kicker">No wish here — by design</div>
    <p class="small muted">Per the concept, this site <b>never asks for your wish at checkout</b>. Your blank YOUR WISH card travels <i>inside</i> the physical book. You write it after unboxing.</p>
    <label class="lbl">Full name</label><input class="inp" id="cN" value="${esc(u ? u.name : "")}">
    <label class="lbl">Email</label><input class="inp" id="cE" value="${esc(u ? u.email : "")}">
    <label class="lbl">Delivery address</label><textarea class="inp" id="cA" rows="2">${esc(u ? u.address || "" : "")}</textarea>
    <label class="lbl">Card (mock — use 4242…)</label><input class="inp" id="cC" value="4242 4242 4242 4242">
    <div class="grid g2"><div><label class="lbl">Expiry</label><input class="inp" value="12/28"></div><div><label class="lbl">CVC</label><input class="inp" value="123"></div></div>
    <div style="height:14px"></div><button class="btn gold" id="payBtn">Pay ${money(t.price)} — seal my mystery</button>
    ${u ? "" : `<p class="small muted">An account will be created for tracking.</p>`}</div>
  <div><div class="card tier ${t.popular ? "pop" : ""}"><div class="kicker">${esc(t.tag)}</div><h2 class="serif">${t.name} Box — ${money(t.price)}</h2><p class="small muted">${esc(t.desc)}</p><div class="odds">${Object.entries(t.odds).map(([k, v]) => `<span class="r-${k}">⬤ ${R[k].label} ${v}%</span>`).join("")}</div></div>
  <div class="sealed" style="margin-top:12px">🔒 <b>Sealed until delivery.</b><div class="small muted">Character ? · Story ? · ${t.contents.cards} cards ? · surprises ? · bonus ?</div></div></div></div>`;
}
function bindCheckout(tierId) {
  const btn = $("#payBtn"); if (!btn) return;
  btn.onclick = () => {
    const n = $("#cN").value.trim(), e = $("#cE").value.trim().toLowerCase(), a = $("#cA").value.trim();
    if (!n || !e || !a) return toast("Name, email and address are required");
    let u = me();
    if (!u) { u = DB.users.find(x => x.email === e); if (!u) { u = { id: uid("u"), name: n, email: e, pass: "wish123", role: "customer", address: a, joined: new Date().toISOString().slice(0, 10) }; DB.users.push(u); } DB.session = u.id; }
    u.address = a; u.name = n;
    btn.disabled = true; btn.textContent = "Sealing your mystery…";
    setTimeout(() => {
      try {
        const box = sealBox(tierId);
        const order = { id: "WS-" + Math.floor(100000 + Math.random() * 900000), userId: u.id, tier: tierId, price: DB.tiers[tierId].price, status: "paid", createdAt: new Date().toISOString(), address: a, last4: "4242", box, wishText: "", revealed: false };
        DB.orders.unshift(order); save(); paintNav(location.hash);
        toast("Payment accepted — mystery sealed!");
        location.hash = "#/account";
      } catch (err) { btn.disabled = false; btn.textContent = "Retry"; toast("Sold out in this tier — try another"); }
    }, 1200);
  };
}

/* ----- account ----- */
function vAccount() {
  const u = me(); if (!u) return `<div class="card" style="margin-top:26px"><h2 class="serif">Login required</h2><p class="muted">Track orders, read digital books and submit wishes.</p><a class="btn gold" href="#/auth">Login / Register</a></div>`;
  const orders = DB.orders.filter(o => o.userId === u.id);
  const wishes = DB.wishes.filter(w => w.userId === u.id);
  const collected = orders.filter(o => o.status === "delivered").flatMap(o => o.box.cards);
  return `<h1 class="serif" style="margin-top:26px">My Account <span class="small muted">· ${esc(u.name)}</span></h1>
  <div class="tabs">${["Orders", "Bookshelf", "Collection", "Wishes", "Profile"].map((t, i) => `<button data-tab="${t}" class="${i === 0 ? "on" : ""}">${t}</button>`).join("")}</div>
  <div id="tabBody"></div>
  <script>void 0</script>`;
}
function bindAccount() {
  const body = $("#tabBody"); if (!body) return;
  const u = me(); if (!u) return;
  const orders = DB.orders.filter(o => o.userId === u.id);
  const show = (tab) => {
    $$(".tabs button").forEach(b => b.classList.toggle("on", b.dataset.tab === tab));
    if (tab === "Orders") body.innerHTML = orders.length ? orders.map(o => {
      const t = DB.tiers[o.tier];
      const sealed = o.status !== "delivered";
      return `<div class="card" style="margin-bottom:12px"><div class="row" style="justify-content:space-between"><b>${o.id} · ${t.name} Box · ${money(o.price)}</b><span class="badge ${o.status === "delivered" ? "b-legendary" : "b-rare"}">${o.status.toUpperCase()}</span></div>
      ${statusTimeline(o.status)}
      ${sealed ? `<div class="sealed">🔒 <b>Sealed.</b> <span class="small muted">Contents hidden until delivery — that is the whole point.</span><div class="row" style="justify-content:center;margin-top:10px"><button class="btn sm" data-adv="${o.id}">Simulate next shipping step →</button></div></div>`
        : `<div class="row">${badge(o.box.topHit.rarity)}<span class="small">Top hit: <b>${esc(o.box.topHit.name)}</b> · ${esc(charById(o.box.character.id).name || "")} ${esc((charById(o.box.character.id) || {}).emoji || "")}</span></div>
           <div class="row" style="margin-top:10px"><a class="btn sm gold" href="#/book/${o.id}">📖 Open digital Mystery Book</a></div>`}</div>`;
    }).join("") : `<div class="card">No orders yet. <a class="btn sm gold" href="#/boxes">Choose a box →</a></div>`;
    if (tab === "Bookshelf") { const del = orders.filter(o => o.status === "delivered"); body.innerHTML = del.length ? `<div class="grid g3">${del.map(o => `<div class="card"><div style="font-size:40px">${esc((charById(o.box.character.id) || {}).emoji || "📖")}</div><b>${esc(o.box.story.title)}</b><p class="small muted">${esc(charById(o.box.character.id).name || "")} · ${o.id}</p><a class="btn sm gold" href="#/book/${o.id}">Read book →</a></div>`).join("")}</div>` : `<div class="card">Your bookshelf unlocks on <b>delivery</b>. Sealed orders can't be peeked. <a href="#/account">Check Orders →</a></div>`; }
    if (tab === "Collection") { const all = orders.filter(o => o.status === "delivered").flatMap(o => o.box.cards.map(c => ({ ...c, order: o.id }))); body.innerHTML = all.length ? `<div class="grid g4">${all.map(c => `<div class="card" style="border-color:${(R[c.sealedRarity || c.rarity] || {}).color}"><div style="font-size:32px">${esc((charById(c.charId) || {}).emoji || "🃏")}</div><b class="small">${esc(c.name)}</b><div style="margin-top:6px">${badge(c.sealedRarity || c.rarity)}</div><div class="small muted">${esc(c.order)}</div></div>`).join("")}</div>` : `<div class="card">No collectibles yet — they reveal at unboxing.</div>`; }
    if (tab === "Wishes") { const ws = DB.wishes.filter(w => w.userId === u.id); body.innerHTML = ws.length ? ws.map(w => `<div class="card" style="margin-bottom:10px"><b>“${esc(w.text)}”</b><div class="row" style="margin-top:8px"><span class="badge ${w.status === "approved" ? "b-legendary" : w.status === "declined" ? "b-ultrarare" : "b-rare"}">${w.status.toUpperCase()}</span><span class="small muted">${w.orderId}${w.note ? " · Note: " + esc(w.note) : ""}</span></div></div>`).join("") : `<div class="card">No wishes sent. Open a delivered book → write your wish → send it to us.</div>`; }
    if (tab === "Profile") body.innerHTML = `<div class="card"><label class="lbl">Name</label><input class="inp" id="pN" value="${esc(u.name)}"><label class="lbl">Address</label><textarea class="inp" id="pA">${esc(u.address || "")}</textarea><div style="height:10px"></div><button class="btn gold sm" id="pS">Save</button> <span class="small muted">Member since ${esc(u.joined)} · ${orders.length} orders</span></div>`;
    $$("[data-adv]", body).forEach(b => b.onclick = () => {
      const o = DB.orders.find(x => x.id === b.dataset.adv); if (!o) return;
      o.status = o.status === "paid" ? "packing" : o.status === "packing" ? "shipped" : "delivered";
      if (o.status === "delivered") o.revealed = true;
      save(); toast(o.status === "delivered" ? "📦 Delivered! Mystery revealed — open your book!" : `Order ${o.id} → ${o.status}`); bindAccountRefresh(tab);
    });
    const ps = $("#pS"); if (ps) ps.onclick = () => { u.name = $("#pN").value; u.address = $("#pA").value; save(); paintNav(location.hash); toast("Profile saved"); };
  };
  const bindAccountRefresh = (tab) => { location.hash = "#/account"; render(); setTimeout(() => { const btn = $(`[data-tab="${tab === "Orders" ? "Orders" : tab}"]`); }, 0); };
  $$(".tabs button").forEach(b => b.onclick = () => show(b.dataset.tab));
  show("Orders");
}

/* ----- digital mystery book + wish ----- */
function vBook(orderId) {
  const u = me(); const o = DB.orders.find(x => x.id === orderId);
  if (!u) return `<div class="card" style="margin-top:26px">Login required. <a href="#/auth">Login →</a></div>`;
  if (!o || o.userId !== u.id) return `<div class="card" style="margin-top:26px">Order not found.</div>`;
  if (o.status !== "delivered") return `<div class="sealed" style="margin-top:26px">🔒 This book is sealed until delivery.<br><a class="btn sm" href="#/account">Back to tracking</a></div>`;
  const ch = charById(o.box.character.id); const st = storyById(o.box.story.id) || o.box.story;
  const pages = [
    { t: "Mystery Cover", h: `<div style="text-align:center;padding:30px 0"><div style="font-size:64px">${esc(ch.emoji || "📖")}</div><h2>${esc(st.title)}</h2><p class="muted">A ${esc(DB.tiers[o.tier].name)} Mystery · ${o.id}</p><span class="pill">✦ sealed · revealed ✦</span></div>` },
    { t: "The Soul", h: `<h2>${esc(ch.emoji || "")} ${esc(ch.name)}</h2><p><span class="badge b-${ch.rarity}">${esc(ch.tradition || "")}</span> <span class="badge b-common">${esc(ch.category || "")}</span></p><p>${esc(ch.desc || "")}</p><p><b>Symbols:</b> ${esc((ch.symbols || []).join(" · "))}</p>` },
    { t: "Context", h: `<h2>Cultural ground</h2><p>${esc(st.tradition || ch.tradition || "")} — told with reverence. Sacred figures are presented as believers honor them; myths as meaning-carrying stories; history as history. Rarity below describes your <i>print & edition</i>, never spiritual worth.</p>` },
    { t: "The Story", h: `<h2>${esc(st.title)}</h2><p>${esc(st.body || st.blurb || "")}</p><p><i>${esc(st.blurb || "")}</i></p>` },
    { t: "Your Cards", h: `<h2>Cards in this box</h2>${o.box.cards.map(c => `<p>🃏 <b>${esc(c.name)}</b> ${badge(c.sealedRarity || c.rarity)}<br><span class="muted"><i>${esc(c.msg || "")}</i></span></p>`).join("")}` },
    { t: "Surprises", h: `<h2>Products & collectibles</h2>${o.box.products.map(p => `<p>📦 <b>${esc(p.name)}</b> ${badge(p.sealedRarity || p.rarity)}${p.bonus ? " · BONUS" : ""}<br><span class="muted">${esc(p.desc || "")}</span></p>`).join("")}<p><b>Est. box value: ${money(o.box.estValue)}</b></p>` },
    { t: "Your Wish", h: `<h2>✍️ YOUR WISH</h2><p class="muted">This mirrors the physical card in your box. Write it by hand there — and send it here so we can accept it.</p><div class="wishbox"><textarea class="inp" id="wishText" rows="4" style="background:transparent;border:none;color:#2b2118;font-family:Playfair Display,serif;font-size:18px" placeholder="Write your wish here…">${esc(o.wishText || "")}</textarea></div><div class="row" style="margin-top:10px"><button class="btn gold sm" id="saveWish">Save wish</button><button class="btn sm" id="sendWish">💌 Send wish for acceptance</button></div><p class="small muted">Accepted wishes enter the Hall of Wishes. We accept the good ones — kind, clear, possible.</p>` },
    { t: "Farewell", h: `<h2>You discovered the story.</h2><p>The box is empty. The shelf is fuller. The wish is flying. <b>You chose the box — we created the mystery — you discovered the story.</b></p><a href="#/boxes">Choose another box →</a>` },
  ];
  return `<div class="row" style="margin-top:22px;justify-content:space-between"><a class="btn sm ghost" href="#/account">← My Account</a><span class="small muted">${o.id} · page <b id="pgN">1</b> / ${pages.length}</span></div>
  <div class="book" style="margin-top:10px"><div class="page" id="pg"></div>
  <div class="row"><button class="btn sm" id="prevP">← Prev</button><div class="sp"></div>${pages.map((p, i) => `<button class="btn sm ghost" data-pg="${i}">${p.t}</button>`).join("")}<div class="sp"></div><button class="btn sm" id="nextP">Next →</button></div></div>`;
}
function bindBook(orderId) {
  const pg = $("#pg"); if (!pg) return;
  const o = DB.orders.find(x => x.id === orderId); const total = 8; let i = 0;
  const html = (idx) => {
    const ch = charById(o.box.character.id); const st = storyById(o.box.story.id) || o.box.story;
    const pages = [
      `<div style="text-align:center;padding:30px 0"><div style="font-size:64px">${esc(ch.emoji || "📖")}</div><h2>${esc(st.title)}</h2><p> A ${esc(DB.tiers[o.tier].name)} Mystery · ${o.id}</p><span class="pill">✦ sealed · revealed ✦</span></div>`,
      `<h2>${esc(ch.emoji || "")} ${esc(ch.name)}</h2><p><span class="badge b-${ch.rarity}">${esc(ch.tradition || "")}</span> <span class="badge b-common">${esc(ch.category || "")}</span></p><p>${esc(ch.desc || "")}</p><p><b>Symbols:</b> ${esc((ch.symbols || []).join(" · "))}</p>`,
      `<h2>Cultural ground</h2><p>${esc(st.tradition || ch.tradition || "")} — told with reverence. Rarity describes your <i>print & edition</i>, never spiritual worth.</p>`,
      `<h2>${esc(st.title)}</h2><p>${esc(st.body || st.blurb || "")}</p><p><i>${esc(st.blurb || "")}</i></p>`,
      `<h2>Cards in this box</h2>${o.box.cards.map(c => `<p>🃏 <b>${esc(c.name)}</b> ${badge(c.sealedRarity || c.rarity)}<br><i>${esc(c.msg || "")}</i></p>`).join("")}`,
      `<h2>Products & collectibles</h2>${o.box.products.map(p => `<p>📦 <b>${esc(p.name)}</b> ${badge(p.sealedRarity || p.rarity)}${p.bonus ? " · BONUS" : ""}<br>${esc(p.desc || "")}</p>`).join("")}<p><b>Est. box value: ${money(o.box.estValue)}</b></p>`,
      `<h2>✍️ YOUR WISH</h2><p>Write it by hand on the physical card — and send it here so we can accept it.</p><div class="wishbox"><textarea class="inp" id="wishText" rows="4" style="background:transparent;border:none;color:#2b2118;font-family:Playfair Display,serif;font-size:18px" placeholder="Write your wish here…">${esc(o.wishText || "")}</textarea></div><div class="row" style="margin-top:10px"><button class="btn gold sm" id="saveWish">Save wish</button><button class="btn sm" id="sendWish">💌 Send wish for acceptance</button></div><p class="small">Accepted wishes enter the Hall of Wishes.</p>`,
      `<h2>You discovered the story.</h2><p>The box is empty. The shelf is fuller. The wish is flying.</p><p><b>You chose the box — we created the mystery — you discovered the story.</b></p>`
    ];
    return pages[idx];
  };
  const draw = () => { pg.innerHTML = html(i); $("#pgN").textContent = i + 1; bindWishBtns(); };
  const bindWishBtns = () => {
    const s = $("#saveWish"), sd = $("#sendWish");
    if (s) s.onclick = () => { o.wishText = $("#wishText").value; save(); toast("Wish saved on your card ✍️"); };
    if (sd) sd.onclick = () => {
      const t = $("#wishText").value.trim();
      if (!t) return toast("Write your wish first");
      o.wishText = t;
      DB.wishes.unshift({ id: uid("w"), orderId: o.id, userId: o.userId, text: t, status: "pending", note: "", createdAt: new Date().toISOString() });
      save(); toast("💌 Wish sent! Track it under My Account → Wishes");
    };
  };
  $("#prevP").onclick = () => { i = (i + total - 1) % total; draw(); };
  $("#nextP").onclick = () => { i = (i + 1) % total; draw(); };
  $$("[data-pg]").forEach(b => b.onclick = () => { i = +b.dataset.pg; draw(); });
  draw();
}

/* ----- admin ----- */
function vAdmin() {
  const u = me();
  if (!u || u.role !== "admin") return `<div class="card" style="margin-top:26px"><h2 class="serif">Admin Vault 🔐</h2><p class="muted">Login as admin@wish.com / admin123</p><a class="btn gold" href="#/auth">Login</a></div>`;
  const rev = DB.orders.reduce((s, o) => s + o.price, 0);
  return `<h1 class="serif" style="margin-top:26px">Admin Vault 🔐</h1>
  <div class="grid g4">
    <div class="stat"><span class="small muted">Revenue</span><b>${money(rev)}</b></div>
    <div class="stat"><span class="small muted">Orders</span><b>${DB.orders.length}</b></div>
    <div class="stat"><span class="small muted">Pending wishes</span><b>${DB.wishes.filter(w => w.status === "pending").length}</b></div>
    <div class="stat"><span class="small muted">Customers</span><b>${DB.users.filter(x => x.role === "customer").length}</b></div>
  </div>
  <div class="tabs">${["Orders", "Wishes", "Customers", "Characters", "Stories", "Catalog", "Odds", "Reset"].map((t, i) => `<button data-a="${t}" class="${i === 0 ? "on" : ""}">${t}</button>`).join("")}</div>
  <div id="aBody"></div>`;
}
function bindAdmin() {
  const body = $("#aBody"); if (!body) return;
  const show = (tab) => {
    $$("[data-a]").forEach(b => b.classList.toggle("on", b.dataset.a === tab));
    if (tab === "Orders") body.innerHTML = DB.orders.length ? `<div class="card"><table class="tbl"><tr><th>Order</th><th>Customer</th><th>Tier</th><th>Status</th><th>Sealed contents (admin only)</th><th></th></tr>${DB.orders.map(o => {
      const cust = DB.users.find(x => x.id === o.userId) || {}; const ch = charById(o.box.character.id);
      return `<tr><td><b>${o.id}</b><br><span class="small muted">${o.createdAt.slice(0, 10)} · ${money(o.price)}</span></td><td>${esc(cust.name || "?")}<br><span class="small muted">${esc(cust.email || "")}</span></td><td>${DB.tiers[o.tier].name}</td><td>${o.status}</td><td class="small">${ch.emoji} ${esc(ch.name)} · <i>${esc(o.box.story.title)}</i><br>${o.box.cards.map(c => esc(c.name)).join("; ")}<br>${o.box.products.map(p => esc(p.name)).join("; ")}</td><td><button class="btn sm" data-ao="${o.id}">Advance →</button></td></tr>`; }).join("")}</table></div>` : `<div class="card">No orders yet.</div>`;
    if (tab === "Wishes") { const ws = DB.wishes; body.innerHTML = ws.length ? ws.map(w => { const cust = DB.users.find(x => x.id === w.userId) || {}; return `<div class="card" style="margin-bottom:10px"><b>“${esc(w.text)}”</b><div class="small muted">${esc(cust.name || "")} · ${w.orderId} · ${w.createdAt.slice(0, 10)}</div><div class="row" style="margin-top:8px"><span class="badge ${w.status === "approved" ? "b-legendary" : w.status === "declined" ? "b-ultrarare" : "b-rare"}">${w.status.toUpperCase()}</span><input class="inp" style="max-width:260px" placeholder="Moderator note…" value="${esc(w.note || "")}" data-note="${w.id}"><button class="btn sm gold" data-ok="${w.id}">Accept ✓</button><button class="btn sm danger" data-no="${w.id}">Decline</button></div></div>`; }).join("") : `<div class="card">No wishes submitted. Wishes arrive after customers unbox & write them.</div>`; }
    if (tab === "Customers") body.innerHTML = `<div class="card"><table class="tbl"><tr><th>Name</th><th>Email</th><th>Orders</th><th>Joined</th></tr>${DB.users.map(x => `<tr><td>${esc(x.name)} ${x.role === "admin" ? "🔐" : ""}</td><td>${esc(x.email)}</td><td>${DB.orders.filter(o => o.userId === x.id).length}</td><td>${esc(x.joined || "")}</td></tr>`).join("")}</table></div>`;
    if (tab === "Characters") body.innerHTML = `<div class="card"><table class="tbl"><tr><th></th><th>Name</th><th>Tradition</th><th>Category</th><th>Rarity</th><th>Stock</th></tr>${DB.characters.map(c => `<tr><td>${c.emoji}</td><td><b>${esc(c.name)}</b></td><td>${esc(c.tradition)}</td><td>${esc(c.category)}</td><td>${badge(c.rarity)}</td><td>${DB.stock["ch_" + c.id] ?? 999}</td></tr>`).join("")}</table><p class="small muted">Seed catalog is fixed for the prototype; stock for figures lives under Catalog/Odds.</p></div>`;
    if (tab === "Stories") body.innerHTML = `<div class="card"><table class="tbl"><tr><th>Title</th><th>Tradition</th><th>Linked</th></tr>${DB.stories.map(s => `<tr><td><b>${esc(s.title)}</b><br><span class="small muted">${esc(s.blurb)}</span></td><td>${esc(s.tradition)}</td><td class="small">${(s.charIds || []).map(id => esc((charById(id) || {}).name || id)).join(", ")}</td></tr>`).join("")}</table></div>`;
    if (tab === "Catalog") body.innerHTML = `<div class="grid g2"><div class="card"><b>Products & inventory</b><table class="tbl"><tr><th>Item</th><th>Rarity</th><th>Stock</th><th></th></tr>${DB.products.map(p => `<tr><td>${esc(p.name)}<br><span class="small muted">${esc(p.type)} · ${p.tiers.join("/")}</span></td><td>${badge(p.rarity)}</td><td>${DB.stock[p.id] ?? 0}</td><td><button class="btn sm" data-plus="${p.id}">+10</button></td></tr>`).join("")}</table></div><div class="card"><b>Cards & inventory</b><table class="tbl"><tr><th>Card</th><th>Rarity</th><th>Stock</th><th></th></tr>${DB.cards.map(c => `<tr><td>${esc(c.name)}</td><td>${badge(c.rarity)}</td><td>${DB.stock[c.id] ?? 0}</td><td><button class="btn sm" data-plus="${c.id}">+10</button></td></tr>`).join("")}</table></div></div>`;
    if (tab === "Odds") body.innerHTML = `<div class="grid g3">${Object.values(DB.tiers).map(t => `<div class="card"><b>${t.name}</b><div class="small muted">${money(t.price)}</div>${["common", "rare", "epic", "legendary", "ultrarare"].map(k => `<label class="lbl">${R[k].label} %</label><input class="inp" type="number" step="0.5" value="${t.odds[k]}" data-odds="${t.id}:${k}">`).join("")}</div>`).join("")}</div><div style="height:10px"></div><button class="btn gold sm" id="saveOdds">Save rarity rules</button>`;
    if (tab === "Reset") body.innerHTML = `<div class="card"><h3>Danger zone</h3><p class="small muted">Restore seed catalog, odds, stock and demo accounts. Orders & wishes are cleared.</p><button class="btn danger sm" id="doReset">Reset demo data</button></div>`;

    $$("[data-ao]", body).forEach(b => b.onclick = () => { const o = DB.orders.find(x => x.id === b.dataset.ao); o.status = o.status === "paid" ? "packing" : o.status === "packing" ? "shipped" : "delivered"; if (o.status === "delivered") o.revealed = true; save(); toast(`${o.id} → ${o.status}`); show("Orders"); });
    $$("[data-ok]", body).forEach(b => b.onclick = () => { const w = DB.wishes.find(x => x.id === b.dataset.ok); w.status = "approved"; w.note = $(`[data-note="${w.id}"]`).value; save(); toast("Wish accepted into the Hall ✓"); show("Wishes"); });
    $$("[data-no]", body).forEach(b => b.onclick = () => { const w = DB.wishes.find(x => x.id === b.dataset.no); w.status = "declined"; w.note = $(`[data-note="${w.id}"]`).value; save(); toast("Wish declined"); show("Wishes"); });
    $$("[data-plus]", body).forEach(b => b.onclick = () => { DB.stock[b.dataset.plus] = (DB.stock[b.dataset.plus] || 0) + 10; save(); toast("Restocked +10"); show("Catalog"); });
    const so = $("#saveOdds"); if (so) so.onclick = () => { $$("[data-odds]").forEach(i => { const [t, k] = i.dataset.odds.split(":"); DB.tiers[t].odds[k] = parseFloat(i.value) || 0; }); save(); toast("Mystery rules saved"); };
    const dr = $("#doReset"); if (dr) dr.onclick = () => { DB = seedDB(); save(); toast("Demo data reset"); location.hash = "#/"; };
  };
  $$("[data-a]").forEach(b => b.onclick = () => show(b.dataset.a));
  show("Orders");
}

/* ---------- router ---------- */
function render() {
  const h = location.hash || "#/";
  const [_, path, arg] = h.split("/");
  const app = $("#app");
  window.scrollTo(0, 0);
  if (h.startsWith("#/book/")) { app.innerHTML = vBook(arg); bindBook(arg); paintNav("#/account"); return; }
  if (h.startsWith("#/checkout/")) { app.innerHTML = vCheckout(arg); bindCheckout(arg); paintNav("#/boxes"); return; }
  const routes = { "": vHome, boxes: vBoxes, open: vOpen, how: vHow, about: vAbout, auth: vAuth, account: vAccount, admin: vAdmin };
  const key = path === "" ? "" : path;
  app.innerHTML = (routes[key] || vHome)();
  paintNav(h === "#/" ? "#/" : "#/" + key);
  if (key === "open") bindOpen();
  if (key === "auth") bindAuth();
  if (key === "account") bindAccount();
  if (key === "admin") bindAdmin();
}
window.addEventListener("hashchange", render);
render();
