import Link from "next/link";
import Image from "next/image";

export function SiteFooter() {
  return (
    <footer className="w-full border-t border-outline-variant/30 bg-surface-container-lowest text-on-surface-variant">
      <div className="relative flex h-[1px] w-full items-center justify-center bg-gradient-to-r from-transparent via-gold-burnished/40 to-transparent">
        <div className="h-2 w-2 rotate-45 border border-gold-burnished/80 bg-surface-container-lowest" />
      </div>
      <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-space-lg px-gutter py-space-xl text-center">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-gold-burnished/40 bg-surface-vault shadow-[0_0_16px_rgba(212,175,55,0.2)]">
          <Image
            src="/logo.jpeg"
            alt="The Wish Society logo"
            width={48}
            height={48}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex max-w-xl flex-col gap-space-xs">
          <p className="font-headline-sm text-headline-sm font-normal tracking-wide text-parchment-text italic">
            “You Choose the Box. We Create the Mystery. You Discover the Story.”
          </p>
          <span className="font-label-sm text-label-sm tracking-widest text-outline uppercase">
            Controlled Arcane Dispersion Engine
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-label-md text-label-md tracking-wider text-outline uppercase">
          <Link className="transition-colors hover:text-gold-radiant" href="/about">
            Mystery Rules
          </Link>
          <span className="text-outline-variant">•</span>
          <Link className="transition-colors hover:text-gold-radiant" href="/unbox">
            Controlled Random Mystery Engine
          </Link>
          <span className="text-outline-variant">•</span>
          <Link className="transition-colors hover:text-gold-radiant" href="/boxes">
            Cultural Archives
          </Link>
          <span className="text-outline-variant">•</span>
          <Link className="transition-colors hover:text-gold-radiant" href="/about">
            Terms & Privacy
          </Link>
        </div>
        <div className="w-full border-t border-surface-container-highest/60 pt-space-sm font-body-sm text-body-sm text-outline">
          © 2026 The Wish Society. Bound by the Lexicon of Vaults. All sacred rights reserved.
        </div>
      </div>
    </footer>
  );
}
