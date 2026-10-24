"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavPublique({ liens }: { liens: { href: string; label: string }[] }) {
  const chemin = usePathname();
  return (
    <ul className="flex items-stretch gap-1">
      {liens.map(({ href, label }) => {
        const actif = chemin === href || chemin.startsWith(`${href}/`);
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
