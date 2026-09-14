"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { SOLD_OUT, uid, useStore } from "@/lib/store";
import type { TierId } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RarityBadge } from "@/components/rarity-badge";
import { money } from "@/components/tier-card";
import { RARITY_LABEL, RARITY_ORDER } from "@/lib/types";

export default function CheckoutPage() {
  const params = useParams<{ tier: string }>();
  const tierId = params.tier as TierId;
  const { db, user, patch, placeOrder } = useStore();
  const router = useRouter();
  const tier = db.tiers[tierId];
  const [paying, setPaying] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [address, setAddress] = useState(user?.address ?? "");

  if (!tier) {
    return (
      <div className="py-10">
        <p>
          Unknown tier. <Link href="/boxes" className="underline">Back to boxes</Link>
        </p>
      </div>
    );
  }

  const pay = () => {
    if (!name.trim() || !email.trim() || !address.trim())
      return toast.error("Name, email and address are required");
    if (paying) return;
    setPaying(true);
    setTimeout(() => {
      let userId = user?.id;
      if (!user) {
        const e = email.trim().toLowerCase();
        const existing = db.users.find((x) => x.email === e);
        userId = existing?.id ?? uid("u");
        const uname = name.trim();
        const uaddr = address.trim();
        patch((d) => {
          if (!d.users.some((x) => x.email === e)) {
            d.users.push({
              id: userId as string,
              name: uname,
              email: e,
              pass: "wish123",
              role: "customer",
              address: uaddr,
              joined: new Date().toISOString().slice(0, 10),
            });
          }
          const u = d.users.find((x) => x.id === userId);
          if (u) {
            u.address = uaddr;
            u.name = uname;
          }
          d.session = userId as string;
          return d;
        });
      } else {
        patch((d) => {
          const u = d.users.find((x) => x.id === user?.id);
          if (u) {
            u.address = address.trim();
            u.name = name.trim();
          }
          return d;
        });
      }
      try {
        const order = placeOrder({
          userId: userId as string,
          tier: tierId,
          address: address.trim(),
          price: tier.price,
        });
        toast.success(`Payment accepted — mystery sealed! (${order.id})`);
        router.push("/account");
      } catch (err) {
        setPaying(false);
        toast.error(
          err instanceof Error && err.message === SOLD_OUT
            ? "This tier just sold out — try another"
            : "Something went wrong sealing your box — please retry"
        );
      }
    }, 1100);
  };

  return (
    <div className="py-10">
      <h1 className="font-serif text-4xl tracking-tight">Checkout — {tier.name} Box</h1>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="rounded-xl border border-primary/40 bg-primary/5 p-4 text-sm leading-relaxed">
              <strong>No wish here — by design.</strong>{" "}
              <span className="text-muted-foreground">
                This site <strong className="text-foreground">never asks for your wish at
                checkout</strong>. Your blank YOUR WISH card travels <em>inside</em> the
                physical book. You write it after unboxing.
              </span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cn">Full name</Label>
              <Input id="cn" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ce">Email</Label>
              <Input id="ce" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ca">Delivery address</Label>
              <Textarea id="ca" rows={2} value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cc">Card (mock — use 4242…)</Label>
              <Input id="cc" defaultValue="4242 4242 4242 4242" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Expiry</Label>
                <Input defaultValue="12/28" />
              </div>
              <div className="space-y-2">
                <Label>CVC</Label>
                <Input defaultValue="123" />
              </div>
            </div>
            <Button onClick={pay} disabled={paying} className="w-full" size="lg">
              <Lock size={15} /> {paying ? "Sealing your mystery…" : `Pay ${money(tier.price)} — seal my mystery`}
            </Button>
            {!user && (
              <p className="text-[13px] text-muted-foreground">
                An account will be created for tracking.
              </p>
            )}
          </CardContent>
        </Card>
        <div className="flex flex-col gap-4">
          <Card className={tier.popular ? "border-primary/60" : ""}>
            <CardContent className="p-6">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                {tier.tag}
              </div>
              <h2 className="mt-1 font-serif text-2xl">
                {tier.name} Box — {money(tier.price)}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">{tier.desc}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {RARITY_ORDER.map((k) => (
                  <RarityBadge key={k} rarity={k} />
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5 text-[12px] text-muted-foreground">
                {RARITY_ORDER.map((k) => (
                  <span key={k} className="rounded-full border px-2.5 py-0.5">
                    {RARITY_LABEL[k]} {tier.odds[k]}%
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
          <div className="sealed-stripes rounded-2xl border border-dashed border-primary/50 p-7 text-center">
            <Lock size={18} className="mx-auto text-primary" />
            <div className="mt-2 font-semibold">Sealed until delivery.</div>
            <div className="mt-1 text-sm text-muted-foreground">
              Character ? · Story ? · {tier.contents.cards} cards ? · surprises ? · bonus ?
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
