import "server-only";
import {
  Client,
  collectPaginatedAPI,
  isFullBlock,
  isFullPage,
  type BlockObjectResponse,
  type PageObjectResponse,
  type QueryDataSourceParameters,
  type RichTextItemResponse,
} from "@notionhq/client";
import { unstable_cache } from "next/cache";
import { DATA_SOURCES, NOTION_CACHE_TAG, REVALIDATE_SECONDS, STATUTS_VISIBLES } from "./config";
import type { Echeance, EtapeParcours, Fiche, ImpactData, NoteBlock, Regle, RichText, VeilleDetail, VeilleItem } from "./types";
import { slugify } from "./format";

// ---------- Client ----------

export function notionConfigured(): boolean {
  return Boolean(process.env.NOTION_TOKEN);
}

let client: Client | null = null;
function notion(): Client {
  if (!process.env.NOTION_TOKEN) throw new Error("NOTION_TOKEN n'est pas défini.");
  client ??= new Client({ auth: process.env.NOTION_TOKEN });
  return client;
}

const cached = <Args extends unknown[], R>(fn: (...args: Args) => Promise<R>, key: string) =>
  unstable_cache(fn, [key], { revalidate: REVALIDATE_SECONDS, tags: [NOTION_CACHE_TAG] });

async function queryAll(args: Omit<QueryDataSourceParameters, "start_cursor">): Promise<PageObjectResponse[]> {
  const results = await collectPaginatedAPI(notion().dataSources.query, { ...args, page_size: 100 });
  return results.filter((r): r is PageObjectResponse => r.object === "page" && isFullPage(r));
}

// ---------- Lecture des propriétés (noms exacts de Notion) ----------

type Props = PageObjectResponse["properties"];

function plain(rich: RichTextItemResponse[]): string {
  return rich.map((r) => r.plain_text).join("").trim();
}

function title(props: Props): string {
  for (const p of Object.values(props)) if (p.type === "title") return plain(p.title);
  return "";
}

function text(props: Props, name: string): string {
  const p = props[name];
  return p?.type === "rich_text" ? plain(p.rich_text) : "";
}

function select(props: Props, name: string): string | null {
  const p = props[name];
  return p?.type === "select" ? (p.select?.name ?? null) : null;
}

function multi(props: Props, name: string): string[] {
  const p = props[name];
  return p?.type === "multi_select" ? p.multi_select.map((o) => o.name) : [];
}

function date(props: Props, name: string): string | null {
  const p = props[name];
  return p?.type === "date" ? (p.date?.start ?? null) : null;
}

function url(props: Props, name: string): string | null {
  const p = props[name];
  return p?.type === "url" ? p.url : null;
}

function checkbox(props: Props, name: string): boolean {
  const p = props[name];
  return p?.type === "checkbox" ? p.checkbox : false;
}

function relation(props: Props, name: string): string[] {
  const p = props[name];
  return p?.type === "relation" ? p.relation.map((r) => r.id) : [];
}

// ---------- Sources ----------

const getSourceNames = cached(async (): Promise<Record<string, string>> => {
  const pages = await queryAll({ data_source_id: DATA_SOURCES.sources });
  return Object.fromEntries(pages.map((p) => [p.id, title(p.properties)]));
}, "sources");

// ---------- Veille ----------

function toVeilleItem(page: PageObjectResponse, sourceNames: Record<string, string>): VeilleItem {
  const p = page.properties;
  const pertinence = Number(select(p, "Pertinence"));
  return {
    id: page.id,
    titre: title(p) || "Sans titre",
    url: url(p, "URL"),
    sources: relation(p, "Source").map((id) => sourceNames[id]).filter(Boolean),
    datePublication: date(p, "Date de publication"),
    dateCollecte: page.created_time,
    extrait: text(p, "Extrait"),
    resume: text(p, "Résumé"),
    piliers: multi(p, "Piliers"),
    tags: multi(p, "Tags"),
    branches: multi(p, "Branche"),
    type: select(p, "Type"),
    pertinence: Number.isFinite(pertinence) && pertinence > 0 ? pertinence : null,
    statut: select(p, "Statut"),
    favori: checkbox(p, "Favori"),
    analyseImpact: select(p, "Analyse d'impact"),
    impactIds: relation(p, "Impacts assureur"),
  };
}

