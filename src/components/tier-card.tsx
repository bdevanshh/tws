import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RARITY_LABEL, RARITY_ORDER, type Tier, type TierId } from "@/lib/types";
import { cn } from "@/lib/utils";
import { GOLD_BADGE_CLASS, RARITY_BADGE_CLASS } from "./rarity-badge";

export function money(n: number) {
  return "$" + Number(n).toFixed(2);
}

const TIER_IMAGES: Record<TierId, { src: string; alt: string }> = {
  regular:
    {
      src: "/stitch/regular-box.jpg",
      alt: "Small carved wooden mystery chest with brass filigree and runic seal",
    },
  medium:
    {
      src: "/stitch/medium-box.jpg",
      alt: "Carved dark oak chest with brass hinges and glowing sigil",
    },
  premium:
    {
      src: "/stitch/premium-box.jpg",
      alt: "Velvet-lined obsidian tome box with gold and violet gemstones",
    },
};

export function TierCard({ tier, detail, className }: { tier: Tier; detail?: boolean; className?: string }) {
  const art = TIER_IMAGES[tier.id];
  return (
    <Card
      className={cn(
        "reliquary runic-hover relative flex flex-col overflow-hidden",
        tier.popular &&
          "reliquary-raised border-gold-radiant shadow-[0_0_36px_rgba(212,175,55,0.25)]",
        className
      )}
    >
      {tier.popular && (
        <Badge
          variant="outline"
          className={cn(
            GOLD_BADGE_CLASS,
            "absolute top-4 left-1/2 z-10 -translate-x-1/2 border-gold-radiant bg-primary-container text-[10px] text-background shadow-[0_0_12px_rgba(245,215,127,0.7)]"
          )}
        >
          <Star size={11} /> Most popular vessel
        </Badge>
      )}
      <div className="relative h-44 w-full overflow-hidden border-b border-gold-burnished/20">
        <Image
          src={art.src}
          alt={art.alt}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover opacity-85 transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-midnight via-transparent to-transparent" />
        <span className="absolute bottom-3 left-1/2 -translate-x-1/2 font-headline-sm text-gold-radiant drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
          {tier.name} Box
        </span>
      </div>
      <CardContent className="flex flex-1 flex-col gap-3 p-6">
        <div className="font-label-sm text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-burnished">
          {tier.tag}
        </div>
        <h3 className="font-headline-sm text-2xl text-parchment-text">{tier.name} Box</h3>
        <div className="text-4xl font-extrabold tracking-tight" style={{ color: tier.color }}>
          {money(tier.price)}
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{tier.desc}</p>
        {detail && (
          <>
            <div className="flex flex-wrap gap-1.5">
              {RARITY_ORDER.map((k) => (
                <Badge key={k} variant="outline" className={RARITY_BADGE_CLASS[k]}>
                  {RARITY_LABEL[k]} {tier.odds[k]}%
                </Badge>
              ))}
            </div>
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              Same tier, different fate — two {tier.name} buyers never receive the same
              combination. Contents stay sealed until delivery.
            </p>
          </>
        )}
        <div className="mt-auto flex gap-2 pt-2">
          <Button asChild className="flex-1">
            <Link href={`/checkout/${tier.id}`}>
              Choose {tier.name} <ArrowRight size={15} />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/unbox" aria-label="Try the free unbox demo">
              <Sparkles size={15} />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
