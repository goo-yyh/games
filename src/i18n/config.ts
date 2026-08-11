export const locales = ["en", "zh"] as const;
export type Locale = (typeof locales)[number];

export const localeConfig: Record<
  Locale,
  { htmlLang: string; hreflang: string; label: string; shortLabel: string }
> = {
  en: { htmlLang: "en", hreflang: "en", label: "English", shortLabel: "EN" },
  zh: { htmlLang: "zh-CN", hreflang: "zh-CN", label: "简体中文", shortLabel: "中文" },
};

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function otherLocale(locale: Locale): Locale {
  return locale === "en" ? "zh" : "en";
}