export function isVisible(item: Pick<VeilleItem, "statut">): boolean {
  return (STATUTS_VISIBLES as readonly string[]).includes(item.statut ?? "");
}

export const getVeilleItems = cached(async (): Promise<VeilleItem[]> => {
  if (!notionConfigured()) return [];
  const [pages, sourceNames] = await Promise.all([
    queryAll({
      data_source_id: DATA_SOURCES.veille,
      filter: { or: STATUTS_VISIBLES.map((s) => ({ property: "Statut", select: { equals: s } })) },
      sorts: [{ timestamp: "created_time", direction: "descending" }],
    }),
    getSourceNames(),
  ]);
  return pages.map((p) => toVeilleItem(p, sourceNames));
}, "veille-v2"); // v2 : analyse d'impact et impacts liés

export const countATrier = cached(async (): Promise<number> => {
  if (!notionConfigured()) return 0;
  const pages = await queryAll({
    data_source_id: DATA_SOURCES.veille,
    filter: { property: "Statut", select: { equals: "À trier" } },
  });
  return pages.length;
}, "a-trier");

// ---------- Détail d'un élément ----------

function toRichText(rich: RichTextItemResponse[]): RichText[] {
  return rich.map((r) => ({
    text: r.plain_text,
    href: r.href,
    bold: r.annotations.bold,
    italic: r.annotations.italic,
    code: r.annotations.code,
    strikethrough: r.annotations.strikethrough,
  }));
}

async function getBlocks(blockId: string, depth = 0): Promise<NoteBlock[]> {
  const blocks = (await collectPaginatedAPI(notion().blocks.children.list, { block_id: blockId })).filter(
    (b): b is BlockObjectResponse => isFullBlock(b),
  );
  return Promise.all(
    blocks.map(async (b) => {
      const note: NoteBlock = { id: b.id, type: b.type, text: [], children: [] };
      const content = (b as unknown as Record<string, unknown>)[b.type] as
        | { rich_text?: RichTextItemResponse[]; checked?: boolean; url?: string; caption?: RichTextItemResponse[] }
        | undefined;
      if (content?.rich_text) note.text = toRichText(content.rich_text);
      if (b.type === "to_do") note.checked = b.to_do.checked;
      if (b.type === "bookmark" || b.type === "embed" || b.type === "link_preview") note.url = content?.url;
      // Les images hébergées par Notion expirent au bout d'une heure : on ne garde que les images externes.
      if (b.type === "image" && b.image.type === "external") note.url = b.image.external.url;
      if (b.type === "child_page") note.text = [{ ...emptyRich, text: b.child_page.title }];
      if (b.has_children && depth < 2 && b.type !== "child_page" && b.type !== "child_database") {
        note.children = await getBlocks(b.id, depth + 1);
      }
      return note;
    }),
  );
}

const emptyRich: RichText = { text: "", href: null, bold: false, italic: false, code: false, strikethrough: false };

async function pageTitle(id: string): Promise<{ id: string; titre: string; date: string | null } | null> {
  try {
    const page = await notion().pages.retrieve({ page_id: id });
    if (!isFullPage(page)) return null;
    return { id, titre: title(page.properties) || "Sans titre", date: date(page.properties, "Date") };
  } catch {
    return null; // page non partagée avec l'intégration ou supprimée
  }
}

export const getVeilleDetail = cached(async (id: string): Promise<VeilleDetail | null> => {
  if (!notionConfigured()) return null;
  let page;
  try {
    page = await notion().pages.retrieve({ page_id: id });
  } catch {
    return null;
  }
  if (!isFullPage(page) || page.in_trash) return null;
  if (!("data_source_id" in page.parent) || page.parent.data_source_id !== DATA_SOURCES.veille) return null;

  const item = toVeilleItem(page, await getSourceNames());
  if (!isVisible(item)) return null;

  const p = page.properties;
  const [notes, fiches, echeances] = await Promise.all([
    getBlocks(page.id),
    Promise.all(relation(p, "Fiches liées").map(pageTitle)),
    Promise.all(relation(p, "Échéance liée").map(pageTitle)),
  ]);
  return {
    ...item,
    notionUrl: page.url,
    notes,
    fiches: fiches.filter((f) => f !== null).map(({ id, titre }) => ({ id, titre })),
    echeances: echeances.filter((e) => e !== null),
  };
}, "veille-detail-v2");

// ---------- Tableau de bord : échéances, parcours, fiches ----------

