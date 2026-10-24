// Fabriques de données de test : des objets complets et valides, que chaque test
// ajuste sur les seuls champs qui comptent pour lui.
import type { ArticleBlog, EtapeParcours, Echeance, Fiche, ImpactData, Regle, VeilleItem } from "@/lib/types";

export function echeance(champs: Partial<Echeance> & { id: string }): Echeance {
  return {
    slug: champs.id, intitule: `Échéance ${champs.id}`, date: "2027-01-01", dateInitiale: null,
    reglementation: "AI Act", statut: "À venir", piliers: [], sourceOfficielle: null, impactAssurance: "",
    impactIds: [], veilleIds: [], ...champs,
  };
}

export function impact(champs: Partial<ImpactData> & { id: string }): ImpactData {
  return {
    intitule: `Impact ${champs.id}`, description: "", domaines: [], fonctions: [], branches: [], types: ["Data"],
    effort: null, statut: "À relire", echeanceIds: [], veilleIds: [], regleIds: [], ...champs,
  };
}

export function regle(champs: Partial<Regle> & { id: string }): Regle {
  return {
    regle: `Règle ${champs.id}`, controle: "", nature: "GES", criticite: "C2", domaine: "Cotisations",
    referenceJuridique: "", branches: ["Prévoyance individuelle"], statut: "Proposée", impactIds: [], ...champs,
  };
}

export function article(champs: Partial<VeilleItem> & { id: string }): VeilleItem {
  return {
    titre: `Article ${champs.id}`, url: null, sources: [], datePublication: null, dateCollecte: "2026-10-01T08:00:00.000Z",
    extrait: "", resume: "", piliers: [], tags: [], branches: [], type: null, pertinence: null, statut: "Retenu",
    favori: false, analyseImpact: null, impactIds: [], ...champs,
  };
}

export function fiche(champs: Partial<Fiche> & { id: string }): Fiche {
  return {
    titre: `Fiche ${champs.id}`, slug: "", adresse: champs.id, statut: "Ébauche", piliers: [], tags: [],
    miseAJour: "2026-10-01T08:00:00.000Z", notionUrl: `https://notion.so/${champs.id}`, veilleIds: [], ...champs,
  };
}

export function etape(champs: Partial<EtapeParcours> & { id: string }): EtapeParcours {
  return {
    competence: `Compétence ${champs.id}`, pilier: "IA", statut: "À faire", type: "Lecture", ressource: null,
    echeanceCible: null, notes: "", ...champs,
  };
}

export function articleBlog(champs: Partial<ArticleBlog> & { id: string }): ArticleBlog {
  return {
    titre: `Article de blog ${champs.id}`, slug: "", adresse: champs.id, statut: "Publié", date: "2026-10-01", resume: "",
    piliers: [], tags: [], couverture: null, creation: "2026-09-30T08:00:00.000Z", notionUrl: `https://notion.so/${champs.id}`, ...champs,
  };
}
