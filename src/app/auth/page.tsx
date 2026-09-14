"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { uid, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const PRIVILEGES = [
  {
    icon: "inventory_2",
    iconColor: "text-gold-radiant",
    title: "Sealed Physical Dispatches",
    chip: "Live GPS",
    chipClass: "text-gold-radiant",
    body: "Receive unboxable artifact crates wrapped in parchment and wax seals. Monitor their ceremonial transit with live cryptographic tracking from warehouse sanctuary to doorstep.",
  },
  {
    icon: "menu_book",
    iconColor: "text-rarity-epic",
    title: "Digital Grimoire Bookshelf",
    chip: "Audio Lore",
    chipClass: "text-rarity-epic",
    body: "Access your personal unlocked library of illustrated chronicles, cultural origin scrolls, and symphonic ambient soundscapes accompanying every unboxed item.",
  },
  {
    icon: "style",
    iconColor: "text-rarity-rare",
    title: "Collectibles & Wish Status",
    chip: "Tier Binder",
    chipClass: "text-rarity-rare",
    body: "Inspect your 3D digital collector shelf cataloging artifacts from Common to Mythic editions. Track wish token yields and upcoming box drop lotteries.",
  },
  {
    icon: "shield_person",
    iconColor: "text-ember-glow",
    title: "Vault Curator Access",
    chip: "Command",
    chipClass: "text-ember-glow",
    body: "Curators and archivists access the full control room: configure crate drop odds, manage cultural provenance metadata, and oversee archival deliveries.",
  },
];

