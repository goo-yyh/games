"use client";

import Link from "next/link";
import { Languages } from "lucide-react";
import { usePathname } from "next/navigation";
import { otherLocale, type Locale } from "@/i18n/config";
import { alternatePath } from "@/i18n/paths";

export function LocaleSwitchLink({
  locale,
  className,
  onNavigate,
  showIcon = true,
}: {
  locale: Locale;
  className?: string;
  onNavigate?: () => void;
  showIcon?: boolean;
}) {
  const pathname = usePathname();
  const nextLocale = otherLocale(locale);
  const label = nextLocale === "en" ? "English" : "简体中文";

  return (
    <Link
      className={className}
      href={alternatePath(pathname, nextLocale)}
      hrefLang={nextLocale === "en" ? "en" : "zh-CN"}
      lang={nextLocale === "en" ? "en" : "zh-CN"}
      onClick={onNavigate}
      data-locale-switch
    >
      {showIcon && <Languages size={16} aria-hidden="true" />}
      {label}
    </Link>
  );
}
