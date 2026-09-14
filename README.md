# THE WISH SOCIETY — Next.js + shadcn Prototype

> You Choose the Box. We Create the Mystery. You Discover the Story.

Hypedrop-style mystery-box experience for world religions, mythology & cultural stories.
Built with **Next.js 16 (App Router)**, **Tailwind CSS v4**, **shadcn-style UI** (`src/components/ui`),
**lucide-react** icons and **sonner** toasts. Data persists in `localStorage` (prototype store).

## Run it

```bash
npm install
npm run dev      # → http://localhost:3000
npm run build    # production check (tsc + eslint clean)
```

## Demo accounts

| Role     | Email             | Password  |
| -------- | ----------------- | --------- |
| Customer | `customer@wish.com` | `wish123` |
| Admin    | `admin@wish.com`    | `admin123` |

## Routes

| Route | What |
|---|---|
| `/` | Hero, tiers, how-it-works strip, universe + live drops |
| `/boxes` | Regular / Medium / Premium with odds + fairness note |
| `/unbox` | Free 3D ritual demo: pick 2 padlocks → swipe the lid → slow reward reveal |
| `/how`, `/about` | Journey + brand story |
| `/auth` | Login / register (shadcn Tabs) |
| `/checkout/[tier]` | Mock payment. **Never asks for a wish** — by design |
| `/account` | Orders + tracking stepper, Bookshelf, Collection, Wishes, Profile |
| `/book/[orderId]` | 8-page digital Mystery Book incl. YOUR WISH writer + send-for-acceptance |
| `/admin` | Vault: stats, orders, wish moderation, customers, characters, stories, catalog restock, rarity odds, reset |

## Architecture

```
src/
  app/            routes (all client-rendered over the local store)
    book/[orderId]/ checkout/[tier]/
  components/
    ui/           shadcn primitives (button, card, badge, tabs, dialog, table…)
    tier-card.tsx rarity-badge.tsx site-header.tsx site-footer.tsx providers.tsx
  lib/
    types.ts      Tier, Character, Story, CardItem, Product, Order, Wish…
    data.ts       seed catalog (24 figures, 27 stories, cards, products)
    engine.ts     Mystery Engine: character → story → cards/products → rarity +
                  inventory rules → duplicate prevention → cultural grouping
    store.tsx     StoreProvider + localStorage persistence + order/wish actions
legacy-static/    the original zero-dependency static prototype (archived)
```

## Mystery Engine guarantees (tested)

- Same tier → different combinations · wish card always inside · story linked to
  character · premium tiers lift Legendary/Ultra odds.
