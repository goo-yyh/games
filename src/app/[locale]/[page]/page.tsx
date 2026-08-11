import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/Breadcrumb";
import { JsonLd } from "@/components/JsonLd";
import { getLegalPage, getSiteCopy, type LegalSlug } from "@/content/site";
import { siteConfig, absoluteUrl } from "@/config/site";
import { isLocale, type Locale } from "@/i18n/config";
import { localizedPath } from "@/i18n/paths";
import { buildLocalizedMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string; page: string }> };
const legalPages: LegalSlug[] = ["about", "contact", "privacy", "cookies", "terms", "accessibility"];

export function generateStaticParams() { return legalPages.map((page) => ({ page })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, page } = await params;
  if (!isLocale(locale) || !legalPages.includes(page as LegalSlug)) return {};
  const copy = getLegalPage(page as LegalSlug, locale);
  return buildLocalizedMetadata({ locale, logicalPath: `/${page}`, title: copy.title, description: copy.description, imageAlt: `${copy.h1} — ArcadeMint` });
}

export default async function LegalPageRoute({ params }: Props) {
  const { locale: localeValue, page: pageValue } = await params;
  if (!isLocale(localeValue) || !legalPages.includes(pageValue as LegalSlug)) notFound();
  const locale = localeValue as Locale;
  const page = pageValue as LegalSlug;
  const copy = getLegalPage(page, locale);
  const ui = getSiteCopy(locale);
  const canonical = absoluteUrl(localizedPath(locale, `/${page}`));

  return (
    <main id="main-content" className="legal-page page-shell">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebPage", name: copy.h1, description: copy.description, url: canonical, inLanguage: locale === "en" ? "en" : "zh-CN" }} />
      <Breadcrumb items={[{ label: ui.breadcrumb.home, href: localizedPath(locale) }, { label: copy.h1 }]} />
      <header className="legal-hero"><p className="eyebrow"><span />ARCADEMINT / {page.toUpperCase()}</p><h1>{copy.h1}</h1>{copy.intro && <p>{copy.intro}</p>}</header>
      {page === "contact" && <Link className="contact-email" href={`mailto:${siteConfig.contactEmail}`}><Mail aria-hidden="true" /><span>{siteConfig.contactEmail}</span></Link>}
      <div className="legal-sections">
        {copy.sections.map((section, index) => <section key={section.heading}><span>0{index + 1}</span><div><h2>{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.bullets && <ul>{section.bullets.map((item) => <li key={item}>{item}</li>)}</ul>}</div></section>)}
      </div>
    </main>
  );
}
