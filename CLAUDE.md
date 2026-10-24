# Radar Data Assurance

Blog de veille personnel de Paul Girardeau : data gouvernance × IA × assurance de personnes (prévoyance et santé, collectives et individuelles). La spécification complète et validée est dans `SPECIFICATIONS.md` (v1.0). La lire avant toute tâche.

## Utilisateur
- Consultant data gouvernance, **non-développeur**. Il ne lit pas le code : expliquer ce qui change côté usage, et guider pas à pas toute action de sa part (comptes, variables d'environnement, clics).
- Échanges en français.
- Style attendu : direct, pas de préambule ni de conclusion récapitulative, pas de flatterie, paragraphes courts, prose plutôt que listes, pas de tirets longs, pas de ton corporate. Commencer par une recommandation quand il y a des options. Dire clairement quand on n'est pas sûr.

## Contraintes non négociables
- **0 €** : Vercel Hobby, GitHub, Notion perso, Resend gratuit. Aucun service payant.
- **Aucune API IA** en phase 1 (pas de clé Anthropic). Qualification manuelle dans Notion.
- **Usage personnel, non commercial.** Aucune mention freelance, offre de services, pub ou affiliation.
- **Aucune donnée Sopra Steria ni client.**
- Notion est le seul back-office. L'utilisateur ne doit jamais avoir à toucher au code pour publier.

## Architecture
- Next.js (App Router) + TypeScript + Tailwind CSS, déployé sur Vercel Hobby à l'adresse `radar-data-assurance.vercel.app`.
- Lecture de Notion via l'API officielle (`@notionhq/client`), ISR avec revalidation d'une heure, plus une route de revalidation manuelle.
- Protection : proxy Next.js (`proxy.ts`), mot de passe unique (`SITE_PASSWORD`), cookie signé HttpOnly de 30 jours (`AUTH_SECRET`). Pages publiques (blog, À propos, mentions légales) définies par `estPublic` dans `lib/acces.ts` (ADR 0001).
- Collecteur RSS et digest hebdo : scripts Python lancés par GitHub Actions (lots 2 et 4).
- Les identifiants des bases Notion sont listés dans `SPECIFICATIONS.md` §14. Les noms de propriétés sont en français, avec accents : les reprendre exactement.

## Secrets
Tous les secrets vont en variables d'environnement : Vercel pour le site, GitHub Secrets pour les Actions. Jamais dans le code ni dans un fichier commité. Fournir un `.env.example` sans valeurs.
- `NOTION_TOKEN` : intégration interne « Radar site » (lecture et mise à jour)
- `SITE_PASSWORD`, `AUTH_SECRET`
- Lot 4 : `RESEND_API_KEY`, `DIGEST_TO`

## Découpage
- Lots 0, 1 et 2 : faits.
- Lot 3 : fait (frise, impacts assureur, règles de gestion, fiches, parcours).
- Lot 4 : digest e-mail.
- Lot 5 : phase 2, blog public : fait (blog, relecture privée, À propos, mentions légales, RSS, sitemap).

## Ingénierie
Objectif : un code que l'on peut faire évoluer longtemps sans peur de casser l'existant.
- Une livraison = un sujet. Pas de refonte opportuniste glissée dans une fonctionnalité.
- Tester avant de livrer. Toute logique nouvelle ou corrigée (calculs, filtres, liens entre bases, collecteur) arrive avec un test automatisé ; pour un bug, écrire d'abord le test qui le reproduit (skills `tdd` et `diagnosing-bugs`).
- Avant chaque envoi : `npm run lint`, `npm run typecheck`, `npm test` (Vitest, fichiers `*.test.ts` à côté du code testé) et `python -m pytest collecteur/tests`, et une vérification du rendu dans un navigateur quand l'interface change. Le workflow « Vérifications » rejoue ces contrôles sur chaque PR : ne jamais demander de fusionner une PR en rouge.
- Relire son propre diff avant l'envoi : code mort, branchements de test oubliés, secrets.
- Quand le format des données lues dans Notion change, changer la clé du cache `unstable_cache` correspondante.
- Les décisions d'architecture qui ne vont pas de soi sont consignées en ADR dans `docs/adr/`, le vocabulaire métier dans `GLOSSARY.md` (skill `domain-modeling`).
- Les skills du projet sont dans `.agents/skills/` (installés avec `npx skills`, verrouillés dans `skills-lock.json`).

## Pédagogie
L'utilisateur veut apprendre les bonnes pratiques d'ingénierie logicielle au fil du projet.
- À chaque livraison de code, terminer par un encart **Bonne pratique** : nommer la pratique appliquée, dire en deux ou trois phrases pourquoi elle compte ici, avec l'exemple concret du changement. Une seule pratique par livraison, sans répéter une pratique déjà expliquée récemment.
- Employer le terme technique exact (test de non-régression, intégration continue, dette technique…) et le définir en une phrase la première fois.
- Pour approfondir un sujet à la demande, proposer le skill `/teach`, à lancer dans un dossier dédié `apprentissage/` pour ne pas mélanger cours et code du site.
