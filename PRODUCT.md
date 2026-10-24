# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Un seul utilisateur aujourd'hui : Paul Girardeau, consultant senior en gouvernance des données, non-développeur, qui suit l'intersection data gouvernance × IA × assurance de personnes (prévoyance et santé, collectives et individuelles). Il consulte le site surtout sur ordinateur, au bureau, entre deux missions. Son usage principal est de se tenir à jour : parcourir la veille retenue, voir ce qui arrive dans le calendrier réglementaire, repérer ce qui reste à traiter. Le téléphone sert de consultation d'appoint.

Public futur (phase 2, lot 5) : un blog public sous le même nom, lu par des pairs (data, conformité, assurance de personnes). La refonte du site privé pose dès maintenant l'identité qui servira à ce blog.

## Product Purpose

Radar Data Assurance transforme une veille brute (flux RSS collectés chaque jour) en connaissance exploitable : les articles retenus dans Notion, les échéances réglementaires sur une frise, leurs impacts concrets chez un assureur français (data, IT, métier) et le référentiel de règles de gestion qui permet de les contrôler. Le succès : en quelques minutes par jour, savoir ce qui a changé, ce qui arrive et ce que cela implique pour les données d'un assureur de personnes.

## Positioning

Une veille qui ne s'arrête pas à l'article : chaque sujet peut descendre jusqu'à l'impact chez l'assureur puis jusqu'à la règle de gestion contrôlable (échéance → impact → règle). Construite et qualifiée par un praticien de la gouvernance des données, sans IA générative dans la chaîne (phase 1), avec Notion comme seul back-office.

## Operating Context

- Notion est le seul back-office : statuts (À trier, Retenu, Lu, Écarté), pertinence 1 à 5, favoris, résumés, piliers, analyses d'impact. Le site ne fait que lire.
- Collecte RSS quotidienne et digest e-mail du lundi (GitHub Actions) ; le digest renvoie vers les pages du site.
- Rituel : tri dans Notion, lecture sur le site, analyse d'impact faite à la demande en session avec l'assistant.
- Site protégé par un mot de passe unique ; rafraîchissement des données toutes les heures ou à la demande.

## Capabilities and Constraints

- Pages : tableau de bord, fil de veille (filtres, recherche, détail d'article avec impacts), calendrier réglementaire en frise verticale avec drill down échéance → impacts → règles, référentiel de règles de gestion (filtres par branche, domaine, nature, criticité, statut), connexion.
- Lots à venir : fiches de synthèse et parcours d'apprentissage (lot 3), blog public (lot 5).
- Vocabulaire métier exact : piliers (Data gouvernance, IA, Assurance de personnes), branches (Prévoyance et Santé, individuelles et collectives), réglementations (AI Act, DORA, RGPD, Solvabilité II, DSP3, RSP1…), nature des règles (REG, PDT, GES), criticité (C1 à C3), types d'impact (Data, IT, Métier), statuts de relecture (À relire, Validé).
- Contraintes : 0 € (Vercel Hobby, Notion gratuit limité à 1 000 blocs, GitHub, Resend gratuit), Next.js + TypeScript + Tailwind, aucune API d'IA en phase 1, interface en français, mode sombre et lecture mobile exigés.
- Usage personnel, non commercial : aucune mention freelance, offre de services, publicité ou affiliation. Aucune donnée d'employeur ni de client.

## Brand Commitments

- Nom : « Radar Data Assurance ». Pas de logo existant.
- Voix : directe, précise, sans ton corporate ni emphase ; termes techniques exacts.

## Evidence on Hand

- Contenu réel dans Notion : environ 30 articles retenus ou lus, une vingtaine d'échéances (AI Act, DORA, Solvabilité II, DSP3, RSP1, IJSS AT/MP, PSC), 23 impacts assureur, 194 règles de gestion (prévoyance individuelle et collective), parcours d'apprentissage amorcé.
- Aucun témoignage, client, chiffre d'audience ni publication à citer : ne rien inventer.

## Product Principles

1. Le contenu d'abord : l'interface sert la lecture et le repérage, jamais l'inverse.
2. Toujours pouvoir descendre d'un niveau : de l'actualité à l'échéance, de l'échéance à l'impact, de l'impact à la règle.
3. Montrer ce qui demande une action : à trier, à relire, à analyser, échéances proches.
4. Exactitude du vocabulaire métier et des dates ; signaler ce qui est estimé ou à vérifier.
5. Sobriété de moyens : rien qui coûte, rien qui dépende d'un service payant.

## Accessibility & Inclusion

Mode clair et mode sombre, navigation au clavier, contrastes suffisants, lecture confortable sur mobile (exigences de la spécification v1.0).
