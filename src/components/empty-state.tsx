import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "./ui/card";

/** Friendly placeholder for empty lists, shelves and queues. */
export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: LucideIcon;
  title: string;
  body?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-2 p-8 text-center sm:p-10">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Icon size={21} />
        </span>
        <div className="mt-1 font-serif text-xl">{title}</div>
        {body && <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{body}</p>}
        {action && <div className="mt-2.5">{action}</div>}
      </CardContent>
    </Card>
  );
}
