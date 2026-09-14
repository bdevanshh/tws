import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const STEPS = [
  { n: "Step 1", h: "Choose", p: "Create an account, pick Regular / Medium / Premium. No wish is entered at checkout — the site never asks." },
  { n: "Step 2", h: "Order & pay", p: "Mock payment. The Mystery Engine instantly creates your sealed combination: character → story → cards → products → rarity checks → duplicate prevention." },
  { n: "Step 3", h: "We prepare", p: "Your physical box is packed: Mystery Book, cards, bookmark, art, surprise products, bonus." },
  { n: "Step 4", h: "Shipping", p: "Track packing → shipped → delivered in My Account." },
  { n: "Step 5", h: "Unbox & discover", p: "Meet your character. Read the story. Reveal cards and collectibles." },
  { n: "Step 6", h: "Wish", p: "Write your wish on the physical YOUR WISH card inside the book, submit it here. We accept the good ones." },
];

export default function HowPage() {
  return (
    <div className="py-10">
      <h1 className="font-serif text-4xl tracking-tight">How It Works</h1>
      <p className="mt-2 text-muted-foreground">Choose → Order → Wait → Receive → Unbox → Discover.</p>
      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STEPS.map((s) => (
          <Card key={s.n}>
            <CardContent className="p-6">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">{s.n}</div>
              <h3 className="mt-1.5 text-lg font-semibold">{s.h}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.p}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Button className="mt-6" asChild>
        <Link href="/boxes">
          Choose a box <ArrowRight size={15} />
        </Link>
      </Button>
    </div>
  );
}
