// Identifiants des sources de données Notion (SPECIFICATIONS.md §14).
export const DATA_SOURCES = {
  veille: "0e0d1142-dd37-485c-9b9a-5a81297fe05a",
  sources: "bf49b3d4-9111-41db-a4da-53ff30b10dec",
  fiches: "795a44e4-0363-4b82-8698-dae7a446211c",
  echeances: "4f13f344-aea7-4a81-aba6-f5a14b21e09b",
  parcours: "d93b2f61-5c7d-4cf1-8943-012d5a2445dd",
} as const;

// Seuls ces statuts sont visibles sur le site.
export const STATUTS_VISIBLES = ["Retenu", "Lu"] as const;

export const PILIERS = ["Data gouvernance", "IA", "Assurance de personnes"] as const;

export const REVALIDATE_SECONDS = 3600;
export const NOTION_CACHE_TAG = "notion";
