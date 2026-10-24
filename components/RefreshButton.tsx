"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconeRafraichir } from "./Icones";

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
      className={`flex items-center gap-1.5 rounded-[4px] px-2.5 py-1.5 text-sm transition-colors hover:bg-white/10 disabled:opacity-70 ${state === "error" ? "bg-vermillon text-vermillon-ink hover:bg-vermillon" : "text-white/80 hover:text-white"}`}
      title="Recharger les données depuis Notion"
    >
      <IconeRafraichir className={`h-4 w-4 ${state === "busy" ? "motion-safe:animate-spin" : ""}`} />
      {state === "busy" ? "Rafraîchissement…" : state === "error" ? "Échec, réessayer" : "Rafraîchir"}
    </button>
  );
}
