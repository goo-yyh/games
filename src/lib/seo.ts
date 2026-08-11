import type { Metadata } from "next";
import { absoluteUrl, siteConfig } from "@/config/site";
import { localeConfig, type Locale } from "@/i18n/config";
import { localizedPath } from "@/i18n/paths";

const productionEnvironment =
  process.env.VERCEL_ENV === "production" ||
  process.env.NEXT_PUBLIC_DEPLOY_ENV === "production";

// A Vercel Production deployment is not crawl-ready until the operator has
// supplied the real domain and legal/contact values and explicitly opens it.
export const isProduction =
  productionEnvironment && process.env.NEXT_PUBLIC_LAUNCH_READY === "true";

export function languageAlternates(logicalPath: string) {
  const en = absoluteUrl(localizedPath("en", logicalPath));
  const zh = absoluteUrl(localizedPath("zh", logicalPath));
  return { en, "zh-CN": zh, "x-default": en };
}

export function buildLocalizedMetadata({
  locale,
  logicalPath,
  title,
  description,
  image = "/images/og/home.webp",
  imageAlt,
}: {
  locale: Locale;
  logicalPath: string;
  title: string;
  description: string;
  image?: string;
  imageAlt: string;
}): Metadata {
  const canonical = absoluteUrl(localizedPath(locale, logicalPath));
  const images = [
    {
      url: absoluteUrl(image),
      width: 1200,
      height: 630,
      alt: imageAlt,
    },
  ];

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: languageAlternates(logicalPath),
    },
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
      siteName: siteConfig.name,
      locale: locale === "en" ? "en_US" : "zh_CN",
      alternateLocale: [locale === "en" ? "zh_CN" : "en_US"],
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl(image)],
    },
    robots: isProduction
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        }
      : { index: false, follow: false, noarchive: true },
    other: {
      "content-language": localeConfig[locale].htmlLang,
    },
  };
}

export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
