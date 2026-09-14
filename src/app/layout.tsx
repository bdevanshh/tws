import type { Metadata } from "next";
import { DM_Sans, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"] });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Wish Society — You Choose the Box. We Create the Mystery.",
  description:
    "A global mystery-box & collectible experience built on world religions, mythology and cultural stories.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`dark ${dmSans.variable} ${playfair.variable} ${jetbrainsMono.variable} h-full`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="ambient flex min-h-full flex-col bg-background font-body-md text-on-surface">
        <Providers>
          <SiteHeader />
          <main className="mx-auto w-full max-w-[1280px] flex-1 px-gutter pt-20">
            {children}
          </main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
