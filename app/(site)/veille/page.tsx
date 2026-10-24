import type { Metadata } from "next";
import { Suspense } from "react";
import { EnTetePage } from "@/components/EnTetePage";
import { NotConfigured } from "@/components/NotConfigured";
import { VeilleExplorer } from "@/components/VeilleExplorer";
import { getVeilleItems } from "@/lib/notion";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Veille" };

export default async function VeillePage() {
  const items = await getVeilleItems();
  return (
    <>
      <EnTetePage titre="Fil de veille" />
      <NotConfigured />
      <Suspense>
        <VeilleExplorer items={items} />
      </Suspense>
    </>
  );
}
