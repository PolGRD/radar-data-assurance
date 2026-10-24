---
version: 1
slug: "app-site-page-tsx"
primary_target: "app/(site)/page.tsx"
related_targets: ["app/connexion/page.tsx","app/(site)/layout.tsx"]
---

# Site privé Radar Data Assurance (toutes les pages)

Scope : refonte de l'identité visuelle du site privé (tableau de bord, veille, détail, calendrier, règles, connexion). Mode : Operate (et Read pour le détail d'article). Build code-led.

Audience et tâche : Paul, au bureau sur ordinateur, se tient à jour en quelques minutes par jour : ce qui a changé, ce qui arrive, ce qui demande une action (à trier, à relire, échéances proches). Contenu réel lu dans Notion, rien d'inventé.

Candidats (ordre de résonance) : 1 texte consolidé Légifrance, 2 Code des assurances relié rouge, 3 plan de métro des réglementations, 4 tableau de garanties prévoyance, 5 rapport institutionnel ACPR, 6 classeur à intercalaires, 7 éphéméride de bureau. Roll dégradé (service injoignable), sans challengers.

## Direction contract

THESIS: un site de veille qui se lit comme on arrache la feuille du jour. Il refuse le tableau de bord SaaS à tuiles de chiffres et la pseudo-une de journal.

OWN-WORLD: éphéméride de bureau. Fond papier froid bleuté, encre bleu nuit, bandeau de navigation bleu de Prusse plein, rouge vermillon réservé aux dates et à l'urgence. Chiffres en grotesque condensée grasse (Barlow Condensed auto-hébergée), texte en police système. Couleurs de réglementations et de piliers comme séries de données.

STORY: il voit la date du jour et ce qui est tombé depuis hier, ce qui arrive, ce qui l'attend dans Notion, puis descend veille → échéance → impact → règle.

FIRST VIEWPORT: bandeau bleu (nom, navigation, Rafraîchir). En tête du tableau de bord, à gauche le feuillet du jour (jour de la semaine, grand quantième, mois) ; à droite trois files « À traiter » chiffrées. Dessous, la colonne des prochaines échéances, chacune portée par son feuillet daté, à côté des retenus de la semaine.

FORM: éphéméride, candidat 7 sur 7, seed:8beace7ff61a8da6. Signature : chaque date d'échéance est un feuillet (bande rouge du mois, quantième condensé), sur la frise, le tableau de bord et les cartes. Mouvement : le feuillet d'aujourd'hui sur la frise se pose avec un léger basculement, en ease-out exponentiel, et rien d'autre ne bouge.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
