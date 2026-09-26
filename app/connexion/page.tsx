import type { Metadata } from "next";
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
    <main className="flex flex-1 items-center justify-center p-4">
      <form
        action="/api/login"
        method="post"
        className="w-full max-w-sm space-y-4 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        <h1 className="text-xl font-bold tracking-tight">Radar Data Assurance</h1>
        {manque.length > 0 && (
          <p role="alert" className="rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
            Configuration incomplète : {manque.join(" et ")} manque dans les variables d&apos;environnement Vercel. Ajoute-la, puis redéploie.
          </p>
        )}
        <input type="hidden" name="next" value={next} />
        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium">Mot de passe</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoFocus
            autoComplete="current-password"
            aria-invalid={erreur}
            aria-describedby={erreur ? "erreur" : undefined}
            className="w-full rounded border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
          />
          {erreur && <p id="erreur" role="alert" className="text-sm text-red-700 dark:text-red-400">Mot de passe incorrect.</p>}
        </div>
        <button type="submit" className="w-full rounded bg-zinc-900 px-3 py-2 font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300">
          Entrer
        </button>
      </form>
    </main>
  );
}
