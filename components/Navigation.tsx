"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LIENS = [
  { href: "/", label: "Tableau de bord" },
  { href: "/veille", label: "Veille" },
  { href: "/calendrier", label: "Calendrier" },
  { href: "/regles", label: "Règles" },
  { href: "/fiches", label: "Fiches" },
  { href: "/parcours", label: "Parcours" },
] as const;

export function Navigation() {
  const chemin = usePathname();
  return (
    <ul className="order-last -mx-4 flex w-[calc(100%+2rem)] items-stretch gap-1 overflow-x-auto px-4 [scrollbar-width:none] md:order-none md:mx-0 md:w-auto md:px-0">
      {LIENS.map(({ href, label }) => {
        const actif = href === "/" ? chemin === "/" : chemin.startsWith(href);
        return (
          <li key={href} className="flex">
            <Link
              href={href}
              aria-current={actif ? "page" : undefined}
              className={`relative flex items-center whitespace-nowrap rounded-t-[4px] px-3 py-2.5 text-sm font-medium transition-colors ${
                actif ? "bg-white/12 text-white" : "text-white/80 hover:bg-white/8 hover:text-white"
              }`}
            >
              {label}
              {actif && <span aria-hidden="true" className="absolute inset-x-2 bottom-0 h-[3px] rounded-t-sm bg-vermillon" />}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
