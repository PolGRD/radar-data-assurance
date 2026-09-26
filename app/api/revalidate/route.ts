import { revalidatePath, revalidateTag } from "next/cache";
import { NOTION_CACHE_TAG } from "@/lib/config";

// Bouton « Rafraîchir » : vide le cache Notion et toutes les pages.
// Protégée par proxy.ts comme le reste du site.
export async function POST() {
  revalidateTag(NOTION_CACHE_TAG, { expire: 0 });
  revalidatePath("/", "layout");
  return Response.json({ ok: true, date: new Date().toISOString() });
}