export const getEcheances = cached(async (): Promise<Echeance[]> => {
  if (!notionConfigured()) return [];
  const pages = await queryAll({
    data_source_id: DATA_SOURCES.echeances,
    sorts: [{ property: "Date", direction: "ascending" }],
  });
  const vus = new Set<string>();
  return pages.map((page) => {
    const p = page.properties;
    const intitule = title(p) || "Sans titre";
    // Adresse de la carte dans la frise (/calendrier#slug), rendue unique si deux intitulés se ressemblent.
    let slug = slugify(intitule) || page.id;
    if (vus.has(slug)) slug = `${slug}-${page.id.slice(0, 6)}`;
    vus.add(slug);
    return {
      id: page.id,
      slug,
      intitule,
      date: date(p, "Date"),
      dateInitiale: date(p, "Date initiale"),
      reglementation: select(p, "Réglementation"),
      statut: select(p, "Statut"),
      piliers: multi(p, "Piliers"),
      sourceOfficielle: url(p, "Source officielle"),
      impactAssurance: text(p, "Impact assurance"),
      impactIds: relation(p, "Impacts data"),
      veilleIds: relation(p, "Éléments de veille"),
    };
  });
}, "echeances-v2"); // v2 : slug, date initiale et relations (invalide les caches de l'ancien format)

// Les bases Impacts assureur et Règles de gestion doivent être partagées avec l'intégration :
// si ce n'est pas le cas, on renvoie null et la page l'explique au lieu de planter.
async function siAccessible<T>(lire: () => Promise<T>): Promise<T | null> {
  try {
    return await lire();
  } catch (erreur) {
    if (erreur instanceof Error && /object_not_found|Could not find/i.test(erreur.message)) return null;
    throw erreur;
  }
}

export const getImpacts = cached(async (): Promise<ImpactData[] | null> => {
  if (!notionConfigured()) return [];
  return siAccessible(async () => {
    const pages = await queryAll({ data_source_id: DATA_SOURCES.impacts });
    return pages.map((page) => {
      const p = page.properties;
      return {
        id: page.id,
        intitule: title(p) || "Sans titre",
        description: text(p, "Description"),
        domaines: multi(p, "Domaine data"),
        fonctions: multi(p, "Fonctions concernées"),
        branches: multi(p, "Branche"),
        types: multi(p, "Type"),
        effort: select(p, "Effort"),
        statut: select(p, "Statut"),
        echeanceIds: relation(p, "Échéances"),
        veilleIds: relation(p, "Éléments de veille"),
        regleIds: relation(p, "Règles"),
      };
    });
  });
}, "impacts-v2"); // v2 : type d'impact et éléments de veille

export const getRegles = cached(async (): Promise<Regle[] | null> => {
  if (!notionConfigured()) return [];
  return siAccessible(async () => {
    const pages = await queryAll({ data_source_id: DATA_SOURCES.regles });
    return pages.map((page) => {
      const p = page.properties;
      return {
        id: page.id,
        regle: title(p) || "Sans titre",
        controle: text(p, "Contrôle"),
        nature: select(p, "Nature"),
        criticite: select(p, "Criticité"),
        domaine: select(p, "Domaine de gestion"),
        referenceJuridique: text(p, "Référence juridique"),
        branches: multi(p, "Branche"),
        statut: select(p, "Statut"),
        impactIds: relation(p, "Impacts data"),
      };
    });
  });
}, "regles");

export const getParcours = cached(async (): Promise<EtapeParcours[]> => {
  if (!notionConfigured()) return [];
  const pages = await queryAll({ data_source_id: DATA_SOURCES.parcours });
  return pages.map((page) => ({
    id: page.id,
    competence: title(page.properties) || "Sans titre",
    pilier: select(page.properties, "Pilier"),
    statut: select(page.properties, "Statut"),
  }));
}, "parcours");

export const getDernieresFiches = cached(async (): Promise<Fiche[]> => {
  if (!notionConfigured()) return [];
  const pages = await queryAll({
    data_source_id: DATA_SOURCES.fiches,
    sorts: [{ timestamp: "last_edited_time", direction: "descending" }],
  });
  return pages.slice(0, 5).map((page) => ({
    id: page.id,
    titre: title(page.properties) || "Sans titre",
    statut: select(page.properties, "Statut"),
    miseAJour: page.last_edited_time,
    notionUrl: page.url,
  }));
}, "fiches");
