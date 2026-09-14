import { Badge } from "@/components/ui/badge";
import { RARITY_LABEL, type Rarity } from "@/lib/types";
import { cn } from "@/lib/utils";

export const RARITY_BADGE_CLASS: Record<Rarity, string> = {
  common: "border-rarity-common/50 text-rarity-common bg-rarity-common/10",
  rare: "border-rarity-rare/50 text-rarity-rare bg-rarity-rare/10",
  epic: "border-rarity-epic/50 text-rarity-epic bg-rarity-epic/10",
  legendary:
    "border-rarity-legendary/60 text-rarity-legendary bg-rarity-legendary/10",
  ultrarare:
    "border-rarity-ultrarare/60 text-rarity-ultrarare bg-rarity-ultrarare/10",
};

export const GOLD_BADGE_CLASS =
  "border-primary/50 text-primary bg-primary/10";

export function RarityBadge({ rarity, className }: { rarity: Rarity; className?: string }) {
  return (
    <Badge variant="outline" className={cn(RARITY_BADGE_CLASS[rarity], className)}>
      {RARITY_LABEL[rarity]}
    </Badge>
  );
}
