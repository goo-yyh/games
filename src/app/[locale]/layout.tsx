import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { AdSenseScript } from "@/components/Ads";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { games } from "@/content/games";
import { absoluteUrl, siteConfig } from "@/config/site";
import { isLocale, localeConfig, locales } from "@/i18n/config";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  category: "games",
  referrer: "strict-origin-when-cross-origin",
  icons: { icon: "/icon.png", apple: "/apple-icon.png" },
  manifest: "/manifest.webmanifest",
  verification: {
    google: siteConfig.googleVerification || undefined,
    other: siteConfig.bingVerification
      ? { "msvalidate.01": siteConfig.bingVerification }
      : undefined,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b1020",
  colorScheme: "dark",
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : "en";
  if (!isLocale(locale)) notFound();

  return (
    <html lang={localeConfig[safeLocale].htmlLang}>
      <body className={safeLocale === "zh" ? "locale-zh" : "locale-en"}>
        <a className="skip-link" href="#main-content">
          {safeLocale === "en" ? "Skip to main content" : "跳到主要内容"}
        </a>
        <Header locale={safeLocale} gameSlugs={games.map((game) => game.slug)} />
        {children}
        <Footer locale={safeLocale} />
        <AdSenseScript />
        <span className="site-origin" hidden>{absoluteUrl(`/${safeLocale}`)}</span>
      </body>
    </html>
  );
}
