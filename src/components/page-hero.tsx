import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Consistent page header with staggered entrance. */
export function PageHero({
  kicker,
  title,
  sub,
  actions,
  className,
}: {
  kicker?: string;
  title: ReactNode;
  sub?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("py-10 sm:py-12", className)}>
      {kicker && (
        <div
          className="rise text-[11px] font-semibold uppercase tracking-[0.18em] text-primary"
          style={{ "--rd": "0ms" } as CSSProperties}
        >
          {kicker}
        </div>
      )}
      <h1
        className="rise mt-2 font-serif text-4xl tracking-tight sm:text-5xl"
        style={{ "--rd": "70ms" } as CSSProperties}
      >
        {title}
      </h1>
      {sub && (
        <p
          className="rise mt-2.5 max-w-2xl leading-relaxed text-muted-foreground"
          style={{ "--rd": "140ms" } as CSSProperties}
        >
          {sub}
        </p>
      )}
      {actions && (
        <div
          className="rise mt-5 flex flex-wrap gap-3"
          style={{ "--rd": "210ms" } as CSSProperties}
        >
          {actions}
        </div>
      )}
    </div>
  );
}
