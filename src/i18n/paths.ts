import type { Locale } from "./config";

export function localizedPath(locale: Locale, suffix = "") {
  const clean = suffix === "/" ? "" : suffix.startsWith("/") || suffix.startsWith("#") ? suffix : `/${suffix}`;
  return `/${locale}${clean}`;
}

export function alternatePath(pathname: string, locale: Locale) {
  const suffix = pathname.replace(/^\/(en|zh)(?=\/|$)/, "");
  return localizedPath(locale, suffix);
}

export function gamePath(locale: Locale, slug: string) {
  return localizedPath(locale, `/games/${slug}`);
}

export function categoryPath(locale: Locale, category: string) {
  return localizedPath(locale, `/category/${category.toLowerCase()}`);
}
