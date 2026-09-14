"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { CARDS, CHARACTERS, PRODUCTS, STORIES, TIERS } from "./data";
import { generateBox, type EngineDB } from "./engine";
import type { DB, Order, OrderStatus, TierId, User, WishStatus } from "./types";

const KEY = "tws_db_v2";
const uid = (p = "id") => `${p}_${Math.random().toString(36).slice(2, 8)}`;

function seedDB(): DB {
  const stock: Record<string, number> = {};
  [...CARDS, ...PRODUCTS].forEach((x) => (stock[x.id] = x.stock));
  CHARACTERS.forEach((c) => (stock["ch_" + c.id] = 999));
  return {
    users: [
      { id: "u_customer", name: "Aarav Sharma", email: "customer@wish.com", pass: "wish123", role: "customer", address: "221B Rosewood Lane, Mumbai", joined: "2026-06-02" },
      { id: "u_admin", name: "Wish Master", email: "admin@wish.com", pass: "admin123", role: "admin", address: "Vault 7, The Wish Society HQ", joined: "2026-01-01" },
    ],
    session: null,
    orders: [],
    wishes: [],
    tiers: JSON.parse(JSON.stringify(TIERS)),
    characters: JSON.parse(JSON.stringify(CHARACTERS)),
    stories: JSON.parse(JSON.stringify(STORIES)),
    cards: JSON.parse(JSON.stringify(CARDS)),
    products: JSON.parse(JSON.stringify(PRODUCTS)),
    stock,
    live: [
      { who: "Sofia · Spain", what: "Amaterasu — Return of Light", rarity: "legendary" },
      { who: "Arjun · India", what: "Shiva — Cosmic Dancer", rarity: "legendary" },
      { who: "Yuki · Japan", what: "Moon Festival Tea", rarity: "common" },
    ],
  };
}

function load(): DB {
  if (typeof window === "undefined") return seedDB();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DB;
      if (parsed?.users && parsed?.tiers) return parsed;
    }
  } catch {
    /* corrupted storage → reseed */
  }
  const db = seedDB();
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch {
    /* private mode — run in memory */
  }
  return db;
}

export const SOLD_OUT = "SOLD_OUT";

interface Store {
  db: DB;
  ready: boolean;
  user: User | null;
  patch: (fn: (db: DB) => DB) => void;
  placeOrder: (opts: { userId: string; tier: TierId; address: string; price: number }) => Order;
  reset: () => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<DB>(load);
  const [ready] = useState(true);
  // Synchronous read-mirror of state: updaters passed to setState run later
  // (React 19 concurrent rendering), so actions must never capture results
  // from inside an updater — seal first, commit second.
  const dbRef = useRef<DB>(db);
  useEffect(() => {
    dbRef.current = db;
  }, [db]);

  const patch = useCallback((fn: (db: DB) => DB) => {
    setDb((prev) => {
      const next = fn(structuredClone(prev));
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const placeOrder = useCallback(
    (opts: { userId: string; tier: TierId; address: string; price: number }): Order => {
      // 1. Seal synchronously from the latest snapshot.
      const snapshot = structuredClone(dbRef.current);
      const sellable =
        snapshot.cards.some((c) => c.tiers.includes(opts.tier) && (snapshot.stock[c.id] ?? 0) > 0) ||
        snapshot.products.some((p) => p.tiers.includes(opts.tier) && (snapshot.stock[p.id] ?? 0) > 0);
      if (!sellable) throw new Error(SOLD_OUT);
      const box = generateBox(opts.tier, engineInput(snapshot));
      const order: Order = {
        id: "WS-" + Math.floor(100000 + Math.random() * 900000),
        userId: opts.userId,
        tier: opts.tier,
        price: opts.price,
        status: "paid",
        createdAt: new Date().toISOString(),
        address: opts.address,
        last4: "4242",
        box,
        wishText: "",
        revealed: false,
      };
      // 2. Commit via functional update so this composes with any already-queued
      // update (e.g. guest account creation in the same checkout flow).
      setDb((prev) => {
        const next = structuredClone(prev);
        [...box.cards, ...box.products].forEach((it) => {
          if ((next.stock[it.id] ?? 0) > 0) next.stock[it.id]--;
        });
        next.orders.unshift(order);
        try {
          localStorage.setItem(KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
      return order;
    },
    []
  );

  const reset = useCallback(() => {
    const fresh = seedDB();
    try {
      localStorage.setItem(KEY, JSON.stringify(fresh));
    } catch {
      /* ignore */
    }
    setDb(fresh);
  }, []);

  const value = useMemo<Store>(() => {
    const user = db.users.find((u) => u.id === db.session) ?? null;
    return { db, ready, user, patch, placeOrder, reset };
  }, [db, ready, patch, placeOrder, reset]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used inside <StoreProvider>");
  return s;
}

/* ---------- domain actions ---------- */

export function engineInput(db: DB): EngineDB {
  return {
    tiers: db.tiers,
    characters: db.characters.map((c) => ({ ...c, stock: db.stock["ch_" + c.id] ?? 999 })),
    stories: db.stories,
    cards: db.cards.map((c) => ({ ...c, stock: db.stock[c.id] ?? 0 })),
    products: db.products.map((p) => ({ ...p, stock: db.stock[p.id] ?? 0 })),
  };
}

export function charOf(db: DB, id: string) {
  return db.characters.find((c) => c.id === id);
}

export function storyOf(db: DB, id: string) {
  return db.stories.find((s) => s.id === id);
}

export function nextStatus(s: OrderStatus): OrderStatus {
  return s === "paid" ? "packing" : s === "packing" ? "shipped" : "delivered";
}

export { uid };
export type { WishStatus };
