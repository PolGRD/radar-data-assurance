import Link from "next/link";

export default function NotFound() {
  return (
    <div className="space-y-3">
      <h1 className="text-[1.75rem] font-bold tracking-[-0.02em]">Élément introuvable</h1>
      <p className="text-ink-2">Cet élément n&apos;existe pas ou n&apos;est pas au statut Retenu ou Lu.</p>
      <Link href="/veille" className="font-medium text-prusse underline dark:text-ink">Retour au fil de veille</Link>
    </div>
  );
}
