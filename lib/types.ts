export type VeilleItem = {
  id: string;
  titre: string;
  url: string | null;
  sources: string[];
  datePublication: string | null;
  dateCollecte: string;
  extrait: string;
  resume: string;
  piliers: string[];
  tags: string[];
  branches: string[];
  type: string | null;
  pertinence: number | null;
  statut: string | null;
  favori: boolean;
};

export type VeilleDetail = VeilleItem & {
  notionUrl: string;
  notes: NoteBlock[];
  fiches: { id: string; titre: string }[];
  echeances: { id: string; titre: string; date: string | null }[];
};

export type RichText = {
  text: string;
  href: string | null;
  bold: boolean;
  italic: boolean;
  code: boolean;
  strikethrough: boolean;
};

export type NoteBlock = {
  id: string;
  type: string;
  text: RichText[];
  checked?: boolean;
  url?: string;
  children: NoteBlock[];
};

export type Echeance = {
  id: string;
  slug: string;
  intitule: string;
  date: string | null;
  dateInitiale: string | null;
  reglementation: string | null;
  statut: string | null;
  piliers: string[];
  sourceOfficielle: string | null;
  impactAssurance: string;
  impactIds: string[];
  veilleIds: string[];
};

export type ImpactData = {
  id: string;
  intitule: string;
  description: string;
  domaines: string[];
  fonctions: string[];
  branches: string[];
  effort: string | null;
  statut: string | null;
  echeanceIds: string[];
  regleIds: string[];
};

export type Regle = {
  id: string;
  regle: string;
  controle: string;
  nature: string | null;
  criticite: string | null;
  domaine: string | null;
  referenceJuridique: string;
  branches: string[];
  statut: string | null;
  impactIds: string[];
};

export type EtapeParcours = {
  id: string;
  competence: string;
  pilier: string | null;
  statut: string | null;
};

export type Fiche = {
  id: string;
  titre: string;
  statut: string | null;
  miseAJour: string;
  notionUrl: string;
};
