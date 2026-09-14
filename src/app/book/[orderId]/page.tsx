"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Lock, Send } from "lucide-react";
import { toast } from "sonner";
import { charOf, storyOf, uid, useStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RarityBadge, GOLD_BADGE_CLASS } from "@/components/rarity-badge";
import { money } from "@/components/tier-card";

const PAGE_NAMES = ["Cover", "The Soul", "Context", "The Story", "Cards", "Surprises", "Your Wish", "Farewell"];

export default function BookPage() {
  const params = useParams<{ orderId: string }>();
  const { db, user, patch } = useStore();
  const [page, setPage] = useState(0);
  const order = db.orders.find((o) => o.id === params.orderId);

  if (!user) {
    return (
      <div className="py-10">
        <p>
          Login required. <Link href="/auth" className="underline">Login →</Link>
        </p>
      </div>
    );
  }
  if (!order || order.userId !== user.id) {
    return (
      <div className="py-10">
        <p>Order not found.</p>
      </div>
    );
  }
  if (order.status !== "delivered") {
    return (
      <div className="py-10">
        <div className="sealed-stripes rounded-2xl border border-dashed border-primary/50 p-10 text-center">
          <Lock size={20} className="mx-auto text-primary" />
          <div className="mt-2 font-semibold">This book is sealed until delivery.</div>
          <Button size="sm" variant="outline" className="mt-4" asChild>
            <Link href="/account">Back to tracking</Link>
          </Button>
        </div>
      </div>
    );
  }

  const ch = charOf(db, order.box.character.id);
  const st = storyOf(db, order.box.story.id) ?? order.box.story;

  const saveWish = (text: string) => {
    patch((d) => {
      const o = d.orders.find((x) => x.id === order.id);
      if (o) o.wishText = text;
      return d;
    });
  };

  const sendWish = () => {
    const text = order.wishText.trim();
    if (!text) return toast.error("Write your wish first");
    patch((d) => {
      d.wishes.unshift({
        id: uid("w"),
        orderId: order.id,
        userId: order.userId,
        text,
        status: "pending",
        note: "",
        createdAt: new Date().toISOString(),
      });
      return d;
    });
    toast.success("💌 Wish sent! Track it under My Account → Wishes");
  };

  return (
    <div className="mx-auto max-w-3xl py-8">
      <div className="flex items-center justify-between gap-3">
        <Button size="sm" variant="ghost" asChild>
          <Link href="/account">
            <ArrowLeft size={14} /> My Account
          </Link>
        </Button>
        <span className="text-[13px] text-muted-foreground">
          {order.id} · page <strong className="text-foreground">{page + 1}</strong> / {PAGE_NAMES.length}
        </span>
      </div>

      <div key={page} className="pageTurn mt-4 rounded-2xl border bg-[#f5edd9] p-7 text-[#2b2118] shadow-2xl sm:min-h-[380px] sm:p-10 dark:bg-[#efe3c6]">
        {page === 0 && (
          <div className="py-8 text-center">
            <div className="text-6xl">{ch?.emoji ?? "📖"}</div>
            <h2 className="mt-3 font-serif text-3xl">{st.title}</h2>
            <p className="mt-1 text-[#6b5d43]">
              A {db.tiers[order.tier].name} Mystery · {order.id}
            </p>
            <Badge variant="outline" className={`mt-3 ${GOLD_BADGE_CLASS}`}>✦ sealed · revealed ✦</Badge>
          </div>
        )}
        {page === 1 && (
          <>
            <h2 className="font-serif text-3xl">{ch?.emoji} {ch?.name}</h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {ch && <RarityBadge rarity={ch.rarity} />}
              <Badge variant="outline">{ch?.tradition}</Badge>
              <Badge variant="outline">{ch?.category}</Badge>
            </div>
            <p className="mt-4 leading-relaxed">{ch?.desc}</p>
            <p className="mt-3"><strong>Symbols:</strong> {ch?.symbols.join(" · ")}</p>
          </>
        )}
        {page === 2 && (
          <>
            <h2 className="font-serif text-3xl">Cultural ground</h2>
            <p className="mt-4 leading-relaxed">
              {st.tradition} — told with reverence. Sacred figures are presented as believers
              honor them; myths as meaning-carrying stories; history as history. Rarity
              describes your <em>print &amp; edition</em>, never spiritual worth.
            </p>
          </>
        )}
        {page === 3 && (
          <>
            <h2 className="font-serif text-3xl">{st.title}</h2>
            <p className="mt-4 leading-relaxed">{st.body}</p>
            <p className="mt-3 italic text-[#6b5d43]">{st.blurb}</p>
          </>
        )}
        {page === 4 && (
          <>
            <h2 className="font-serif text-3xl">Cards in this box</h2>
            <div className="mt-4 flex flex-col gap-3">
              {order.box.cards.map((c) => (
                <p key={c.id} className="leading-relaxed">
                  🃏 <strong>{c.name}</strong> <RarityBadge rarity={c.sealedRarity ?? c.rarity} />
                  <br />
                  <em className="text-[#6b5d43]">{c.msg}</em>
                </p>
              ))}
            </div>
          </>
        )}
        {page === 5 && (
          <>
            <h2 className="font-serif text-3xl">Products &amp; collectibles</h2>
            <div className="mt-4 flex flex-col gap-3">
              {order.box.products.map((p) => (
                <p key={p.id} className="leading-relaxed">
                  📦 <strong>{p.name}</strong> <RarityBadge rarity={p.sealedRarity ?? p.rarity} />
                  {p.bonus ? " · BONUS" : ""}
                  <br />
                  <span className="text-[#6b5d43]">{p.desc}</span>
                </p>
              ))}
            </div>
            <p className="mt-4"><strong>Est. box value: {money(order.box.estValue)}</strong></p>
          </>
        )}
        {page === 6 && (
          <>
            <h2 className="font-serif text-3xl">✍️ YOUR WISH</h2>
            <p className="mt-2 text-[#6b5d43]">
              This mirrors the physical card in your box. Write it by hand there — and send it
              here so we can accept it.
            </p>
            <div className="mt-4 rounded-xl border-2 border-dashed border-[#a16207] bg-white/50 p-4">
              <Textarea
                rows={4}
                value={order.wishText}
                onChange={(e) => saveWish(e.target.value)}
                placeholder="Write your wish here…"
                className="border-none bg-transparent font-serif text-lg text-[#2b2118] placeholder:text-[#a8956c] focus-visible:ring-1"
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => toast.success("Wish saved on your card ✍️")}>
                Save wish
              </Button>
              <Button size="sm" variant="outline" onClick={sendWish}>
                <Send size={14} /> Send wish for acceptance
              </Button>
            </div>
            <p className="mt-2 text-sm text-[#6b5d43]">
              Accepted wishes enter the Hall of Wishes. We accept the good ones — kind, clear, possible.
            </p>
          </>
        )}
        {page === 7 && (
          <>
            <h2 className="font-serif text-3xl">You discovered the story.</h2>
            <p className="mt-4 leading-relaxed">
              The box is empty. The shelf is fuller. The wish is flying.
            </p>
            <p className="mt-2 font-semibold">
              You chose the box — we created the mystery — you discovered the story.
            </p>
            <Button className="mt-5" asChild>
              <Link href="/boxes">Choose another box →</Link>
            </Button>
          </>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)}>
          <ArrowLeft size={14} /> Prev
        </Button>
        <div className="flex-1" />
        <div className="hidden flex-wrap justify-center gap-1.5 md:flex">
          {PAGE_NAMES.map((n, i) => (
            <Button key={n} size="sm" variant={i === page ? "secondary" : "ghost"} onClick={() => setPage(i)}>
              {n}
            </Button>
          ))}
        </div>
        <div className="flex-1" />
        <Button size="sm" variant="outline" disabled={page === PAGE_NAMES.length - 1} onClick={() => setPage(page + 1)}>
          Next <ArrowRight size={14} />
        </Button>
      </div>
    </div>
  );
}
