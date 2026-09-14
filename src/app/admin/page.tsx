"use client";

import Link from "next/link";
import { useState } from "react";
import { Inbox, Lock, PackageSearch, Plus } from "lucide-react";
import { toast } from "sonner";
import { charOf, nextStatus, useStore } from "@/lib/store";
import { RARITY_LABEL, RARITY_ORDER, type Rarity, type TierId } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { PageHero } from "@/components/page-hero";
import { useCountUp } from "@/hooks/motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RarityBadge, RARITY_BADGE_CLASS } from "@/components/rarity-badge";
import { money } from "@/components/tier-card";
import type { WishStatus } from "@/lib/store";

export default function AdminPage() {
  const { user } = useStore();

  if (!user || user.role !== "admin") {
    return (
      <div className="py-10">
        <Card className="mx-auto max-w-lg">
          <CardContent className="p-8 text-center">
            <Lock size={22} className="mx-auto text-primary" />
            <h2 className="mt-3 font-serif text-2xl">Admin Vault</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Login as admin@wish.com / admin123
            </p>
            <Button className="mt-5" asChild>
              <Link href="/auth">Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  return <VaultDashboard />;
}

function VaultDashboard() {
  const { db, patch, reset } = useStore();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [odds, setOdds] = useState<Record<string, number>>(() => {
    const o: Record<string, number> = {};
    (Object.keys(db.tiers) as TierId[]).forEach((t) =>
      RARITY_ORDER.forEach((k) => (o[`${t}:${k}`] = db.tiers[t].odds[k]))
    );
    return o;
  });

  const revenue = db.orders.reduce((s, o) => s + o.price, 0);
  const orderCount = db.orders.length;
  const pendingCount = db.wishes.filter((w) => w.status === "pending").length;
  const customerCount = db.users.filter((x) => x.role === "customer").length;
  const revAnim = useCountUp(revenue);
  const ordAnim = useCountUp(orderCount);
  const penAnim = useCountUp(pendingCount);
  const cusAnim = useCountUp(customerCount);
  const moderate = (id: string, status: WishStatus) => {
    patch((d) => {
      const w = d.wishes.find((x) => x.id === id);
      if (w) {
        w.status = status;
        w.note = notes[id] ?? "";
      }
      return d;
    });
    toast.success(status === "approved" ? "Wish accepted into the Hall ✓" : "Wish declined");
  };

  return (
    <div className="pb-10">
      <PageHero kicker="Control room" title="Admin Vault 🔐" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Revenue", money(revAnim)],
          ["Orders", String(Math.round(ordAnim))],
          ["Pending wishes", String(Math.round(penAnim))],
          ["Customers", String(Math.round(cusAnim))],
        ].map(([k, v]) => (
          <Card key={k}>
            <CardContent className="p-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{k}</div>
              <div className="mt-1 text-2xl font-extrabold">{v}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="orders" className="mt-6">
        <TabsList className="flex-wrap">
          {["orders", "wishes", "customers", "characters", "stories", "catalog", "odds", "reset"].map((t) => (
            <TabsTrigger key={t} value={t} className="capitalize">{t}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="orders">
          <Card>
            <CardContent className="p-0">
              {db.orders.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sealed contents (admin only)</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {db.orders.map((o) => {
                      const cust = db.users.find((x) => x.id === o.userId) ?? {};
                      const ch = charOf(db, o.box.character.id);
                      return (
                        <TableRow key={o.id}>
                          <TableCell>
                            <strong>{o.id}</strong>
                            <div className="text-xs text-muted-foreground">
                              {o.createdAt.slice(0, 10)} · {money(o.price)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {(cust as { name?: string }).name ?? "?"}
                            <div className="text-xs text-muted-foreground">
                              {(cust as { email?: string }).email ?? ""}
                            </div>
                          </TableCell>
                          <TableCell>{db.tiers[o.tier].name}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={o.status === "delivered" ? RARITY_BADGE_CLASS.legendary : RARITY_BADGE_CLASS.rare}
                            >
                              {o.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-sm text-[13px]">
                            {ch?.emoji} {ch?.name} · <em>{o.box.story.title}</em>
                            <div className="text-muted-foreground">
                              {o.box.cards.map((c) => c.name).join("; ")}
                            </div>
                            <div className="text-muted-foreground">
                              {o.box.products.map((p) => p.name).join("; ")}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                patch((d) => {
                                  const ord = d.orders.find((x) => x.id === o.id);
                                  if (ord) {
                                    ord.status = nextStatus(ord.status);
                                    if (ord.status === "delivered") ord.revealed = true;
                                  }
                                  return d;
                                });
                                toast.success(`${o.id} advanced`);
                              }}
                            >
                              Advance →
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <EmptyState
                  icon={PackageSearch}
                  title="No orders yet"
                  body="New sealed orders will land here with their hidden contents revealed to you."
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wishes">
          {db.wishes.length ? (
            <div className="flex flex-col gap-3">
              {db.wishes.map((w) => {
                const cust = db.users.find((x) => x.id === w.userId);
                return (
                  <Card key={w.id}>
                    <CardContent className="p-5">
                      <div className="font-serif text-lg">“{w.text}”</div>
                      <div className="mt-1 text-[13px] text-muted-foreground">
                        {cust?.name} · {w.orderId} · {w.createdAt.slice(0, 10)}
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Badge
                          variant="outline"
                          className={
                            w.status === "approved"
                              ? RARITY_BADGE_CLASS.legendary
                              : w.status === "declined"
                                ? RARITY_BADGE_CLASS.ultrarare
                                : RARITY_BADGE_CLASS.rare
                          }
                        >
                          {w.status.toUpperCase()}
                        </Badge>
                        <Input
                          className="max-w-64"
                          placeholder="Moderator note…"
                          value={notes[w.id] ?? w.note}
                          onChange={(e) => setNotes({ ...notes, [w.id]: e.target.value })}
                        />
                        <Button size="sm" onClick={() => moderate(w.id, "approved")}>
                          Accept ✓
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => moderate(w.id, "declined")}>
                          Decline
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={Inbox}
              title="Wish queue is clear"
              body="Wishes arrive after customers unbox and write them. Good ones earn a place in the Hall."
            />
          )}
        </TabsContent>

        <TabsContent value="customers">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {db.users.map((x) => (
                    <TableRow key={x.id}>
                      <TableCell>
                        {x.name} {x.role === "admin" ? "🔐" : ""}
                      </TableCell>
                      <TableCell>{x.email}</TableCell>
                      <TableCell>{db.orders.filter((o) => o.userId === x.id).length}</TableCell>
                      <TableCell>{x.joined}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="characters">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead />
                    <TableHead>Name</TableHead>
                    <TableHead>Tradition</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Rarity</TableHead>
                    <TableHead>Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {db.characters.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="text-xl">{c.emoji}</TableCell>
                      <TableCell><strong>{c.name}</strong></TableCell>
                      <TableCell>{c.tradition}</TableCell>
                      <TableCell>{c.category}</TableCell>
                      <TableCell><RarityBadge rarity={c.rarity} /></TableCell>
                      <TableCell>{db.stock["ch_" + c.id] ?? 999}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stories">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Tradition</TableHead>
                    <TableHead>Linked</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {db.stories.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <strong>{s.title}</strong>
                        <div className="text-xs text-muted-foreground">{s.blurb}</div>
                      </TableCell>
                      <TableCell>{s.tradition}</TableCell>
                      <TableCell className="text-[13px]">
                        {s.charIds.map((id) => charOf(db, id)?.name ?? id).join(", ")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="catalog">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardContent className="p-6">
                <strong>Products &amp; inventory</strong>
                <div className="mt-3">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Rarity</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {db.products.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>
                            {p.name}
                            <div className="text-xs text-muted-foreground">
                              {p.type} · {p.tiers.join("/")}
                            </div>
                          </TableCell>
                          <TableCell><RarityBadge rarity={p.rarity} /></TableCell>
                          <TableCell>{db.stock[p.id] ?? 0}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                patch((d) => {
                                  d.stock[p.id] = (d.stock[p.id] ?? 0) + 10;
                                  return d;
                                });
                                toast.success("Restocked +10");
                              }}
                            >
                              <Plus size={14} /> 10
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <strong>Cards &amp; inventory</strong>
                <div className="mt-3">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Card</TableHead>
                        <TableHead>Rarity</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {db.cards.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell>{c.name}</TableCell>
                          <TableCell><RarityBadge rarity={c.rarity} /></TableCell>
                          <TableCell>{db.stock[c.id] ?? 0}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                patch((d) => {
                                  d.stock[c.id] = (d.stock[c.id] ?? 0) + 10;
                                  return d;
                                });
                                toast.success("Restocked +10");
                              }}
                            >
                              <Plus size={14} /> 10
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="odds">
          <div className="grid gap-4 md:grid-cols-3">
            {(Object.keys(db.tiers) as TierId[]).map((t) => (
              <Card key={t}>
                <CardContent className="p-6">
                  <strong>{db.tiers[t].name}</strong>
                  <div className="text-sm text-muted-foreground">{money(db.tiers[t].price)}</div>
                  {RARITY_ORDER.map((k: Rarity) => (
                    <div key={k} className="mt-3 space-y-1.5">
                      <Label>{RARITY_LABEL[k]} %</Label>
                      <Input
                        type="number"
                        step="0.5"
                        value={odds[`${t}:${k}`] ?? 0}
                        onChange={(e) =>
                          setOdds({ ...odds, [`${t}:${k}`]: parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
          <Button
            className="mt-4"
            size="sm"
            onClick={() => {
              patch((d) => {
                (Object.keys(d.tiers) as TierId[]).forEach((t) =>
                  RARITY_ORDER.forEach((k) => {
                    d.tiers[t].odds[k] = odds[`${t}:${k}`] ?? d.tiers[t].odds[k];
                  })
                );
                return d;
              });
              toast.success("Mystery rules saved");
            }}
          >
            Save rarity rules
          </Button>
        </TabsContent>

        <TabsContent value="reset">
          <Card className="max-w-xl">
            <CardContent className="p-6">
              <h3 className="font-semibold">Danger zone</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Restore seed catalog, odds, stock and demo accounts. Orders &amp; wishes are cleared.
              </p>
              <Button
                size="sm"
                variant="destructive"
                className="mt-4"
                onClick={() => {
                  reset();
                  toast.success("Demo data reset");
                }}
              >
                Reset demo data
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
