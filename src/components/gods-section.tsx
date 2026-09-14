"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useStore } from "@/lib/store";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { RarityBadge, GOLD_BADGE_CLASS } from "./rarity-badge";
import { Reveal } from "@/hooks/motion";

const PAGE_SIZE = 6;

export function GodsSection() {
  const { db } = useStore();
  const traditions = useMemo(
    () => [...new Set(db.characters.map((c) => c.tradition))].sort(),
    [db]
  );
  const [trad, setTrad] = useState("All");
  const [expanded, setExpanded] = useState(false);

  const list =
    trad === "All" ? db.characters : db.characters.filter((c) => c.tradition === trad);
  const visible = expanded ? list : list.slice(0, PAGE_SIZE);

  return (
    <section className="mt-6">
      <Card>
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                Who you might meet
              </div>
              <h2 className="mt-1.5 font-serif text-3xl tracking-tight">
                Gods, saints, tricksters & heroes
              </h2>
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Every box hides one of these souls — with their story, symbols and cards.
                Rarity describes the <em>edition</em>, never the faith.
              </p>
            </div>
            <Select
              value={trad}
              onValueChange={(v) => {
                setTrad(v);
                setExpanded(false);
              }}
            >
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Filter by tradition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All traditions ({db.characters.length})</SelectItem>
                {traditions.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t} ({db.characters.filter((c) => c.tradition === t).length})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {visible.map((c, i) => {
              const tales = db.stories.filter((s) => s.charIds.includes(c.id));
              return (
                <Reveal key={c.id} delay={(i % PAGE_SIZE) * 70} className="h-full">
                <div className="h-full rounded-2xl border bg-background/40 p-5 transition-transform duration-200 hover:-translate-y-0.5">
                  <div className="flex items-start gap-3">
                    <span className="text-4xl leading-none">{c.emoji}</span>
                    <div>
                      <div className="font-serif text-xl leading-tight">{c.name}</div>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        <Badge variant="outline" className={GOLD_BADGE_CLASS}>{c.tradition}</Badge>
                        <Badge variant="outline">{c.category}</Badge>
                        <RarityBadge rarity={c.rarity} />
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-[13.5px] leading-relaxed text-muted-foreground">
                    {c.desc}
                  </p>
                  <p className="mt-2.5 text-[12.5px]">
                    <span className="font-semibold">Symbols:</span>{" "}
                    <span className="text-muted-foreground">{c.symbols.join(" · ")}</span>
                  </p>
                  {tales.length > 0 && (
                    <p className="mt-1.5 text-[12.5px]">
                      <span className="font-semibold">Tales:</span>{" "}
                      <span className="text-muted-foreground">
                        {tales.map((t) => t.title).join(" · ")}
                      </span>
                    </p>
                  )}
                </div>
                </Reveal>
              );
            })}
          </div>

          <div className="mt-5 flex items-center gap-3">
            <span className="text-[13px] text-muted-foreground">
              Showing {visible.length} of {list.length}
            </span>
            {list.length > PAGE_SIZE && (
              <Button size="sm" variant="outline" onClick={() => setExpanded(!expanded)}>
                {expanded ? (
                  <>
                    Show less <ChevronUp size={14} />
                  </>
                ) : (
                  <>
                    Show all {list.length} <ChevronDown size={14} />
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
