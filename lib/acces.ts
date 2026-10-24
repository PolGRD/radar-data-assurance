// Pages visibles sans mot de passe (phase 2) : le blog et ce qui l'accompagne. Tout le reste est privé.
const PAGES_PUBLIQUES = ["/connexion", "/api/login", "/a-propos", "/mentions-legales", "/sitemap.xml"];

export function estPublic(chemin: string): boolean {
  return PAGES_PUBLIQUES.includes(chemin) || chemin === "/blog" || chemin.startsWith("/blog/");
}

// Un visiteur qui arrive sur l'adresse du site voit le blog ; les autres pages privées demandent le mot de passe.
export function redirectionVisiteur(chemin: string): "/blog" | "/connexion" {
  return chemin === "/" ? "/blog" : "/connexion";
}
