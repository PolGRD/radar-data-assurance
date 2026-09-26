import type { Metadata } from "next";
import { Suspense } from "react";
import { NotConfigured } from "@/components/NotConfigured";
import { VeilleExplorer } from "@/components/VeilleExplorer";
import { getVeilleItems } from "@/lib/notion";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Veille" };

export default async function VeillePage() {
  const items = await getVeilleItems();
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Fil de veille</h1>
      <NotConfigured />
      <Suspense>
        <VeilleExplorer items={items} />
      </Suspense>
    </>
  );
}
