import type { Metadata } from "next";
import { Feuillet } from "@/components/Feuillet";
import { safeNextPath } from "@/lib/auth";

export const metadata: Metadata = { title: "Connexion" };

export default async function ConnexionPage({ searchParams }: PageProps<"/connexion">) {
  const params = await searchParams;
  const erreur = params.erreur === "1";
  const manque = params.erreur === "config" && typeof params.manque === "string"
    ? params.manque.split(",").filter((v) => v === "SITE_PASSWORD" || v === "AUTH_SECRET")
    : [];
  const next = safeNextPath(typeof params.next === "string" ? params.next : "/");

  return (
    <main className="flex flex-1 items-center justify-center bg-prusse p-4">
      <form action="/api/login" method="post" className="flex w-full max-w-md overflow-hidden rounded-xl bg-sheet shadow-[0_24px_48px_-24px_rgb(0_0_0/0.6)]">
        <div className="hidden items-center bg-sheet-2 px-6 sm:flex">
          <Feuillet date={new Date().toISOString().slice(0, 10)} taille="md" />
        </div>
        <div className="flex-1 space-y-4 p-6">
          <h1 className="flex items-baseline gap-1.5">
            <span className="font-chiffres text-3xl font-bold uppercase leading-none tracking-wide text-prusse dark:text-ink">Radar</span>
            <span className="font-medium text-ink-2">Data Assurance</span>
          </h1>
          {manque.length > 0 && (
            <p role="alert" className="rounded-lg border border-alerte/40 bg-alerte-soft p-3 text-sm text-alerte">
              Configuration incomplète : {manque.join(" et ")} manque dans les variables d&apos;environnement Vercel. Ajoute-la, puis redéploie.
            </p>
          )}
          <input type="hidden" name="next" value={next} />
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-semibold text-ink-2">Mot de passe</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoFocus
              autoComplete="current-password"
              aria-invalid={erreur}
              aria-describedby={erreur ? "erreur" : undefined}
              className={`champ w-full py-2 text-base ${erreur ? "border-vermillon" : ""}`}
            />
            {erreur && <p id="erreur" role="alert" className="text-sm font-medium text-vermillon">Mot de passe incorrect.</p>}
          </div>
          <button type="submit" className="w-full rounded-md bg-prusse px-3 py-2 font-semibold text-prusse-ink transition-colors hover:bg-prusse-2">
            Entrer
          </button>
        </div>
      </form>
    </main>
  );
}
