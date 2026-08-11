import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { isProduction } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  if (!isProduction) return { rules: { userAgent: "*", disallow: "/" } };
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${siteConfig.url}/sitemap.xml`, host: siteConfig.url };
}
