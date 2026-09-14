# THE WISH SOCIETY — Working Prototype

> You Choose the Box. We Create the Mystery. You Discover the Story.

Hypedrop-style mystery-box experience for world religions, mythology & cultural stories.

## Run it (no build step)

```bash
cd /home/devansh/Code/Projects/tws
python3 -m http.server 8080
# open http://localhost:8080
```

Or with node:

```bash
npx serve .
```

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Customer | `customer@wish.com` | `wish123` |
| Admin | `admin@wish.com` | `admin123` |

You can also Register a new account from the site.

## What the prototype covers (PRD-mapped)

- **Tiers only, no content selection** — Regular / Medium / Premium. Same tier → different combinations.
- **Mystery Engine** (`assets/engine.js`) — controlled randomness: tier odds → character pool → story/card/product pools → rarity + inventory rules → duplicate prevention → cultural grouping → final sealed combination.
- **Hypedrop-style unbox simulator** — free demo spinner with live drop feed + provably-hidden outcome.
- **Full customer journey** — browse → login → checkout (mock pay) → engine seals box → packing → shipping → delivered → physical unbox reveal → digital Mystery Book → YOUR WISH card (written *after* delivery, never at checkout) → submit wish → cards/products/collectibles.
- **Wish flow** — customer writes wish in the book, submits photo/text; admin Approves / Declines with note; customer sees status in My Account.
- **My Account** — profile, addresses, orders + tracking timeline, digital bookshelf, collectibles binder, wishes.
- **Admin** — revenue/orders chart, orders (reveal sealed contents, advance status), wish moderation, customers, characters, stories, products, cards, inventory, rarity odds editor, reset demo data.
- **Master database seed** (`assets/data.js`) — 24 characters across Indian, Sikh, Buddhist, Jain, Christian, Islamic, Chinese, Greek, Roman, Norse, Egyptian, Japanese traditions + stories, cards, products. Respectful labeling of deity / sacred figure / mythological / cultural / historical.

## Files

```
index.html          SPA shell + all views
assets/styles.css   theme
assets/data.js      TIERS, CHARACTERS, STORIES, CARDS, PRODUCTS, rarity odds
assets/engine.js    Mystery Engine (pure functions, testable)
assets/app.js       store (localStorage), router, views, checkout, book, admin
```

## Reset

Admin → Settings → Reset demo data. Or clear `tws_db_v1` in localStorage.
