// Adresse d'une page Notion sur le site (articles du blog : /blog/…).
import { slugify } from "./format";

// L'adresse vient du « Slug » saisi dans Notion, sinon du titre ; elle est rendue unique si deux pages se ressemblent.
export function avecAdresses<F extends { id: string; titre: string; slug: string }>(pages: F[]): (F & { adresse: string })[] {
  const vues = new Set<string>();
  return pages.map((f) => {
    let adresse = slugify(f.slug) || slugify(f.titre) || f.id;
    if (vues.has(adresse)) adresse = `${adresse}-${f.id.replace(/-/g, "").slice(0, 6)}`;
    vues.add(adresse);
    return { ...f, adresse };
  });
}
