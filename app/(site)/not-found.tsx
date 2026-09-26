import Link from "next/link";

export default function NotFound() {
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold">Élément introuvable</h1>
      <p className="text-zinc-700 dark:text-zinc-300">Cet élément n&apos;existe pas ou n&apos;est pas au statut Retenu ou Lu.</p>
      <Link href="/veille" className="underline">Retour au fil de veille</Link>
    </div>
  );
}
