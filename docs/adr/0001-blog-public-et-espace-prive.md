# 0001. Blog public et espace privé dans le même site

Date : 24 octobre 2026. Statut : acceptée.

## Contexte

La phase 2 ouvre un blog public alors que la veille, le calendrier, les règles, les fiches et le parcours restent protégés par mot de passe. L'auteur veut relire ses articles en situation réelle avant publication, sans les exposer. Tout doit rester gratuit (Vercel Hobby) et les pages publiques doivent rester rapides et indexables.

## Décision

- Une seule application. Le proxy (`proxy.ts`) laisse passer les chemins que `estPublic` (`lib/acces.ts`) déclare publics : `/blog` et ses sous-pages (dont le flux RSS), `/a-propos`, `/mentions-legales`, `/sitemap.xml`, plus la connexion. Tout le reste exige la session. Un visiteur arrivant sur `/` est envoyé vers `/blog`.
- Les pages publiques ne lisent pas la session : elles restent statiques et régénérées toutes les heures (ISR), et ne montrent que les articles « Publié » dont la date est arrivée (`articlesPublies`).
- La relecture passe par une route privée distincte, `/relecture`, qui affiche les articles « Relecture » et les articles programmés avec le même composant que le public (`CorpsArticle`).
- Seules les pages publiques sont indexables : métadonnées `index` dans `app/(public)/layout.tsx`, `noindex` partout ailleurs, et `robots.txt` qui n'autorise que ces chemins.

## Conséquences

- Ajouter une page publique demande de l'ajouter à `estPublic` (et son test) puis à `robots.ts` : un oubli la laisse privée, jamais l'inverse.
- Lire la session dans une page publique pour y afficher des articles non publiés rendrait la page dynamique et ferait courir le risque de les exposer en cache ; c'est pourquoi la relecture a sa propre route.
