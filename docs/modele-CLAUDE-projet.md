# Modèle de CLAUDE.md pour un nouveau projet

Copier le bloc ci-dessous dans un fichier `CLAUDE.md` à la racine du nouveau dépôt, puis compléter la partie « Projet ».

---

```markdown
# <Nom du projet>

## Projet
<Deux ou trois phrases : à quoi sert le projet, pour qui, et où se trouve la spécification.>

## Utilisateur
- Consultant data gouvernance, non-développeur. Il ne lit pas le code : expliquer ce qui change côté usage, et guider pas à pas toute action de sa part (comptes, variables d'environnement, clics).
- Échanges en français.
- Style attendu : direct, pas de préambule ni de conclusion récapitulative, pas de flatterie, paragraphes courts, prose plutôt que listes, pas de tirets longs, pas de ton corporate. Commencer par une recommandation quand il y a des options. Dire clairement quand on n'est pas sûr.

## Secrets
Tous les secrets vont en variables d'environnement, jamais dans le code ni dans un fichier commité. Fournir un `.env.example` sans valeurs. Ne jamais demander de coller un secret dans la conversation.

## Ingénierie
Objectif : un code que l'on peut faire évoluer longtemps sans peur de casser l'existant.
- Une livraison = un sujet. Pas de refonte opportuniste glissée dans une fonctionnalité.
- Tester avant de livrer. Toute logique nouvelle ou corrigée arrive avec un test automatisé ; pour un bug, écrire d'abord le test qui le reproduit.
- Mettre en place dès le début un contrôle automatique sur chaque PR (style, typage, compilation, tests) et ne jamais demander de fusionner une PR en rouge.
- Relire son propre diff avant l'envoi : code mort, branchements de test oubliés, secrets.
- Consigner les décisions d'architecture qui ne vont pas de soi en ADR dans `docs/adr/`, et le vocabulaire métier dans `GLOSSARY.md`.

## Pédagogie
L'utilisateur veut apprendre les bonnes pratiques d'ingénierie logicielle au fil du projet.
- À chaque livraison de code, terminer par un encart **Bonne pratique** : nommer la pratique appliquée, dire en deux ou trois phrases pourquoi elle compte ici, avec l'exemple concret du changement. Une seule pratique par livraison.
- Employer le terme technique exact et le définir en une phrase la première fois.
```

---

Skills utiles à réinstaller dans chaque nouveau projet (dépôt `mattpocock/skills`, une commande par skill) :

```
npx skills@latest add mattpocock/skills --skill=tdd
npx skills@latest add mattpocock/skills --skill=diagnosing-bugs
npx skills@latest add mattpocock/skills --skill=improve-codebase-architecture
npx skills@latest add mattpocock/skills --skill=codebase-design
npx skills@latest add mattpocock/skills --skill=domain-modeling
npx skills@latest add mattpocock/skills --skill=grilling
npx skills@latest add mattpocock/skills --skill=writing-for-agents
npx skills@latest add mattpocock/skills --skill=teach
npx skills@latest add mattpocock/skills --skill=handoff
```

Ne pas ajouter l'option `-y` : elle installe tous les skills du dépôt.
