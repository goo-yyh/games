"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { siteConfig } from "@/config/site";
import type { Locale } from "@/i18n/config";

declare global {
  interface Window { adsbygoogle?: Record<string, never>[]; }
}

export function AdSenseScript() {
  if (!siteConfig.adsenseEnabled || !siteConfig.adsenseClient) return null;
  return (
    <Script
      id="arcademint-adsense"
      async
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${siteConfig.adsenseClient}`}
    />
  );
}

export function AdSlot({ locale, slot, format = "auto" }: { locale: Locale; slot?: string; format?: string }) {
  const initialized = useRef(false);
  useEffect(() => {
    if (!siteConfig.adsenseEnabled || !siteConfig.adsenseClient || !slot || initialized.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      initialized.current = true;
    } catch (error) {
      if (process.env.NODE_ENV === "development") console.warn("Ad slot initialization skipped", error);
    }
  }, [slot]);

  if (!siteConfig.adsenseEnabled || !siteConfig.adsenseClient || !slot) {
    if (process.env.NODE_ENV !== "development") return null;
    return <aside className="ad-placeholder" aria-label={locale === "en" ? "Advertisement" : "广告"}>Ad placeholder – development only</aside>;
  }

  return (
    <aside className="ad-slot" aria-label={locale === "en" ? "Advertisement" : "广告"}>
      <span>{locale === "en" ? "Advertisement" : "广告"}</span>
      <ins className="adsbygoogle" style={{ display: "block" }} data-ad-client={siteConfig.adsenseClient} data-ad-slot={slot} data-ad-format={format} data-full-width-responsive="true" />
    </aside>
  );
}
