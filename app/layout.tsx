import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Grotesque condensée des chiffres et des dates, auto-hébergée (paquet @fontsource, aucun service tiers).
const barlow = localFont({
  src: [
    { path: "../node_modules/@fontsource/barlow-condensed/files/barlow-condensed-latin-600-normal.woff2", weight: "600" },
    { path: "../node_modules/@fontsource/barlow-condensed/files/barlow-condensed-latin-700-normal.woff2", weight: "700" },
  ],
  variable: "--font-barlow",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Radar Data Assurance", template: "%s · Radar Data Assurance" },
  description: "Veille personnelle : data gouvernance, IA et assurance de personnes.",
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#163a7a" },
    { media: "(prefers-color-scheme: dark)", color: "#10295a" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`h-full antialiased ${barlow.variable}`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
