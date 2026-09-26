"use client";

export default function Erreur({ reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert" className="space-y-3 rounded border border-red-300 bg-red-50 p-4 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
      <p className="font-semibold">Impossible de lire les données Notion pour le moment.</p>
      <p className="text-sm">Vérifie que l&apos;intégration « Radar site » a toujours accès aux bases, puis réessaie.</p>
      <button type="button" onClick={reset} className="text-sm underline">Réessayer</button>
    </div>
  );
}
