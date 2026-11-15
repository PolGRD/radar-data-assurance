# Reprise du projet (passation du 15/11/2026)

Document de passation pour une nouvelle session Claude Code, ouverte depuis un autre compte Claude. Il ne contient que ce qui n'est écrit nulle part ailleurs ; pour le reste, lire dans l'ordre :

1. `CLAUDE.md` : règles de travail, contraintes, style attendu, état des lots.
2. `SPECIFICATIONS.md` : spécification v1.0 ; §14 pour les identifiants Notion, §15 pour les décisions actées.
3. `README.md` : pages, collecteur, digest, lancement manuel.
4. `docs/adr/0001-blog-public-et-espace-prive.md` : pages publiques et espace privé.
5. `PRODUCT.md`, `DESIGN.md`, `.impeccable/` : produit et système visuel (identité « éphéméride de bureau »).
6. L'historique Git (`git log`) : chaque livraison y est décrite.

## Où en est le projet

Tous les lots de la spécification sont livrés et fusionnés dans `main` (dernière fusion : PR n° 16, retrait des fiches et du parcours). Le site tourne sur `radar-data-assurance.vercel.app` : espace privé protégé par mot de passe, blog public sur `/blog`. Aucun travail en cours, aucune branche non fusionnée.

Changements récents qui ne sont pas encore reflétés partout :

- Fiches de synthèse et parcours d'apprentissage ont été retirés du site, du digest et de Notion le 13/11/2026. Les deux bases sont dans la corbeille Notion (restaurables jusqu'au 13/12/2026 environ) ; leurs lignes dans `SPECIFICATIONS.md` §14 sont donc obsolètes.
- La base Veille ne contient plus que des articles « Retenu » (les « Lu » ont été repassés en « Retenu », les « À trier » mis à la corbeille). La colonne « Fiches liées » a été supprimée.
- Le collecteur crée au plus 2 articles par source et par passage (`MAX_PAR_SOURCE` dans `collecteur/collecte.py`).

## Ce qui reste à faire (côté utilisateur, à accompagner)

- **Changement d'adresse e-mail.** L'utilisateur quitte son adresse professionnelle pour une adresse personnelle. Avant de perdre l'accès à l'ancienne adresse, vérifier et changer l'e-mail de connexion de GitHub, Vercel, Notion et Resend. Pour Resend : sans domaine vérifié, le digest ne part que vers l'adresse du compte Resend ; mettre à jour le secret GitHub `DIGEST_TO` en conséquence.
- **Connecteurs du nouveau compte Claude** : application GitHub autorisée sur `PolGRD/radar-data-assurance`, connecteur Notion (espace de travail perso), éventuellement Vercel. Recréer un environnement cloud si besoin.
- **Mentions légales** : l'adresse de l'hébergeur (Vercel Inc., Covina) n'a pas pu être vérifiée sur vercel.com depuis l'environnement (réseau bloqué). La faire confirmer par l'utilisateur sur la politique de confidentialité de Vercel ; elle se corrige dans `app/(public)/mentions-legales/page.tsx`.
- **Page « À propos »** : la page Notion « À propos (blog public) » existe mais est vide (identifiant dans `lib/config.ts`, `PAGE_A_PROPOS`). Tant qu'elle est vide, `/a-propos` n'existe pas. Si elle n'apparaît pas une fois remplie : la partager avec l'intégration « Radar site ».
- **Premier article du blog** : aucun article publié. Procédure dans `README.md` (base « Articles », statut « Relecture » puis « Publié »).
- **Place dans Notion gratuit** (limite de 1 000 blocs signalée par l'utilisateur) : vider la corbeille Notion, vérifier qu'il est seul membre de l'espace (la limite ne s'applique qu'à partir de deux membres). Prochain levier si besoin : les 194 règles de gestion.
- **Veille** : l'article « Fiscalité, utilisation des données… Mutualité française… Sécurité sociale 2027 » a son analyse d'impact à « À faire ».

## Façon de travailler établie

- L'utilisateur fusionne lui-même les PR. Ne jamais pousser sur `main`, ne créer une PR que s'il le demande. Après chaque fusion qu'il annonce (« c'est mergé »), repartir de `origin/main`.
- Mettre une page Notion à la corbeille seulement sur demande explicite, en montrant la liste avant.
- Pour supprimer une donnée dont le code dépend : retirer d'abord la dépendance du code, faire fusionner, puis supprimer dans Notion.
- Vérifier le rendu dans un navigateur à chaque changement d'interface. Méthode utilisée : un faux serveur Notion local (script Node qui répond aux routes `data_sources/:id/query`, `pages/:id` et `blocks/:id/children`), branché en ajoutant temporairement `baseUrl: process.env.MOCK_NOTION_URL` au client de `lib/notion.ts`, puis `next build` et `next start` avec des valeurs de test pour `SITE_PASSWORD` et `AUTH_SECRET`. Retirer ce branchement avant tout commit. Le script n'est pas versionné ; il faut le réécrire.

## Pièges rencontrés dans l'environnement cloud

- `pytest` peut manquer : `python -m pip install --ignore-installed PyYAML -r collecteur/requirements.txt pytest`.
- Supprimer les `__pycache__` de `collecteur/` avant de lancer les tests Python (ou `PYTHONDONTWRITEBYTECODE=1`) : un bytecode périmé a déjà faussé des résultats.
- `npm run typecheck` lance `next typegen` avant `tsc` ; sans lui, `PageProps` et `LayoutProps` sont inconnus.
- Playwright : depuis un script hors du projet, le charger avec `createRequire("/opt/node-tools/")("playwright")` et le navigateur `/opt/pw-browsers/chromium` ; des processus `next start` restés actifs servent des fichiers supprimés après un `rm -rf .next` (les arrêter par leur numéro de processus).
- Le réseau sortant bloque beaucoup de sites (cnil.fr, eur-lex, vercel.com, impeccable.style…) : la recherche web passe, la lecture directe des pages non.
- Connecteur Notion : les requêtes SQL sur plusieurs bases à la fois exigent un forfait Business ; une base à la fois (mode SQL ou `rows`) fonctionne.
- Skill Impeccable : son service de tirage des directions est injoignable, il tourne en mode dégradé (le dire à l'utilisateur).

## Skills suggérés

- `tdd` pour toute logique nouvelle ou corrigée ; `diagnosing-bugs` pour un bug.
- `impeccable` pour tout travail d'interface (lire `DESIGN.md` et la fiche de surface dans `.impeccable/surfaces/` avant).
- `domain-modeling` pour un ADR ou le vocabulaire métier (`GLOSSARY.md` n'existe pas encore).
- `teach`, dans un dossier `apprentissage/`, si l'utilisateur veut approfondir une pratique.
