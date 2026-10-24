import Link from "next/link";
import { Navigation } from "./Navigation";
import { RefreshButton } from "./RefreshButton";

export function Header() {
  return (
    <header className="bg-prusse text-prusse-ink">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-end gap-x-6 px-4 pt-2" aria-label="Navigation principale">
        <Link href="/" className="flex items-baseline gap-1.5 self-center py-2 text-white">
          <span className="font-chiffres text-2xl font-bold uppercase leading-none tracking-wide">Radar</span>
          <span className="text-sm font-medium text-white/80">Data Assurance</span>
        </Link>
        <Navigation />
        <div className="ml-auto flex items-center gap-1 self-center py-1.5">
          <RefreshButton />
          <form action="/api/logout" method="post">
            <button type="submit" className="rounded-[4px] px-2.5 py-1.5 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white">
              Déconnexion
            </button>
          </form>
        </div>
      </nav>
    </header>
  );
}