export default function AuthPage() {
  const { db, patch } = useStore();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("customer@wish.com");
  const [pass, setPass] = useState("wish123");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const [alert, setAlert] = useState<{ title: string; desc: string } | null>(null);

  const fillCredentials = (e: string, p: string, role: string) => {
    setMode("login");
    setEmail(e);
    setPass(p);
    setAlert({
      title: `${role} Credentials Applied`,
      desc: `Key tokens channeled for ${e}. Press Enter The Society to proceed.`,
    });
    window.setTimeout(() => setAlert(null), 4000);
  };

  const submit = () => {
    const em = email.trim().toLowerCase();
    if (mode === "register") {
      if (!name.trim() || !em || !pass) {
        toast.error("Fill all fields");
        return;
      }
      if (db.users.some((x) => x.email === em)) {
        toast.error("Email already registered");
        return;
      }
      const id = uid("u");
      patch((d) => {
        d.users.push({
          id,
          name: name.trim(),
          email: em,
          pass,
          role: "customer",
          address: "",
          joined: new Date().toISOString().slice(0, 10),
        });
        d.session = id;
        return d;
      });
      setAlert({
        title: "Covenant Inscribed!",
        desc: "Welcome Seeker. Manifesting your Digital Grimoire & Binder...",
      });
      toast.success("Account created — choose your box!");
      window.setTimeout(() => router.push("/boxes"), 900);
      return;
    }
    const u = db.users.find((x) => x.email === em && x.pass === pass);
    if (!u) {
      toast.error("Invalid credentials");
      return;
    }
    patch((d) => ({ ...d, session: u.id }));
    if (u.role === "admin") {
      setAlert({
        title: "Vault Seal Disengaged",
        desc: "Salutations Curator. Channeling direct access to Admin Control Room...",
      });
    } else {
      setAlert({
        title: "Sanctuary Gates Unlocked",
        desc: "Welcome Seeker. Manifesting your Digital Grimoire & Binder...",
      });
    }
    toast.success(`Welcome back, ${u.name}`);
    window.setTimeout(
      () => router.push(u.role === "admin" ? "/admin" : "/account"),
      900
    );
  };

  const tabBtn = (active: boolean) =>
    active
      ? "py-2.5 px-3 rounded-md bg-surface-vault text-gold-radiant font-label-md text-label-md font-bold uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2"
      : "py-2.5 px-3 rounded-md text-on-surface-variant hover:text-gold-radiant font-label-md text-label-md font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2";

  return (
    <div className="pb-10 text-on-surface">
      {/* Subtle Ambient Arcane Background Elements */}
      <div className="pointer-events-none absolute top-24 left-1/2 -z-10 h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-gradient-to-b from-primary-container/10 via-ember-glow/5 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute top-96 -left-48 -z-10 h-96 w-96 rounded-full bg-rarity-epic/5 blur-3xl" />
      <div className="pointer-events-none absolute top-[680px] -right-48 -z-10 h-96 w-96 rounded-full bg-secondary-container/5 blur-3xl" />

      {/* Main Ritual Authentication Conduit */}
      <section className="mx-auto flex w-full max-w-[1280px] flex-col items-center px-gutter py-space-lg">
        {/* Top Arcane Header & Title Badge */}
        <div className="mx-auto mb-space-md flex max-w-xl flex-col items-center text-center">
          <div className="mb-space-sm inline-flex items-center gap-space-xs rounded-full bg-surface-container-high px-3 py-1 shadow-md">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold-radiant" />
            <span className="font-label-sm text-label-sm font-semibold tracking-widest text-gold-radiant uppercase">
              Covenant Gate • Sector VII
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg font-bold tracking-tight text-parchment-text">
            Welcome, Seeker
          </h1>
          <p className="font-body-md text-body-md mt-space-xs max-w-md text-parchment-muted">
            Cross the threshold into our arcane archive. Present your credentials
            to unlock sealed dispatches, cultural tomes, and rarity reliquaries.
          </p>
        </div>

        {/* Centered Grimoire Authentication Card */}
        <div className="relative w-full max-w-[540px]">
          {/* Outer Glow & Filigree Layering */}
          <div className="pointer-events-none absolute -inset-1 rounded-xl bg-gradient-to-b from-gold-burnished/20 via-surface-vault/40 to-gold-burnished/10 blur-sm" />
          <div className="relative flex w-full flex-col gap-space-md rounded-xl bg-surface-midnight p-6 shadow-2xl sm:p-8">
            {/* Arcane Seal Icon & Keystone */}
            <div className="flex flex-col items-center">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-surface-vault shadow-xl">
                <span className="material-symbols-outlined text-[32px] text-gold-radiant drop-shadow-[0_0_12px_rgba(245,215,127,0.65)]">
                  key_vertical
                </span>
                <div className="absolute -top-1 h-2 w-2 rotate-45 bg-gold-radiant shadow-[0_0_8px_rgba(245,215,127,0.8)]" />
                <div className="absolute -bottom-1 h-2 w-2 rotate-45 bg-gold-radiant shadow-[0_0_8px_rgba(245,215,127,0.8)]" />
              </div>
              <span className="font-label-sm text-label-sm mt-3 tracking-widest text-outline uppercase">
                Sanctuary Keyhole
              </span>
            </div>

            {/* Mode Toggle Tabs */}
            <div className="grid w-full grid-cols-2 gap-1 rounded-lg bg-surface-container-lowest p-1 shadow-inner">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={tabBtn(mode === "login")}
              >
                <span className="material-symbols-outlined text-[16px]">lock_open</span>
                Seeker Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={tabBtn(mode === "register")}
              >
                <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
                Initiate Account
              </button>
            </div>

            {/* Demo Quick Credentials Conduit */}
            <div className="flex w-full flex-col gap-2 rounded-lg bg-surface-container-low p-3.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm flex items-center gap-1.5 font-semibold tracking-wider text-gold-burnished uppercase">
                  <span className="material-symbols-outlined text-[15px]">flash_on</span>
                  Sanctioned Demo Credentials
                </span>
                <span className="font-label-sm text-label-sm text-parchment-muted">
                  Click to invoke
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => fillCredentials("customer@wish.com", "wish123", "Seeker")}
                  className="group flex w-full flex-col gap-0.5 rounded bg-surface-container-high p-2 text-left transition-all hover:bg-surface-vault"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm font-bold text-gold-radiant uppercase">
                      Demo Seeker
                    </span>
                    <span className="h-2 w-2 rounded-full bg-rarity-rare shadow-[0_0_6px_rgba(56,189,248,0.8)]" />
                  </div>
                  <span className="font-label-sm text-label-sm truncate text-on-surface">
                    customer@wish.com
                  </span>
                  <span className="font-label-sm text-label-sm text-outline">Pass: wish123</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillCredentials("admin@wish.com", "admin123", "Curator")}
                  className="group flex w-full flex-col gap-0.5 rounded bg-surface-container-high p-2 text-left transition-all hover:bg-surface-vault"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm font-bold text-gold-radiant uppercase">
                      Vault Curator
                    </span>
                    <span className="h-2 w-2 rounded-full bg-rarity-mythic shadow-[0_0_6px_rgba(236,72,153,0.8)]" />
                  </div>
                  <span className="font-label-sm text-label-sm truncate text-on-surface">
                    admin@wish.com
                  </span>
                  <span className="font-label-sm text-label-sm text-outline">Pass: admin123</span>
                </button>
              </div>
            </div>

            {/* Credential Form */}
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
            >
              {mode === "register" && (
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="sacred-name"
                    className="font-label-sm text-label-sm flex items-center justify-between font-semibold tracking-wider text-parchment-text uppercase"
                  >
                    <span>Seeker Moniker (Full Name)</span>
                    <span className="font-normal text-outline">Rite of Passage</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-[18px] text-outline">
                      person
                    </span>
                    <input
                      id="sacred-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Lord / Lady of the Lexicon"
                      className="font-body-md text-body-md w-full rounded-md bg-surface-container-lowest py-3 pr-4 pl-10 text-parchment-text shadow-inner placeholder:text-outline/60 focus:ring-1 focus:ring-gold-radiant focus:outline-none"
                    />
                  </div>
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="sacred-email"
                  className="font-label-sm text-label-sm flex items-center justify-between font-semibold tracking-wider text-parchment-text uppercase"
                >
                  <span>Sacred Identifier (Email)</span>
                  <span className="font-normal text-outline">Vault Signpost</span>
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-[18px] text-outline">
                    mail
                  </span>
                  <input
                    id="sacred-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seeker@wishsociety.realm"
                    className="font-body-md text-body-md w-full rounded-md bg-surface-container-lowest py-3 pr-4 pl-10 text-parchment-text shadow-inner transition-all placeholder:text-outline/60 focus:ring-1 focus:ring-gold-radiant focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="cipher-key"
                    className="font-label-sm text-label-sm font-semibold tracking-wider text-parchment-text uppercase"
                  >
                    Cipher Passkey (Password)
                  </label>
                  <span className="font-label-sm text-label-sm text-gold-radiant">
                    Forgotten Passphrase?
                  </span>
                </div>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-[18px] text-outline">
                    lock
                  </span>
                  <input
                    id="cipher-key"
                    type={showPass ? "text" : "password"}
                    required
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    placeholder="••••••••••••"
                    className="font-body-md text-body-md w-full rounded-md bg-surface-container-lowest py-3 pr-10 pl-10 text-parchment-text shadow-inner transition-all placeholder:text-outline/60 focus:ring-1 focus:ring-gold-radiant focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3 text-outline transition-colors hover:text-gold-radiant"
                    aria-label={showPass ? "Hide password" : "Show password"}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPass ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <label className="flex cursor-pointer items-center gap-2.5 select-none">
                  <span className="relative flex h-4 w-4 items-center justify-center rounded bg-surface-container-lowest">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="peer sr-only"
                    />
                    <span
                      className={cn(
                        "h-2.5 w-2.5 rotate-45 bg-gold-radiant shadow-[0_0_6px_rgba(245,215,127,0.9)] transition-opacity",
                        remember ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </span>
                  <span className="font-body-sm text-body-sm text-parchment-muted">
                    Remember this mortal vessel
                  </span>
                </label>
                <span className="font-label-sm text-label-sm flex items-center gap-1 tracking-wider text-outline uppercase">
                  <span className="material-symbols-outlined text-[14px] text-rarity-rare">
                    verified_user
                  </span>
                  256-Bit Crypt
                </span>
              </div>
              <button
                type="submit"
                className="font-headline-sm text-headline-sm mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-primary-container via-gold-burnished to-on-primary-container px-6 py-3.5 font-bold tracking-wide text-on-primary uppercase shadow-[0_4px_20px_rgba(212,175,55,0.35)] transition-all hover:brightness-110 active:scale-[0.99]"
              >
                <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                <span>{mode === "register" ? "Initiate My Covenant" : "Enter The Society"}</span>
              </button>
            </form>

            {alert && (
              <div className="flex items-center gap-3 rounded-lg bg-surface-container-high p-3 transition-all">
                <span className="material-symbols-outlined text-[20px] text-gold-radiant">
                  mark_chat_read
                </span>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm font-bold text-gold-radiant uppercase">
                    {alert.title}
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface">{alert.desc}</span>
                </div>
              </div>
            )}

            <div className="pt-2 text-center">
              <p className="font-body-sm text-body-sm text-outline">
                By stepping through the threshold, you pledge compliance with our
                sacred lore protection pact and ceremonial confidentiality codes.
              </p>
            </div>
          </div>
        </div>

        {/* Gemstone Diamond Divider */}
        <div className="relative my-space-xl flex w-full max-w-3xl items-center justify-center">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-gold-burnished/40 to-transparent" />
          <div className="absolute flex h-3 w-3 rotate-45 items-center justify-center bg-surface-vault shadow-[0_0_10px_rgba(245,215,127,0.7)]">
            <div className="h-1 w-1 bg-gold-radiant" />
          </div>
        </div>

        {/* 'Why Join The Wish Society?' Feature Breakdown */}
        <div className="flex w-full max-w-4xl flex-col gap-space-md">
          <div className="flex flex-col items-center text-center">
            <span className="font-label-sm text-label-sm font-semibold tracking-widest text-gold-burnished uppercase">
              Covenant Privileges
            </span>
            <h2 className="font-headline-md text-headline-md mt-1 font-bold text-parchment-text">
              Why Join The Wish Society?
            </h2>
            <p className="font-body-md text-body-md mt-1 max-w-lg text-parchment-muted">
              A sanctioned account binds your mortal identity to the eternal
              dispersion ledger, granting elevated privileges across physical and
              mystical dimensions.
            </p>
          </div>
          <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
            {PRIVILEGES.map((p) => (
              <div
                key={p.title}
                className="flex items-start gap-4 rounded-xl bg-surface-midnight p-5 shadow-lg transition-all hover:-translate-y-1"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-surface-vault shadow-md">
                  <span className={cn("material-symbols-outlined text-[26px]", p.iconColor)}>
                    {p.icon}
                  </span>
                </div>
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-title-lg text-title-lg font-bold text-parchment-text">
                      {p.title}
                    </span>
                    <span
                      className={cn(
                        "font-label-sm text-label-sm rounded-full bg-surface-container-highest px-2 py-0.5",
                        p.chipClass
                      )}
                    >
                      {p.chip}
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-parchment-muted">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Cultural Sanctity Banner */}
          <div className="mt-4 flex w-full flex-col items-center justify-between gap-4 rounded-xl bg-surface-container-low p-5 shadow-md sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-surface-container-highest">
                <span className="material-symbols-outlined text-[22px] text-gold-radiant">
                  balance
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm font-semibold text-parchment-text">
                  Ethical Mythos Standards
                </span>
                <span className="font-body-sm text-body-sm text-parchment-muted">
                  Rarity describes the craft edition — never religious veneration
                  or living faiths.
                </span>
              </div>
            </div>
            <Link
              href="/about"
              className="font-label-sm text-label-sm inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-surface-vault px-4 py-2 font-bold tracking-wider text-gold-radiant uppercase shadow-sm transition-all hover:bg-gold-burnished hover:text-on-primary"
            >
              Archival Charter
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
