const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
const productionEnvironment =
  process.env.VERCEL_ENV === "production" ||
  process.env.NEXT_PUBLIC_DEPLOY_ENV === "production";
const launchReady = process.env.NEXT_PUBLIC_LAUNCH_READY === "true";

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "ArcadeMint",
  url: configuredUrl || "https://arcademint.games",
  contactEmail:
    process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@arcademint.games",
  legalName: process.env.NEXT_PUBLIC_LEGAL_NAME || "ArcadeMint Studio",
  governingLaw:
    process.env.NEXT_PUBLIC_GOVERNING_LAW ||
    "the laws applicable in the operator’s place of business",
  effectiveDate: "August 11, 2026",
  effectiveDateZh: "2026 年 8 月 11 日",
  adsenseEnabled:
    productionEnvironment && launchReady && process.env.NEXT_PUBLIC_ENABLE_ADSENSE === "true",
  adsenseClient: process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "",
  adsensePublisher: process.env.ADSENSE_PUBLISHER_ID || "",
  googleVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  bingVerification: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || "",
} as const;

export function absoluteUrl(path: string) {
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}
