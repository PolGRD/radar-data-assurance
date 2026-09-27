# Radar Data Assurance

Site de veille personnel (data gouvernance × IA × assurance de personnes). Spécification : `SPECIFICATIONS.md`.

Le contenu se gère uniquement dans Notion. Le site lit les bases toutes les heures ; le bouton « Rafraîchir » force une relecture immédiate.

## Pages (lot 1)

- `/connexion` : mot de passe unique.
- `/` : tableau de bord.
- `/veille` : fil de veille, filtres et recherche.
- `/veille/[id]` : détail d'un élément (seuls les statuts Retenu et Lu sont visibles).
- `/calendrier` : frise des échéances réglementaires, dépliable vers les impacts data puis les règles de gestion.
- `/regles` : référentiel de règles de gestion, filtrable.

## Collecteur RSS (lot 2)

`collecteur/collecte.py`, lancé chaque jour à 4 h UTC par GitHub Actions (`.github/workflows/collecte.yml`) :

- découvre et inscrit dans Notion le flux RSS des sources qui ont une « URL du site » mais pas de flux ;
- pour chaque source cochée « Active », crée les articles des 7 derniers jours dans Veille au statut « À trier », sans doublon (URL normalisée) ;
- suggère piliers et tags d'après `collecteur/mots_cles.yml` (modifiable directement sur GitHub) ;
- met à jour « Dernière collecte » et « Erreurs consécutives ».

Sources sans flux exploitable (site qui bloque les robots, pas de RSS) : on renseigne dans « Flux RSS » une recherche Google Actualités, par exemple `https://news.google.com/rss/search?q=site%3Aexemple.fr&hl=fr&gl=FR&ceid=FR:fr`. Pour les médias généralistes, la requête ajoute les thèmes du radar (`site:exemple.fr (prévoyance OR mutuelle OR IA ...)`) afin de limiter le bruit. Le collecteur retire le nom du média ajouté au titre par Google.

Lancement manuel : onglet Actions du dépôt, « Collecte RSS quotidienne », « Run workflow » (case « Simulation » pour ne rien écrire). Secret requis : `NOTION_TOKEN`.

Tests : `pip install -r collecteur/requirements.txt pytest && python -m pytest collecteur/tests`.

## Variables d'environnement

Voir `.env.example`. À saisir dans Vercel, jamais dans le code.

## Développement

```bash
npm install
cp .env.example .env.local   # puis remplir les valeurs
npm run dev
```

Organisation du code : `proxy.ts` (protection par mot de passe), `lib/notion.ts` (lecture Notion, noms de propriétés exacts), `app/` (pages et routes API), `components/`.
