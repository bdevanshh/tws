"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Eye, Gift, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/boxes", label: "Mystery Boxes" },
  { href: "/unbox", label: "Unbox Demo" },
  { href: "/about", label: "About" },
  { href: "/account", label: "My Account" },
  { href: "/admin", label: "Admin" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, patch } = useStore();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 font-extrabold tracking-wide">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-gold-soft to-primary shadow-[0_0_24px_-4px_var(--color-primary)]">
            <Eye className="h-4.5 w-4.5 text-primary-foreground" size={18} />
          </span>
          <span className="text-[15px]">
            THE WISH <span className="gold-text">SOCIETY</span>
          </span>
        </Link>
        <nav className="ml-2 hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-lg px-3 py-1.5 text-[13.5px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                pathname === l.href && "bg-accent text-foreground"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex-1" />
        {user && (
          <span className="hidden text-[13px] text-muted-foreground md:inline">
            {user.name} · {user.role}
          </span>
        )}
        <Button size="sm" variant="outline" asChild>
          <Link href="/unbox" aria-label="Try the free unbox demo">
            <Gift size={15} /> <span className="hidden sm:inline">Free Demo</span>
          </Link>
        </Button>
        {user ? (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              patch((db) => ({ ...db, session: null }));
              toast("Logged out");
              router.push("/");
            }}
          >
            <LogOut size={15} /> Logout
          </Button>
        ) : (
          <Button size="sm" asChild>
            <Link href="/auth">Login</Link>
          </Button>
        )}
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t px-4 py-1.5 lg:hidden">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "whitespace-nowrap rounded-lg px-3 py-1.5 text-[13px] text-muted-foreground hover:bg-accent hover:text-foreground",
              pathname === l.href && "bg-accent text-foreground"
            )}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
