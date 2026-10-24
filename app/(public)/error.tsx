"use client";

export default function Erreur({ reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert" className="space-y-3 py-10 text-center">
      <p className="text-lg font-semibold">Cette page est momentanément indisponible.</p>
      <button type="button" onClick={reset} className="rounded-md bg-prusse px-3.5 py-2 text-sm font-semibold text-prusse-ink hover:bg-prusse-2">
        Réessayer
      </button>
    </div>
  );
}
