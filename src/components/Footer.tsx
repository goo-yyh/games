import Link from "next/link";
import { getSiteCopy } from "@/content/site";
import type { Locale } from "@/i18n/config";
import { categoryPath, localizedPath } from "@/i18n/paths";

export function Footer({ locale }: { locale: Locale }) {
  const copy = getSiteCopy(locale);
  return (
    <footer className="site-footer">
      <div className="footer-grid page-shell">
        <div className="footer-brand">
          <Link className="brand" href={localizedPath(locale)}>
            <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
            <span>ArcadeMint</span>
          </Link>
          <p>{copy.footer.tagline}</p>
        </div>
        <div>
          <h2>{copy.footer.games}</h2>
          <Link href={localizedPath(locale, "#games")}>{copy.nav.allGames}</Link>
          <Link href={categoryPath(locale, "puzzle")}>{copy.nav.puzzle}</Link>
          <Link href={categoryPath(locale, "arcade")}>{copy.nav.arcade}</Link>
          <Link href={categoryPath(locale, "skill")}>{copy.nav.skill}</Link>
          <Link href={categoryPath(locale, "brain")}>{copy.nav.brain}</Link>
          <Link href={localizedPath(locale, "/collections/garden-logic")}>{copy.footer.garden}</Link>
        </div>
        <div>
          <h2>{copy.footer.company}</h2>
          <Link href={localizedPath(locale, "/about")}>{copy.nav.about}</Link>
          <Link href={localizedPath(locale, "/contact")}>{copy.footer.contact}</Link>
          <Link href={localizedPath(locale, "/accessibility")}>{copy.footer.accessibility}</Link>
        </div>
        <div>
          <h2>{copy.footer.legal}</h2>
          <Link href={localizedPath(locale, "/privacy")}>{copy.footer.privacy}</Link>
          <Link href={localizedPath(locale, "/cookies")}>{copy.footer.cookies}</Link>
          <Link href={localizedPath(locale, "/terms")}>{copy.footer.terms}</Link>
        </div>
      </div>
      <div className="footer-bottom page-shell"><p>{copy.footer.copyright}</p></div>
    </footer>
  );
}
