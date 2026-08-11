"use client";

import type { Locale } from "@/i18n/config";
import { gamePath } from "@/i18n/paths";

export function RandomGameButton({ locale, slugs, label }: { locale: Locale; slugs: string[]; label: string }) {
  function play() {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    window.location.assign(gamePath(locale, slugs[values[0] % slugs.length]));
  }
  return <button className="button button-secondary" type="button" onClick={play}><span className="nav-icon" aria-hidden="true">⇄</span>{label}</button>;
}
