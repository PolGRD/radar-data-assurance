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
- pour chaque source cochée « Active », crée les articles des 7 derniers jours dans Veille au statut « À trier », sans doublon (URL normalisée), dans la limite de 5 par source et par jour ;
- suggère piliers et tags d'après `collecteur/mots_cles.yml` (modifiable directement sur GitHub) et n'enregistre pas les articles qui ne correspondent à aucun pilier, sauf pour les sources cochées « Tout garder » ;
- met à jour « Dernière collecte » et « Erreurs consécutives » ;
- met à la corbeille Notion les articles « À trier » jamais triés après 3 jours et les « Écarté » après 30 jours (restaurables 30 jours) ; les articles retenus ou lus ne sont jamais touchés.

Dans la base Sources, les colonnes « Collectés » et « Répartition par statut » montrent le rendement de chaque source.

Sources sans flux exploitable (site qui bloque les robots, pas de RSS) : on renseigne dans « Flux RSS » une recherche Google Actualités, par exemple `https://news.google.com/rss/search?q=site%3Aexemple.fr&hl=fr&gl=FR&ceid=FR:fr`. Pour les médias généralistes, la requête ajoute les thèmes du radar (`site:exemple.fr (prévoyance OR mutuelle OR IA ...)`) afin de limiter le bruit. Le collecteur retire le nom du média ajouté au titre par Google.

Lancement manuel : onglet Actions du dépôt, « Collecte RSS quotidienne », « Run workflow » (case « Simulation » pour ne rien écrire). Secret requis : `NOTION_TOKEN`.

Tests : `pip install -r collecteur/requirements.txt pytest && python -m pytest collecteur/tests`.

## Digest hebdomadaire (lot 4)

`collecteur/digest.py`, lancé le lundi à 4 h 30 UTC par GitHub Actions (`.github/workflows/digest.yml`), envoie avec Resend un e-mail dont l'objet commence par `[Veille hebdo]` : articles retenus ou lus modifiés dans la semaine (à la une : favoris et pertinence 4 ou 5 ; puis par pilier), échéances des 60 prochains jours, parcours en cours, et une rubrique « À traiter » (articles à trier, sources en erreur depuis 3 jours, impacts à relire, analyses d'impact à faire). Le message est composé par gabarit, sans IA.

Lancement manuel : onglet Actions, « Digest hebdomadaire », « Run workflow », mode `apercu` (le message est joint au lancement, rien n'est envoyé) ou `envoi`. Secrets requis : `NOTION_TOKEN`, `RESEND_API_KEY`, `DIGEST_TO` (sans domaine vérifié, Resend n'envoie qu'à l'adresse du compte Resend).

## Variables d'environnement

Voir `.env.example`. À saisir dans Vercel, jamais dans le code.

## Développement

```bash
npm install
cp .env.example .env.local   # puis remplir les valeurs
npm run dev
```

Organisation du code : `proxy.ts` (protection par mot de passe), `lib/notion.ts` (lecture Notion, noms de propriétés exacts), `app/` (pages et routes API), `components/`.
