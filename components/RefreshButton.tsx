"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RefreshButton() {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "busy" | "error">("idle");

  async function refresh() {
    setState("busy");
    try {
      const res = await fetch("/api/revalidate", { method: "POST" });
      if (!res.ok) throw new Error();
      router.refresh();
      setState("idle");
    } catch {
      setState("error");
    }
  }

  return (
    <button
      type="button"
      onClick={refresh}
      disabled={state === "busy"}
      className="rounded px-2 py-1 text-sm hover:bg-zinc-100 disabled:opacity-60 dark:hover:bg-zinc-800"
      title="Recharger les données depuis Notion"
    >
      {state === "busy" ? "Rafraîchissement…" : state === "error" ? "Échec, réessayer" : "Rafraîchir"}
    </button>
  );
}
