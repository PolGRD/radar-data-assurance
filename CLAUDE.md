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
- Protection : middleware Next.js, mot de passe unique (`SITE_PASSWORD`), cookie signé HttpOnly de 30 jours (`AUTH_SECRET`). En phase 2, `/blog` sera exclu du middleware.
- Collecteur RSS et digest hebdo : scripts Python lancés par GitHub Actions (lots 2 et 4).
- Les identifiants des bases Notion sont listés dans `SPECIFICATIONS.md` §14. Les noms de propriétés sont en français, avec accents : les reprendre exactement.

## Secrets
Tous les secrets vont en variables d'environnement : Vercel pour le site, GitHub Secrets pour les Actions. Jamais dans le code ni dans un fichier commité. Fournir un `.env.example` sans valeurs.
- `NOTION_TOKEN` : intégration interne « Radar site » (lecture et mise à jour)
- `SITE_PASSWORD`, `AUTH_SECRET`
- Lot 4 : `RESEND_API_KEY`, `DIGEST_TO`

## Découpage
- Lot 0 : fait (bases Notion créées et amorcées).
- **Lot 1 : site MVP**. Connexion, tableau de bord, fil de veille avec filtres et recherche, page de détail.
- Lot 2 : collecteur RSS avec pré-classement par mots-clés.
- Lot 3 : fiches, calendrier, parcours.
- Lot 4 : digest e-mail.
- Lot 5 : phase 2, blog public.
