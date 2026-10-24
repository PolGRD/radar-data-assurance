---
version: 1
slug: "app-public-blog-page-tsx"
primary_target: "app/(public)/blog/page.tsx"
related_targets: ["app/(public)/blog/[adresse]/page.tsx","app/(public)/a-propos/page.tsx","app/(public)/mentions-legales/page.tsx"]
---

# Blog public (accueil, article, à propos, mentions légales)

Scope : surface publique du site, dans le monde établi par DESIGN.md (éphéméride de bureau). Mode : Read. Build code-led.

Audience et tâche : des pairs (data, conformité, assurance de personnes) qui lisent un article ou parcourent ce qui a été publié. Auteur anonyme : aucun nom sur les pages publiques. Contenu tiré de la base Notion « Articles » (statut Publié) et d'une page Notion « À propos ».

Structure verrouillée par l'utilisateur : almanach par mois (candidat 3 sur 7, tiré au sort, roll dégradé sans challengers). Autres structures présentées : à la une + archive, index par thème.

Mémorable : chaque article est daté par son feuillet ; l'accueil se feuillette mois par mois.

Non résolu : la page « À propos » attend son texte dans Notion ; l'adresse de l'hébergeur est à confirmer sur vercel.com.
