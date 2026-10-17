import { describe, expect, it } from "vitest";
import { article, regle } from "@/tests/fabriques";
import { filtrerRegles, filtrerVeille } from "./filtres";

const MAINTENANT = new Date("2026-10-17T12:00:00Z");
const ids = (liste: { id: string }[]) => liste.map((x) => x.id);

describe("filtrerVeille", () => {
  const fil = [
    article({ id: "ia-recent", titre: "Omnibus numérique et AI Act", piliers: ["IA"], tags: ["Réglementation"], sources: ["L'Argus"], type: "Actualité", pertinence: 5, datePublication: "2026-10-15" }),
    article({ id: "dg-ancien", titre: "Gouvernance des données en 2026", piliers: ["Data gouvernance"], tags: ["Méthodes"], sources: ["Dataversity"], type: "Analyse", pertinence: 3, datePublication: "2026-07-08", favori: true }),
    article({ id: "prev-coll", titre: "Plafond des IJSS AT/MP", piliers: ["Assurance de personnes"], branches: ["Prévoyance collective"], pertinence: 4, datePublication: null, dateCollecte: "2026-10-06T04:14:24Z" }),
  ];

  it("sans critère, renvoie tout, du plus récent au plus ancien (date de publication, sinon de collecte)", () => {
    expect(ids(filtrerVeille(fil, {}, MAINTENANT))).toEqual(["ia-recent", "prev-coll", "dg-ancien"]);
  });

  it("filtre par pilier, tag, branche, source, type et favori", () => {
    expect(ids(filtrerVeille(fil, { pilier: "IA" }, MAINTENANT))).toEqual(["ia-recent"]);
    expect(ids(filtrerVeille(fil, { tag: "Méthodes" }, MAINTENANT))).toEqual(["dg-ancien"]);
    expect(ids(filtrerVeille(fil, { branche: "Prévoyance collective" }, MAINTENANT))).toEqual(["prev-coll"]);
    expect(ids(filtrerVeille(fil, { source: "L'Argus" }, MAINTENANT))).toEqual(["ia-recent"]);
    expect(ids(filtrerVeille(fil, { type: "Analyse" }, MAINTENANT))).toEqual(["dg-ancien"]);
    expect(ids(filtrerVeille(fil, { favori: "1" }, MAINTENANT))).toEqual(["dg-ancien"]);
  });

  it("combine les critères", () => {
    expect(ids(filtrerVeille(fil, { pilier: "IA", favori: "1" }, MAINTENANT))).toEqual([]);
  });

  it("garde une pertinence minimale", () => {
    expect(ids(filtrerVeille(fil, { pertinence: "4" }, MAINTENANT))).toEqual(["ia-recent", "prev-coll"]);
  });

  it("limite à une période glissante comptée depuis maintenant", () => {
    expect(ids(filtrerVeille(fil, { periode: "7" }, MAINTENANT))).toEqual(["ia-recent"]);
    expect(ids(filtrerVeille(fil, { periode: "30" }, MAINTENANT))).toEqual(["ia-recent", "prev-coll"]);
  });

  it("trie par pertinence décroissante sur demande", () => {
    const parPertinence = filtrerVeille([...fil, article({ id: "peu-pertinent", pertinence: 1, datePublication: "2026-10-16" })], { tri: "pertinence" }, MAINTENANT);
    expect(ids(parPertinence)).toEqual(["ia-recent", "prev-coll", "dg-ancien", "peu-pertinent"]);
  });

  it("recherche sans tenir compte des accents ni de la casse", () => {
    expect(ids(filtrerVeille(fil, { q: "gouvernance donnees" }, MAINTENANT))).toEqual(["dg-ancien"]);
    expect(ids(filtrerVeille(fil, { q: "ijss" }, MAINTENANT))).toEqual(["prev-coll"]);
  });
});

describe("filtrerRegles", () => {
  const regles = [
    { ...regle({ id: "pass", regle: "PASS de la bonne année", nature: "REG", criticite: "C1", domaine: "Cotisations", branches: ["Prévoyance collective"] }), citations: [] },
    { ...regle({ id: "iban", regle: "Prélèvement SEPA : mandat valide", nature: "REG", criticite: "C1", domaine: "Encaissements et impayés", branches: ["Prévoyance individuelle", "Prévoyance collective"], statut: "Validée" }), citations: [{}] },
    { ...regle({ id: "adresse", regle: "Adresse normalisée et exploitable", nature: "GES", criticite: "C3", domaine: "Bénéficiaires et référentiels" }), citations: [] },
  ];

  it("filtre par branche, y compris les règles communes aux deux branches", () => {
    expect(ids(filtrerRegles(regles, { branche: "Prévoyance collective" }))).toEqual(["pass", "iban"]);
    expect(ids(filtrerRegles(regles, { branche: "Prévoyance individuelle" }))).toEqual(["iban", "adresse"]);
  });

  it("filtre par domaine, nature, criticité et statut", () => {
    expect(ids(filtrerRegles(regles, { domaine: "Cotisations" }))).toEqual(["pass"]);
    expect(ids(filtrerRegles(regles, { nature: "GES" }))).toEqual(["adresse"]);
    expect(ids(filtrerRegles(regles, { criticite: "C1" }))).toEqual(["pass", "iban"]);
    expect(ids(filtrerRegles(regles, { statut: "Validée" }))).toEqual(["iban"]);
  });

  it("ne garde que les règles citées par un impact sur demande", () => {
    expect(ids(filtrerRegles(regles, { citee: "1" }))).toEqual(["iban"]);
  });

  it("recherche dans l'intitulé sans tenir compte des accents", () => {
    expect(ids(filtrerRegles(regles, { q: "prelevement" }))).toEqual(["iban"]);
  });
});
