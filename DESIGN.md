---
name: Radar Data Assurance
description: Veille data gouvernance × IA × assurance de personnes, lue comme une éphéméride de bureau.
colors:
  papier-froid: "#eef1f6"
  feuille: "#ffffff"
  feuille-2: "#f6f8fb"
  encre: "#14203a"
  encre-2: "#44506b"
  encre-3: "#5f6a84"
  filet: "#dce1eb"
  filet-2: "#bcc4d6"
  bleu-de-prusse: "#163a7a"
  bleu-de-prusse-fonce: "#0f2c61"
  vermillon: "#c8321c"
  vermillon-pale: "#fbe7e2"
  alerte: "#8a5a00"
  alerte-pale: "#fdf2d6"
typography:
  quantieme:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "5.5rem"
    fontWeight: 700
    lineHeight: 1
  chiffre:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1
  headline:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  headline-lecture:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  title:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.375
  body:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.625
  body-lecture:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.33
rounded:
  etiquette: "4px"
  feuillet: "5px"
  champ: "6px"
  rangee: "8px"
  panneau: "12px"
  pastille: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  bandeau-navigation:
    backgroundColor: "{colors.bleu-de-prusse}"
    textColor: "{colors.feuille}"
  bouton-principal:
    backgroundColor: "{colors.bleu-de-prusse}"
    textColor: "{colors.feuille}"
    rounded: "{rounded.champ}"
    padding: "8px 14px"
  bouton-principal-hover:
    backgroundColor: "{colors.bleu-de-prusse-fonce}"
  bouton-secondaire:
    backgroundColor: "{colors.feuille}"
    textColor: "{colors.encre}"
    rounded: "{rounded.champ}"
    padding: "8px 14px"
  champ:
    backgroundColor: "{colors.feuille}"
    textColor: "{colors.encre}"
    rounded: "{rounded.champ}"
    padding: "6px 10px"
  panneau:
    backgroundColor: "{colors.feuille}"
    rounded: "{rounded.panneau}"
  feuillet-bandeau:
    backgroundColor: "{colors.vermillon}"
    textColor: "{colors.feuille}"
    typography: "{typography.label}"
  etiquette:
    backgroundColor: "{colors.feuille-2}"
    textColor: "{colors.encre-2}"
    rounded: "{rounded.etiquette}"
    padding: "2px 6px"
---

# Design System: Radar Data Assurance

## Overview

**Creative North Star: "L'éphéméride de bureau"**

Le site se lit comme on arrache la feuille du jour : la date d'abord, puis ce qui est tombé, ce qui arrive et ce qui attend une action. Le monde de l'éphéméride ne prête que quatre choses à un écran de travail : un papier froid bleuté, une encre bleu nuit, une grotesque condensée pour les chiffres et une signature, le feuillet daté. La mise en page, la navigation et les contrôles restent ceux d'un produit web ordinaire.

La densité est celle d'un outil consulté quelques minutes par jour au bureau : panneaux bordés, listes à filets, peu de vide décoratif. Le mode sombre transpose le même monde (fond encre, feuilles bleu nuit, vermillon éclairci) sans en changer les rôles.

**Key Characteristics:**
- Bandeau de navigation bleu de Prusse plein, onglet actif souligné de vermillon.
- Toute date d'échéance est un feuillet : bandeau du mois, grand quantième condensé.
- Vermillon réservé aux dates à venir, à l'urgence et à ce qui demande une action.
- Chiffres en Barlow Condensed auto-hébergée, texte en police système.
- Couleurs de piliers et de réglementations (reprises de Notion) traitées comme séries de données.

## Colors

Un papier froid, une encre bleu nuit, un bleu de Prusse pour l'ossature et un vermillon rare qui signale le temps.

### Primary
- **Bleu de Prusse** (bleu-de-prusse) : bandeau de navigation, bouton principal, années de la frise, feuillets des articles de veille (bandeau « calme »). Plus foncé au survol (bleu-de-prusse-fonce).

### Secondary
- **Vermillon d'éphéméride** (vermillon) : bandeau des feuillets d'échéance à venir, compte à rebours, marqueur « Aujourd'hui », points de pertinence, favoris, criticité C1, chiffres « À traiter » non nuls, anneau de focus. Sa version pâle (vermillon-pale) porte les mentions « impacts assureur » et la criticité C2.

