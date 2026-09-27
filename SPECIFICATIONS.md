# Dossier de spécification : blog de veille Data, IA et assurance de personnes

Version 1.0 du 26/09/2026. Auteur : Paul Girardeau. Statut : validée, base de démarrage du lot 0.

Changements depuis la v0.2 : blog strictement personnel et non commercial, offre gratuite de Vercel sur toute la durée du projet, nom du site fixé, sources et tags validés, pré-classement par mots-clés conservé.

## 1. Contexte et objectifs

Consultant senior en data gouvernance chez Sopra Steria. Je vise une niche à la confluence de la data gouvernance et du data management, de l'IA et du métier assurance de personnes (prévoyance et santé, collectives et individuelles).

Le site sert d'abord d'outil de capitalisation (phase 1, privé). Il deviendra ensuite un blog personnel (phase 2, public). Il n'a aucune vocation commerciale et ne présente aucune offre de services. Je peux en partager l'URL et le mot de passe avec des collègues.

**Nom et URL** : Radar Data Assurance, à l'adresse `radar-data-assurance.vercel.app` (disponible au 26/09/2026). Le nom est court et neutre, sans marque employeur. Le mot « radar » colle à la veille et au format tableau de bord. Il n'est lié à aucun domaine payant et reste renommable plus tard.

| Phase | Objectif | Visibilité |
|---|---|---|
| 1 | Centraliser, qualifier et capitaliser la veille (fiches, calendrier, parcours) | Privée, protégée par un mot de passe |
| 2 | Publier mes articles et construire une expertise visible | Blog public, la veille restant privée |

### Contraintes
- **Non-développeur** : tout l'usage quotidien se fait dans Notion.
- **100 % gratuit** sur l'offre Vercel Hobby, en usage personnel et non commercial, sans nom de domaine.
- **Aucune API IA en phase 1** : résumé, classement et pertinence sont saisis à la main. L'architecture laisse la place pour brancher une IA plus tard sans refonte.
- **Site personnel** à mon nom, sur mon Notion perso. Aucune donnée Sopra Steria ni client.
- **Français uniquement**. Volume attendu de 10 à 30 éléments par semaine.

## 2. Périmètre fonctionnel

### Phase 1
| # | Fonctionnalité | Priorité |
|---|---|---|
| F1 | Fil de veille : les éléments retenus, présentés en cartes | Must |
| F2 | Filtres (pilier, tag, branche, source, type, période, pertinence) et recherche plein texte | Must |
| F3 | Collecte automatique quotidienne des flux RSS vers Notion, sans IA | Must |
| F4 | Pré-classement par mots-clés (règles simples, gratuit) | Should |
| F5 | Ajout manuel via le Notion Web Clipper (navigateur et mobile) | Must |
| F6 | Workflow de qualification et de validation dans Notion | Must |
| F7 | Tableau de bord d'accueil | Must |
| F8 | Mot de passe unique sur tout le site | Must |
| F9 | Fiches de synthèse | Should |
| F10 | Calendrier réglementaire | Should |
| F11 | Parcours d'apprentissage | Should |
| F12 | Digest e-mail hebdomadaire, sans IA, classé automatiquement dans Gmail | Should |

