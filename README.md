# Radar Data Assurance

Site de veille personnel (data gouvernance × IA × assurance de personnes). Spécification : `SPECIFICATIONS.md`.

Le contenu se gère uniquement dans Notion. Le site lit les bases toutes les heures ; le bouton « Rafraîchir » force une relecture immédiate.

## Pages (lot 1)

- `/connexion` : mot de passe unique.
- `/` : tableau de bord.
- `/veille` : fil de veille, filtres et recherche.
- `/veille/[id]` : détail d'un élément (seuls les statuts Retenu et Lu sont visibles).

## Variables d'environnement

Voir `.env.example`. À saisir dans Vercel, jamais dans le code.

## Développement

```bash
npm install
cp .env.example .env.local   # puis remplir les valeurs
npm run dev
```

Organisation du code : `proxy.ts` (protection par mot de passe), `lib/notion.ts` (lecture Notion, noms de propriétés exacts), `app/` (pages et routes API), `components/`.