### Tertiary
- **Ocre d'alerte** (alerte, alerte-pale) : impacts « À relire », échéances « Reportée », messages de configuration incomplète.

### Neutral
- **Papier froid** (papier-froid) : fond de page.
- **Feuille** (feuille) et **feuille ombrée** (feuille-2) : panneaux, cartes de la frise, en-têtes de liste, survol des rangées.
- **Encre** (encre, encre-2, encre-3) : texte principal, texte secondaire, métadonnées. Les trois passent 4,5:1 sur feuille.
- **Filets** (filet, filet-2) : bordures de panneaux et séparateurs de listes ; filet-2 pour les bordures de champs et l'axe de la frise.

### Named Rules
**La règle du vermillon compté.** Le vermillon ne sert qu'à dater et à alerter. Un élément vermillon doit répondre à « quand ? » ou « que dois-je faire ? ».

**La règle des couleurs Notion.** Piliers et réglementations gardent les teintes de Notion (bleu, violet, orange, rose, ambre, émeraude, sarcelle, cyan) en étiquettes pâles : ce sont des données, pas l'identité.

## Typography

**Display Font:** Barlow Condensed 600 et 700 (repli Arial Narrow), auto-hébergée via `@fontsource/barlow-condensed` et `next/font/local`.
**Body Font:** police système (ui-sans-serif, system-ui, Segoe UI, Roboto).
**Label/Mono Font:** monospace système, uniquement pour les contrôles et les codes REG, PDT, GES, C1 à C3.

**Character:** la condensée grasse donne aux chiffres la voix d'un calendrier imprimé ; la police système garde la lecture neutre et rapide.

### Hierarchy
- **Quantième** (700, 5,5 rem) : le grand chiffre du feuillet du jour, tableau de bord seulement.
- **Chiffre** (700, 2 rem) : quantièmes des feuillets moyens, files « À traiter », années de la frise (1,5 rem).
- **Headline** (700, 1,75 rem, interlettrage -0,02 em) : titre de page ; 2 rem sur le détail d'article.
- **Headline lecture** (700, 2,25 rem, interlettrage -0,025 em) : titres des pages publiques (blog, article, À propos, mentions légales).
- **Body lecture** (400, 1,0625 rem, interligne 1,625) : corps des articles et de la page À propos.
- **Title** (600, 1 rem) : titres de panneaux, intitulés d'échéances, titres d'articles.
- **Body** (400, 0,875 à 1 rem, interligne 1,625) : résumés, impacts, notes, limité à 70-72 caractères par ligne.
- **Label** (600, 0,75 rem) : libellés de filtres, métadonnées, étiquettes. Pas de capitales espacées.

### Named Rules
**La règle des chiffres condensés.** Barlow Condensed ne porte que des chiffres, des mois et le mot « Radar » : jamais une phrase.

## Layout

Conteneur de 72 rem (max-w-6xl) avec 16 px de gouttière. Le tableau de bord ouvre sur une grille [feuillet du jour | titre et file « À traiter »], puis [retenus de la semaine | prochaines échéances (22 rem)], puis trois panneaux. Le fil de veille et les règles placent leurs filtres dans un panneau à gauche (14 rem, collant), les résultats en liste à filets dans un seul panneau. La frise est une colonne centrée sur ordinateur (cartes alternées), un axe à gauche sur mobile ; une carte dépliée prend toute la largeur.

Le blog public reprend le même bandeau, réduit à « Blog » et « À propos », sur une colonne de lecture de 48 rem (max-w-3xl), texte courant à 17 px. Son accueil est un almanach : un intertitre par mois en condensée capitale bleu de Prusse suivi d'un filet, puis les articles portés par leur feuillet moyen bleu de Prusse.

Rythme : 8 px dans les groupes, 24 à 32 px entre sections, 32 px sous l'en-tête de page. Sur mobile, le bandeau garde le nom et les actions sur une ligne et fait défiler les quatre liens sur une seconde ligne.

## Elevation & Depth

Système plat à bordures : la profondeur vient du contraste papier / feuille et des filets. Trois ombres seulement, toutes douces et décalées vers le bas.

