"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, BookOpen, Lock } from "lucide-react";
import { toast } from "sonner";
import { charOf, nextStatus, useStore } from "@/lib/store";
import type { OrderStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { RarityBadge } from "@/components/rarity-badge";
import { money } from "@/components/tier-card";

const FLOW: { id: OrderStatus; label: string }[] = [
  { id: "paid", label: "Payment" },
  { id: "packing", label: "Mystery Engine" },
  { id: "shipped", label: "Shipped" },
  { id: "delivered", label: "Delivered" },
];

export default function AccountPage() {
  const { db, user, patch } = useStore();

  if (!user) {
    return (
      <div className="py-10">
        <Card className="mx-auto max-w-lg">
          <CardContent className="p-8 text-center">
            <Lock size={22} className="mx-auto text-primary" />
            <h2 className="mt-3 font-serif text-2xl">Login required</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Track orders, read digital books and submit wishes.
            </p>
            <Button className="mt-5" asChild>
              <Link href="/auth">Login / Register</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const orders = db.orders.filter((o) => o.userId === user.id);
  const delivered = orders.filter((o) => o.status === "delivered");
  const wishes = db.wishes.filter((w) => w.userId === user.id);
  const collected = delivered.flatMap((o) =>
    o.box.cards.map((c) => ({ ...c, order: o.id }))
  );

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
    toast.success(ns === "delivered" ? "📦 Delivered! Mystery revealed — open your book!" : `Order ${id} → ${ns}`);
  };

  return (
    <div className="py-10">
      <h1 className="font-serif text-4xl tracking-tight">
        My Account{" "}
        <span className="align-middle font-sans text-sm font-normal text-muted-foreground">
          · {user.name}
        </span>
      </h1>

      <Tabs defaultValue="orders" className="mt-6">
        <TabsList>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="books">Bookshelf</TabsTrigger>
          <TabsTrigger value="collection">Collection</TabsTrigger>
          <TabsTrigger value="wishes">Wishes</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          {orders.length ? (
            <div className="flex flex-col gap-3">
              {orders.map((o) => {
                const t = db.tiers[o.tier];
                const sealed = o.status !== "delivered";
                const ch = charOf(db, o.box.character.id);
                return (
                  <Card key={o.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <strong>
                          {o.id} · {t.name} Box · {money(o.price)}
                        </strong>
                        <Badge variant={o.status === "delivered" ? "legendary" : "rare"}>
                          {o.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="mt-4 flex">
                        {FLOW.map((s) => {
                          const done =
                            FLOW.findIndex((x) => x.id === s.id) <=
                            FLOW.findIndex((x) => x.id === o.status);
                          return (
                            <div key={s.id} className="flex-1 text-center text-[11.5px]">
                              <div
                                className={`mx-auto h-3 w-3 rounded-full border-2 ${
                                  done
                                    ? "border-primary bg-primary shadow-[0_0_10px_var(--color-primary)]"
                                    : "border-border bg-secondary"
                                }`}
                              />
                              <div className={`mt-1.5 ${done ? "text-primary" : "text-muted-foreground"}`}>
                                {s.label}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {sealed ? (
                        <div className="sealed-stripes mt-4 rounded-xl border border-dashed border-primary/50 p-5 text-center text-sm">
                          🔒 <strong>Sealed.</strong>{" "}
                          <span className="text-muted-foreground">
                            Contents hidden until delivery — that is the whole point.
                          </span>
                          <div className="mt-3">
                            <Button size="sm" variant="outline" onClick={() => advance(o.id)}>
                              Simulate next shipping step <ArrowRight size={14} />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          {o.box.topHit && <RarityBadge rarity={o.box.topHit.rarity} />}
                          <span className="text-sm">
                            Top hit: <strong>{o.box.topHit?.name}</strong> · {ch?.name} {ch?.emoji}
                          </span>
                          <Button size="sm" className="ml-auto" asChild>
                            <Link href={`/book/${o.id}`}>
                              <BookOpen size={14} /> Open digital Mystery Book
                            </Link>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center gap-3 p-6">
                No orders yet.
                <Button size="sm" asChild>
                  <Link href="/boxes">Choose a box →</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="books">
          {delivered.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {delivered.map((o) => {
                const ch = charOf(db, o.box.character.id);
                return (
                  <Card key={o.id}>
                    <CardContent className="p-6">
                      <div className="text-4xl">{ch?.emoji ?? "📖"}</div>
                      <div className="mt-2 font-semibold">{o.box.story.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {ch?.name} · {o.id}
                      </div>
                      <Button size="sm" className="mt-3" asChild>
                        <Link href={`/book/${o.id}`}>Read book →</Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                Your bookshelf unlocks on <strong className="text-foreground">delivery</strong>.
                Sealed orders can&apos;t be peeked.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="collection">
          {collected.length ? (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {collected.map((c, i) => (
                <Card
                  key={i}
                  style={{
                    borderColor: `color-mix(in srgb, var(--color-rarity-${c.sealedRarity ?? c.rarity}) 45%, transparent)`,
                  }}
                >
                  <CardContent className="p-4">
                    <div className="text-3xl">{charOf(db, c.charId ?? "")?.emoji ?? "🃏"}</div>
                    <div className="mt-1.5 text-[13px] font-semibold leading-snug">{c.name}</div>
                    <div className="mt-2">
                      <RarityBadge rarity={c.sealedRarity ?? c.rarity} />
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{c.order}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                No collectibles yet — they reveal at unboxing.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="wishes">
          {wishes.length ? (
            <div className="flex flex-col gap-3">
              {wishes.map((w) => (
                <Card key={w.id}>
                  <CardContent className="p-5">
                    <div className="font-serif text-lg">“{w.text}”</div>
                    <div className="mt-2.5 flex flex-wrap items-center gap-2">
                      <Badge
                        variant={
                          w.status === "approved" ? "legendary" : w.status === "declined" ? "ultrarare" : "rare"
                        }
                      >
                        {w.status.toUpperCase()}
                      </Badge>
                      <span className="text-[13px] text-muted-foreground">
                        {w.orderId}
                        {w.note ? ` · Note: ${w.note}` : ""}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                No wishes sent. Open a delivered book → write your wish → send it to us.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="profile">
          {user && (
            <ProfileForm
              key={user.id}
              userId={user.id}
              initialName={user.name}
              initialAddress={user.address}
              joined={user.joined}
              orderCount={orders.length}
            />
          )}
        </TabsContent>
      </Tabs>
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
    <Card className="max-w-xl">
      <CardContent className="space-y-4 p-6">
        <div className="space-y-2">
          <Label htmlFor="pn">Name</Label>
          <Input id="pn" value={pN} onChange={(e) => setPN(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pa">Address</Label>
          <Textarea id="pa" value={pA} onChange={(e) => setPA(e.target.value)} />
        </div>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
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
          >
            Save
          </Button>
          <span className="text-[13px] text-muted-foreground">
            Member since {joined} · {orderCount} orders
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
