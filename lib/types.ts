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
  intitule: string;
  date: string | null;
  reglementation: string | null;
  statut: string | null;
  piliers: string[];
  sourceOfficielle: string | null;
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
