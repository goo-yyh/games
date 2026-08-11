import type { ReactNode, SVGProps } from "react";

type IconName = "arrow" | "flower" | "gamepad" | "layers" | "monitor" | "sparkles";

const paths: Record<IconName, ReactNode> = {
  arrow: <><path d="M7 7h10v10M7 17 17 7" /></>,
  flower: <><circle cx="12" cy="12" r="2.5" /><path d="M12 2c2.7 0 3.5 3.7 1.4 6M12 22c-2.7 0-3.5-3.7-1.4-6M2 12c0-2.7 3.7-3.5 6-1.4M22 12c0 2.7-3.7 3.5-6 1.4M4.9 4.9c1.9-1.9 5 .2 4.9 3.1M19.1 19.1c-1.9 1.9-5-.2-4.9-3.1" /></>,
  gamepad: <><path d="M8 8h8a5 5 0 0 1 4.8 6.3l-1 3.5a2 2 0 0 1-3.2 1l-2.2-1.8H9.6l-2.2 1.8a2 2 0 0 1-3.2-1l-1-3.5A5 5 0 0 1 8 8Z" /><path d="M7 13h4M9 11v4M16 12h.01M18 14h.01" /></>,
  layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></>,
  monitor: <><rect x="2" y="4" width="14" height="11" rx="2" /><path d="M6 20h6M9 15v5" /><rect x="17" y="8" width="5" height="10" rx="1" /></>,
  sparkles: <><path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3ZM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14ZM19 13l.7 1.8 1.8.7-1.8.7L19 18l-.7-1.8-1.8-.7 1.8-.7L19 13Z" /></>,
};

export function UiIcon({ name, size = 24, ...props }: SVGProps<SVGSVGElement> & { name: IconName; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