### Phase 2
- Blog public (`/blog`) et page « À propos » (parcours, centres d'intérêt).
- SEO, flux RSS sortant, mentions légales. Nom de domaine optionnel.
- Enrichissement IA optionnel (résumés, tags), activable via une clé API.

### Hors périmètre
Commentaires, multi-utilisateurs, glossaire, version anglaise.

## 3. Architecture

```
Sources RSS ──(cron quotidien)──▶ GitHub Actions : collecteur
                                   - dédoublonnage
                                   - extrait de l'article
                                   - pré-classement par mots-clés
                                             │
Web Clipper Notion ─────────────┐            ▼
                                └──▶ NOTION (back-office)
Qualification manuelle ────────────▶ Veille, Sources, Fiches,
                                     Échéances, Parcours, Articles
                                        │                 │
                                        ▼                 ▼
                         Site Next.js sur Vercel    GitHub Actions hebdo
                         (mot de passe, ISR 1 h)    digest → Resend → Gmail
```

| Brique | Choix | Raison |
|---|---|---|
| Back-office | Notion perso (gratuit) | Déjà maîtrisé, application mobile, Web Clipper |
| Site | Next.js + Tailwind CSS | Le middleware permet un mot de passe gratuit sur Vercel Hobby. Public et privé pourront cohabiter en phase 2. |
| Hébergement | Vercel Hobby | Gratuit, déploiement automatique depuis GitHub |
| Rafraîchissement | ISR toutes les heures, plus un bouton « rafraîchir » | Pas de rebuild à gérer |
| Collecte et digest | GitHub Actions planifiées, en Python | Gratuit : environ 60 min par mois consommées sur les 2 000 disponibles |
| E-mail | Resend, offre gratuite | Aucun domaine requis pour envoyer vers sa propre adresse |
| Recherche | Index côté client (Fuse.js) | Suffisant pour environ 1 500 éléments par an |
| Code | Dépôt GitHub privé | Versionnement et secrets chiffrés |

### Points d'attention
- **Images Notion** : les URL des fichiers hébergés par Notion expirent au bout d'une heure. Il faut privilégier des images externes ou les mettre en cache.
- **Vercel Hobby** est réservé à un usage non commercial, ce qui correspond au projet. Il ne faudra ni publicité, ni affiliation, ni offre de prestations sur le site.
- **Mot de passe** : stocké en variable d'environnement Vercel, avec un cookie signé HttpOnly valable 30 jours. Le mot de passe est unique : un collègue qui le reçoit voit tout, y compris « Mes notes ». Il ne faut donc rien écrire dans les notes que je ne partagerais pas avec eux. Pour en couper l'accès, on change le mot de passe dans Vercel.

## 4. Modèle de données Notion

### Base « Veille »
| Propriété | Type | Remplie par | Rôle |
|---|---|---|---|
| Titre | Titre | Collecteur ou moi | |
| URL | URL | Collecteur ou moi | Clé de dédoublonnage |
| Source | Relation vers Sources | Collecteur | |
| Date de publication | Date | Collecteur | |
| Date de collecte | Date de création | Automatique | |
| Extrait | Texte | Collecteur | Chapô du flux RSS (environ 300 caractères) |
| Résumé | Texte | Moi | 2 ou 3 phrases, facultatif |
| Piliers | Multi-select | Pré-rempli par mots-clés, puis moi | Data gouvernance, IA, Assurance de personnes |
| Tags | Multi-select | Pré-rempli, puis moi | Voir §5 |
| Branche | Multi-select | Moi | Santé coll., Santé indiv., Prévoyance coll., Prévoyance indiv. |
| Type | Select | Moi | Actualité, Analyse, Texte réglementaire, Étude, Tutoriel, Événement, Podcast/Vidéo |
| Pertinence | Select 1 à 5 | Moi | |
| Statut | Select | Moi | À trier, Retenu, Écarté, Lu |
| Favori | Case à cocher | Moi | Mise en avant |
| Mes notes | Corps de page | Moi | |
| Fiches liées | Relation vers Fiches | Moi | |
| Échéance liée | Relation vers Échéances | Moi | |

Seuls les éléments au statut Retenu ou Lu s'affichent sur le site.

**Rituel de tri proposé** : 15 minutes, deux ou trois fois par semaine, dans une vue Notion « À trier » triée par source. Pour chaque ligne, on met un statut et une pertinence. On ne complète les autres champs que pour ce qui est retenu. Le résumé reste facultatif, parce que c'est lui qui coûte du temps. Si le tri déborde de 15 minutes, c'est qu'il y a trop de sources : on en coupe plutôt que d'allonger le rituel.

### Autres bases
- **Sources** : Nom, URL du site, URL du flux RSS, Méthode (RSS ou Manuel), Pilier principal, Active, Dernière collecte. Ajouter une source revient à ajouter une ligne dans Notion.
- **Fiches de synthèse** : Titre, Piliers, Tags, Statut (Ébauche, En cours, Stable), Mise à jour, Veille liée, contenu dans le corps de la page.
- **Échéances réglementaires** : Intitulé, Date, Réglementation, Pilier, Impact assurance, Statut (À venir, En vigueur, Reportée), Source officielle, Veille liée.
- **Parcours d'apprentissage** : Compétence, Pilier, Type (Lecture, Formation, Certification, Pratique), Ressource, Statut (À faire, En cours, Fait), Échéance cible, Notes.
- **Articles** (phase 2, créée vide) : Titre, Slug, Statut (Brouillon, Relecture, Publié), Date, Résumé, Piliers, Tags, Couverture, contenu.

## 5. Taxonomie

**Piliers** : Data gouvernance (gouvernance, qualité, référentiels, lignage, métadonnées, rôles), IA (générative, ML, IA responsable, régulation, cas d'usage), Assurance de personnes (prévoyance et santé, collectives et individuelles).

**Tags transverses** : Réglementation, Conformité & risques, RGPD, Qualité des données, Cas d'usage, Tarification & actuariat, Prestations & sinistres, Souscription, Relation client, Fraude, Éthique & biais, Architecture & outils, Marché & acteurs, Méthodes.

**Grille de pertinence** : 1 hors sujet, 2 un seul pilier et peu d'intérêt, 3 un pilier avec un intérêt réel, 4 deux piliers croisés, 5 trois piliers ou un impact réglementaire direct sur l'assurance de personnes.

**Pré-classement par mots-clés (F4)** : un dictionnaire éditable dans le dépôt associe des mots-clés à un pilier ou à un tag. Par exemple « prévoyance, mutuelle, ANI, contrat responsable, DSN » pour Assurance de personnes, et « AI Act, LLM, apprentissage automatique » pour IA. Le collecteur coche les piliers détectés. C'est une suggestion, pas une décision. Il faut s'attendre à des faux positifs, que je corrige au tri.

## 6. Sources initiales (à valider, RSS à vérifier au lot 2)

| Pilier | Sources |
|---|---|
| Data gouvernance | The Data Governor, DAMA France, Dataversity, blogs éditeurs (Collibra, Informatica) |
| IA | CNIL (dossier IA), AI Office de la Commission européenne, Hub France IA |
| Réglementaire | ACPR, EIOPA, CNIL, EUR-Lex (AI Act, DORA) |
| Assurance | L'Argus de l'assurance, News Assurances Pro, La Tribune de l'Assurance, Le Journal de l'Assurance, France Assureurs, CTIP, Mutualité Française |

Les sources sans RSS (LinkedIn, newsletters, podcasts) passent par le Web Clipper.

## 7. Écrans (style tableau de bord)

| Page | Contenu |
|---|---|
| Connexion | Champ mot de passe |
| Tableau de bord `/` | Retenus de la semaine par pilier, nombre d'éléments « À trier » en attente, favoris et pertinence 5, 5 prochaines échéances, progression du parcours, dernières fiches modifiées |
| Veille `/veille` | Grille de cartes (titre, source, date, badges, pertinence, extrait ou résumé), filtres latéraux, recherche |
| Détail | Résumé, extrait, mes notes, lien vers la source, fiches et échéances liées |
| Fiches `/fiches` | Liste filtrable et page de lecture |
| Calendrier `/calendrier` | Frise des échéances, filtrable par réglementation |
| Parcours `/parcours` | Colonnes À faire / En cours / Fait par pilier, avec une barre de progression |
| Blog `/blog` (phase 2) | Public, mise en page éditoriale |

Exigences transverses : responsive, mode sombre, contrastes suffisants, navigation au clavier.

## 8. Automatisations

### Collecte quotidienne (6 h)
1. Lire les sources actives.
2. Lire les flux RSS.
3. Dédoublonner à partir de l'URL normalisée.
4. Créer la ligne dans Veille avec le statut « À trier », l'extrait et les piliers ou tags pré-remplis par mots-clés.
5. Mettre à jour « Dernière collecte ».
6. Si une source échoue trois jours de suite, le digest la signale.

### Digest hebdomadaire (lundi, 7 h), sans IA
Contenu généré par gabarit :
- les favoris et les éléments de pertinence 4 et plus retenus dans la semaine ;
- les autres éléments retenus, groupés par pilier, avec mes notes s'il y en a ;
- les échéances des 60 prochains jours ;
- les éléments du parcours « En cours » ;
- un rappel du nombre d'éléments encore « À trier » et des sources en erreur.

Le digest est envoyé à paul.girardeauiae@gmail.com (adresse stockée en secret GitHub, pas dans le code). L'expéditeur est Resend. L'objet est toujours préfixé `[Veille hebdo]`.

**Classement Gmail** : libellé `Veille/Digest`, avec un filtre `subject:"[Veille hebdo]"` qui applique le libellé et archive le message (il ne passe pas par la boîte de réception). Le connecteur Gmail dont je dispose permet de créer le libellé, mais pas le filtre : Paul créera le filtre (4 clics, guide fourni au lot 4). Avant de créer le libellé, il faudra vérifier que le connecteur pointe bien sur ce compte Gmail et non sur la messagerie Sopra Steria.

## 9. Budget

| Poste | Phase 1 | Phase 2 |
|---|---|---|
| Notion, GitHub, Vercel Hobby, Resend | 0 € | 0 € |
| IA | 0 € (aucune) | Optionnelle, moins de 1 € par mois |
| Nom de domaine | aucun | Optionnel, 10 à 15 € par an |

## 10. Sécurité et conformité
- Secrets (token Notion, clé Resend, mot de passe du site, adresse du digest) stockés uniquement dans GitHub Secrets et Vercel.
- L'intégration Notion n'a accès qu'aux 6 bases du site.
- Aucune donnée Sopra Steria ni client, y compris dans la partie privée.
- Site privé exclu de l'indexation (`noindex`, `robots.txt`).
- Le site affiche l'extrait du flux et mes propres textes, jamais l'article intégral.
- Avant la phase 2 : vérifier la charte Sopra Steria sur la prise de parole publique. Chaque article parle en mon nom propre, sans référence à des clients ou missions.

## 11. Découpage en lots

| Lot | Contenu | Action de Paul |
|---|---|---|
| 0. Socle | 6 bases Notion créées via le connecteur, dépôt GitHub, projet Vercel | Créer l'intégration Notion, lui partager les bases, relier Vercel à GitHub |
| 1. Site MVP | Mot de passe, tableau de bord, veille, filtres, recherche, détail | Saisir 10 à 15 éléments de test |
| 2. Collecte | Collecteur RSS, pré-classement par mots-clés, vues Notion de tri | Valider les sources et les mots-clés |
| 3. Rubriques | Fiches, calendrier, parcours (amorcés, voir §12) | Relire et compléter l'amorçage |
| 4. Digest | E-mail hebdo, libellé Gmail | Créer le compte Resend, créer le filtre Gmail |
| 5. Phase 2 | Blog public, SEO, pages légales | Articles |

Chaque action de Paul est accompagnée d'un guide pas à pas.

## 12. Amorçage du parcours d'apprentissage

Proposition à partir du profil (senior data gouvernance, cible métier assurance de personnes) :

| Pilier | Compétence | Type |
|---|---|---|
| Assurance | Fondamentaux de la protection sociale complémentaire : régimes obligatoires et complémentaires, acteurs (assureurs, mutuelles, institutions de prévoyance) | Lecture |
| Assurance | Collectif : ANI, loi Évin, contrat responsable, portabilité, 100 % santé, DUE et accord collectif | Lecture |
| Assurance | Flux de données métier : DSN et ses blocs prévoyance, tiers payant, NOEMIE, gestion des prestations | Pratique |
| Assurance | Solvabilité II vu de la data : qualité des données (piliers 1 et 3), reporting QRT | Lecture |
| Data gouvernance | Certification DAMA CDMP | Certification |
| Data gouvernance | Cas d'usage appliqué : cartographie des données d'un contrat collectif prévoyance | Pratique |
| IA | AI Act : obligations des systèmes à haut risque, dont l'annexe III (tarification et évaluation des risques en assurance vie et santé) | Lecture |
| IA | Gouvernance des données pour l'IA : qualité des jeux d'entraînement, biais, traçabilité | Lecture |
| Transverse | RGPD et données de santé : base légale, HDS, AIPD | Lecture |

Niveau de confiance : élevé sur la pertinence des thèmes. Plus faible sur les dates d'application de l'AI Act : un report des obligations haut risque a été proposé fin 2025 (omnibus numérique), et son état d'adoption doit être vérifié avant de remplir le calendrier.

## 13. Critères d'acceptation (phase 1)
- Aucune page n'est accessible sans le mot de passe.
- Un élément passé à Retenu apparaît sur le site en moins d'une heure, ou immédiatement après un clic sur « rafraîchir ».
- La collecte tourne chaque jour sans intervention et ne crée jamais de doublon.
- Le digest arrive le lundi avant 8 h, avec le libellé Veille/Digest et hors de la boîte de réception.
- Le site est lisible sur mobile.
- Coût de 0 €.

## 14. Référentiel Notion (créé le 26/09/2026, lot 0)

Page racine « Radar Data Assurance » : `3e79725b276581748650e029ed666430` (compte Notion perso).

| Base | Database ID | Data source ID |
|---|---|---|
| Veille | `796894e5ef82489c8e235a0ea2f3d2dd` | `0e0d1142-dd37-485c-9b9a-5a81297fe05a` |
| Sources | `6e5f1d1be96a4169a1e55ad429fe0800` | `bf49b3d4-9111-41db-a4da-53ff30b10dec` |
| Fiches de synthèse | `bdd27068179840c3a8381d1ed542a9ea` | `795a44e4-0363-4b82-8698-dae7a446211c` |
| Échéances réglementaires | `980490a9db964be2a92354c0f263b8ba` | `4f13f344-aea7-4a81-aba6-f5a14b21e09b` |
| Parcours d'apprentissage | `49e794ef85fc4da6803768e8ddfa5095` | `d93b2f61-5c7d-4cf1-8943-012d5a2445dd` |
| Articles | `bb5f7714dd704e718789b0267cb12721` | `df8e3e65-e829-49d7-bb7e-150fbafcb3dd` |
| Impacts data | `d92773c28adc40c4b9aad74ba735d8d6` | `64eabb90-48fe-4ad4-ac2d-97b2b85b7bb5` |
| Règles de gestion | `7d3bb58e65284f60a8973b11793b0895` | `a2a82ac9-b5cc-4c91-948b-16279dde5ee4` |

Relations bidirectionnelles : Veille ↔ Sources, Veille ↔ Fiches, Veille ↔ Échéances (propriété « Éléments de veille » côté cible). Vues créées : Veille (À trier, Retenus, Par statut), Parcours (Avancement), Échéances (Calendrier). Données amorcées : 16 sources (inactives, RSS à renseigner au lot 2), 9 compétences, 4 échéances.

### Évolution du 27/09/2026 : frise réglementaire et impacts data
- Chaîne de drill down : Échéance → Impacts data → Règles de gestion (relations bidirectionnelles, pas de lien direct échéance-règle).
- **Impacts data** : Intitulé, Description, Domaine data, Fonctions concernées, Branche, Effort, Statut (À relire, Validé), Échéances, Règles.
- **Règles de gestion** : Règle, Contrôle, Nature (REG, PDT, GES), Criticité (C1 à C3), Domaine de gestion, Référence juridique, Branche, Statut (Proposée, Validée, Invalidée, Reformulée), Impacts data. Amorcée avec 141 règles de prévoyance individuelle (version neutralisée). Page d'introduction « Référentiel de règles de gestion ».
- Échéances : ajout de « Date initiale » (date avant report, affichée barrée).
- Site : `/calendrier` en frise verticale avec dépliage sur deux niveaux et une adresse par échéance (`/calendrier#slug`), `/regles` filtrable et consultable.

## 15. Décisions actées
- Sources (§6) et tags (§5) validés en l'état, révisables à tout moment dans Notion.
- Pré-classement par mots-clés (F4) conservé. Il se désactive d'une ligne s'il gêne.
- Aucun usage commercial, aucune mention d'activité freelance.
