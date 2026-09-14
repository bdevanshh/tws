"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/boxes", label: "Mystery Boxes" },
  { href: "/#universe", label: "The Universe" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/unbox", label: "Unbox Demo" },
  { href: "/about", label: "About" },
];

function isActive(pathname: string, href: string) {
  if (href === "/boxes") return pathname === "/" || pathname.startsWith("/boxes");
  if (href.startsWith("/#")) return false;
  return pathname === href || pathname.startsWith(href + "/");
}

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 right-0 left-0 z-50 bg-surface-container-lowest/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 w-full max-w-[1280px] items-center justify-between px-gutter">
        <Link href="/" className="group flex items-center gap-space-sm text-left">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gold-burnished/50 bg-surface-vault shadow-[0_0_12px_rgba(212,175,55,0.2)] transition-all group-hover:border-gold-radiant group-hover:shadow-[0_0_20px_rgba(212,175,55,0.45)]">
            <span className="material-symbols-outlined text-[22px] text-gold-radiant">
              auto_awesome
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm font-bold tracking-wider text-gold-radiant uppercase leading-tight">
              The Wish Society
            </span>
            <span className="font-label-sm text-label-sm font-medium tracking-widest text-outline uppercase">
              Est. Mythos
            </span>
          </div>
        </Link>
        <nav className="hidden items-center gap-space-md font-label-md text-label-md tracking-wider uppercase lg:flex">
          {LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              aria-current={isActive(pathname, l.href) ? "page" : undefined}
              className={cn(
                "px-3 py-2 transition-colors",
                isActive(pathname, l.href)
                  ? "rounded-lg bg-surface-vault text-gold-radiant"
                  : "text-on-surface-variant hover:text-gold-radiant"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-space-sm">
          <Link
            href="/unbox"
            className="hidden items-center border border-gold-burnished/60 bg-surface-vault/60 px-4 py-2 font-label-md text-label-md tracking-wider text-gold-radiant uppercase shadow-[0_0_10px_rgba(212,175,55,0.15)] transition-all hover:bg-gold-burnished hover:text-on-primary sm:inline-flex"
          >
            Free Demo
          </Link>
          <Link
            href="/account"
            className="hidden items-center bg-gradient-to-b from-primary-container to-gold-burnished px-4 py-2 font-label-md text-label-md font-bold tracking-wider text-on-primary uppercase shadow-[0_2px_14px_rgba(212,175,55,0.3)] transition-all hover:brightness-110 sm:inline-flex"
          >
            Vault
          </Link>
          <Link
            href="/account"
            aria-label="My account"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary"
          >
            <span className="material-symbols-outlined text-[18px] text-on-primary">
              person
            </span>
          </Link>
        </div>
      </div>
      <div className="relative flex h-[1px] w-full items-center justify-center bg-gradient-to-r from-transparent via-gold-burnished/50 to-transparent">
        <div className="h-2.5 w-2.5 rotate-45 border border-gold-radiant bg-surface-vault shadow-[0_0_8px_rgba(245,215,127,0.7)]" />
      </div>
    </header>
  );
}
