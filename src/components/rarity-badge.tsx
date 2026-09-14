import { Badge } from "@/components/ui/badge";
import { RARITY_LABEL, type Rarity } from "@/lib/types";

export function RarityBadge({ rarity, className }: { rarity: Rarity; className?: string }) {
  return (
    <Badge variant={rarity} className={className}>
      {RARITY_LABEL[rarity]}
    </Badge>
  );
}
