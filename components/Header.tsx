import Link from "next/link";
import { RefreshButton } from "./RefreshButton";

export function Header() {
  return (
    <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3" aria-label="Navigation principale">
        <Link href="/" className="mr-2 font-bold tracking-tight">Radar Data Assurance</Link>
        <Link href="/" className="rounded px-2 py-1 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800">Tableau de bord</Link>
        <Link href="/veille" className="rounded px-2 py-1 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800">Veille</Link>
        <Link href="/calendrier" className="rounded px-2 py-1 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800">Calendrier</Link>
        <Link href="/regles" className="rounded px-2 py-1 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800">Règles</Link>
        <div className="ml-auto flex items-center gap-2">
          <RefreshButton />
          <form action="/api/logout" method="post">
            <button type="submit" className="rounded px-2 py-1 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800">Déconnexion</button>
          </form>
        </div>
      </nav>
    </header>
  );
}
