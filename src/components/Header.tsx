"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Languages, Menu, Shuffle, X } from "lucide-react";
import { otherLocale, type Locale } from "@/i18n/config";
import { alternatePath, categoryPath, gamePath, localizedPath } from "@/i18n/paths";
import { usePathname } from "next/navigation";

function randomIndex(length: number) {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return values[0] % length;
}

export function Header({ locale, gameSlugs }: { locale: Locale; gameSlugs: string[] }) {
  const en = locale === "en";
  const copy = {
    nav: {
      allGames: en ? "All games" : "全部游戏", puzzle: en ? "Puzzle" : "益智",
      arcade: en ? "Arcade" : "街机", skill: en ? "Skill" : "技巧", brain: en ? "Brain" : "脑力",
      about: en ? "About" : "关于", random: en ? "Random game" : "随机游戏",
      menu: en ? "Open menu" : "打开菜单", closeMenu: en ? "Close menu" : "关闭菜单",
    },
  };
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const nextLocale = otherLocale(locale);
  const nav = [
    [copy.nav.allGames, localizedPath(locale, "#games")],
    [copy.nav.puzzle, categoryPath(locale, "puzzle")],
    [copy.nav.arcade, categoryPath(locale, "arcade")],
    [copy.nav.skill, categoryPath(locale, "skill")],
    [copy.nav.brain, categoryPath(locale, "brain")],
    [copy.nav.about, localizedPath(locale, "/about")],
  ] as const;

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
      "a[href], button:not([disabled])",
    );
    focusable?.[0]?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (event.key !== "Tab" || !focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function playRandom() {
    const slug = gameSlugs[randomIndex(gameSlugs.length)];
    window.location.assign(gamePath(locale, slug));
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href={localizedPath(locale)} aria-label={`${copy.nav.allGames} — ArcadeMint`}>
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span>ArcadeMint</span>
        </Link>

        <nav className="desktop-nav" aria-label={locale === "en" ? "Primary navigation" : "主导航"}>
          {nav.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
        </nav>

        <div className="header-actions">
          <Link className="language-link" href={alternatePath(pathname, nextLocale)} hrefLang={nextLocale === "en" ? "en" : "zh-CN"}>
            <Languages size={16} aria-hidden="true" />
            {nextLocale === "en" ? "English" : "简体中文"}
          </Link>
          <button className="random-button" type="button" onClick={playRandom}>
            <Shuffle size={16} aria-hidden="true" />
            <span>{copy.nav.random}</span>
          </button>
          <button
            ref={triggerRef}
            className="menu-button"
            type="button"
            aria-label={open ? copy.nav.closeMenu : copy.nav.menu}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="menu-layer" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}>
          <div ref={panelRef} id="mobile-navigation" className="mobile-panel" role="dialog" aria-modal="true" aria-label={copy.nav.menu}>
            <div className="mobile-panel-top">
              <span className="menu-eyebrow">ArcadeMint</span>
              <button type="button" aria-label={copy.nav.closeMenu} onClick={() => setOpen(false)}><X aria-hidden="true" /></button>
            </div>
            <nav aria-label={locale === "en" ? "Mobile navigation" : "移动导航"}>
              {nav.map(([label, href], index) => (
                <Link key={href} href={href} onClick={() => setOpen(false)}>
                  <span>{String(index + 1).padStart(2, "0")}</span>{label}
                </Link>
              ))}
            </nav>
            <div className="mobile-panel-actions">
              <Link href={alternatePath(pathname, nextLocale)} onClick={() => setOpen(false)}>
                <Languages aria-hidden="true" />{nextLocale === "en" ? "English" : "简体中文"}
              </Link>
              <button type="button" onClick={playRandom}><Shuffle aria-hidden="true" />{copy.nav.random}</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