### Shadow Vocabulary
- **Épaisseur du feuillet** (`0 1px 3px -1px rgb(20 32 58 / 0.25)`) : sous chaque feuillet.
- **Carte dépliée** (`0 8px 24px -12px rgb(20 32 58 / 0.35)`) : échéance ouverte dans la frise.
- **Année collante** (`0 2px 6px -2px rgb(20 32 58 / 0.4)`) : repère d'année de la frise.

### Named Rules
**La règle de la bordure seule.** Un panneau a une bordure ou une ombre, jamais les deux au repos.

## Shapes

Angles francs et modestes : 4 px pour les étiquettes, 5 px pour les feuillets, 6 px pour les champs et boutons, 8 px pour les rangées d'impacts, 12 px pour les panneaux. Pastilles entièrement arrondies réservées aux filtres de la frise et aux statuts. Les repères de l'axe de la frise sont des losanges (carré tourné de 45°) à la couleur de la réglementation.

## Components

### Buttons
- **Shape:** angles de 6 px.
- **Primary:** bleu de Prusse, texte blanc, 600, 8 × 14 px ; fond plus foncé au survol.
- **Hover / Focus:** transition de couleur ; anneau de focus vermillon de 2 px décalé de 2 px.
- **Secondary:** feuille, bordure filet-2, survol en bordure encre-3. Liens d'action « Tout voir », « La frise » : texte bleu de Prusse avec flèche dessinée.

### Chips
- **Style:** filtres de la frise en pastilles, feuille et bordure filet-2 au repos.
- **State:** actives, elles prennent la teinte de la réglementation ou du pilier et un anneau bleu de Prusse.

### Cards / Containers
- **Corner Style:** 12 px.
- **Background:** feuille sur papier froid.
- **Shadow Strategy:** aucune au repos (voir Elevation).
- **Border:** filet de 1 px ; en-tête de panneau séparé par un filet.
- **Internal Padding:** 16 px horizontal, 12 px vertical.

### Inputs / Fields
- **Style:** classe `.champ` : feuille, bordure filet-2, 6 px, texte 0,875 rem ; cases à cocher teintées bleu de Prusse.
- **Focus:** bordure et contour bleu de Prusse (vermillon en mode sombre).
- **Error / Disabled:** bordure vermillon et message vermillon sous le champ.

### Navigation
- **Style:** bandeau bleu de Prusse ; « RADAR » en condensée capitale suivi de « Data Assurance ». Liens blancs à 80 %, survol en voile blanc, lien actif sur voile blanc 12 % souligné d'une barre vermillon de 3 px. Sur mobile, liens sur une ligne qui défile.

### Feuillet (composant signature)
Date posée comme une page d'éphéméride : bandeau du mois en condensée capitale, grand quantième, année en petit (taille moyenne). Trois tailles : petit (44 px, listes), moyen (56 px, frise et connexion), grand (144 px, feuillet du jour avec jour de la semaine). Trois tons : vermillon pour une échéance à venir ou aujourd'hui, filet pour une échéance passée (opacité 75 %), bleu de Prusse pour la date d'un article de veille. Lu par les lecteurs d'écran comme une date complète. Seul mouvement du site : le marqueur « Aujourd'hui » de la frise se pose en basculant (700 ms, ease-out exponentiel), désactivé si l'utilisateur réduit les animations.

## Do's and Don'ts

### Do:
- **Do** dater chaque échéance avec un feuillet, partout où elle apparaît.
- **Do** utiliser les jetons (papier, feuille, encre, filet, prusse, vermillon, alerte) plutôt que des couleurs Tailwind brutes.
- **Do** dessiner les icônes en SVG au trait de 1,75 px (`components/Icones.tsx`).
- **Do** garder les chiffres en `font-chiffres` et les nombres en chiffres tabulaires.

### Don't:
- **Don't** utiliser le vermillon pour décorer : il signifie date ou urgence.
- **Don't** ajouter de surtitres en capitales espacées au-dessus des titres.
- **Don't** remplacer une icône par un caractère Unicode (★, ↗, ▶).
- **Don't** ajouter d'animations d'entrée aux cartes ou aux sections ; le seul mouvement est le feuillet du jour.
