"use client";

export default function Erreur({ reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert" className="space-y-3 rounded-xl border border-vermillon/40 bg-vermillon-soft p-4 text-ink">
      <p className="font-semibold">Impossible de lire les données Notion pour le moment.</p>
      <p className="text-sm">Vérifie que l&apos;intégration « Radar site » a toujours accès aux bases, puis réessaie.</p>
      <button type="button" onClick={reset} className="rounded-md bg-vermillon px-3 py-1.5 text-sm font-semibold text-vermillon-ink">Réessayer</button>
    </div>
  );
}
