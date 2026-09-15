# Portfolio Adrian Margolin — guide de maintenance

## Structure

```
index.html      Accueil
series.html     Séries — grille + visionneuse
apropos.html    Sur moi — cheminement, lectures, portrait
contact.html    Contact

assets/css/      un fichier par page + style.css commun (tokens de couleur/typo)
assets/js/
  main.js          petits utilitaires partagés (année du footer, bouton "haut de page")
  galerie.js        moteur des séries (voir plus bas)
  transition.js     fondu simple entre les pages
  sprite-chase.js   le petit personnage pixelisé qui suit le curseur (Accueil, Contact)
  i18n.js           bascule FR / EN

embeds/          les séries exportées en HTML autonome depuis l'appli (voir plus bas)
outils/
  editeur-series.html   l'appli qui sert à préparer les séries (usage personnel,
                         non reliée au menu du site — voir plus bas)

photos/
  portfolio/    035-1.jpg, la photo de fond de l'accueil
  teaser/       quelques images pour la mosaïque "Série" de l'accueil
  adrian-portrait*.jpg  photos utilisées sur "Sur moi", "Contact" et l'accueil
```

Pas de dépendance à installer : fichiers HTML/CSS/JS ouverts directement dans
un navigateur, ou déposés tels quels sur un hébergement statique (GitHub
Pages, Netlify...).

## Le moteur des séries (assets/js/galerie.js)

Le tableau `CARNETS` en haut du fichier liste toutes les séries affichées sur
`series.html`. Trois types possibles :

### `type: 'embed'` — le plus simple, recommandé

Une page HTML complète (images incluses), exportée directement depuis
l'appli `outils/editeur-series.html`, affichée telle quelle dans un cadre.
C'est le format utilisé aujourd'hui pour "Portraits" et "Vers l'abstraction" :
mise en page, titres de section et tailles d'image sont déjà correctes à
l'export, il n'y a rien à ajuster derrière.

Pour ajouter une série de ce type :
1. Dans `outils/editeur-series.html`, prépare la série puis exporte-la en
   HTML complet.
2. Dépose le fichier exporté dans `embeds/<nom>.html`.
3. Ajoute une entrée dans `CARNETS` :
   ```js
   {
     id: 'nouvelle-serie',
     type: 'embed',
     title: 'Titre affiché',
     titleEn: 'English title',
     description: 'Une phrase courte.',
     descriptionEn: 'A short sentence.',
     src: 'embeds/nouvelle-serie.html',
     cover: 'embeds/../photos/teaser/une-image.jpg'  // une image pour la vignette
   }
   ```

### `type: 'book'` et `type: 'flat'`

Deux formats plus anciens, gardés pour compatibilité :
- `book` : mise en page en doubles pages pilotée par un `ordre.json`
  (rangées de 1 à 4 photos, éventuels titres de section). Le JSON se colle
  dans un `<script type="application/json" id="data-xxx">` avant `</body>`
  de `series.html`, référencé via `dataElementId: 'data-xxx'`.
- `flat` : simple grille murale, images numérotées `01.jpg`, `02.jpg`...
  dans `photos/<dossier>/` (+ `miniatures/`), référencées via
  `base` et `count`.

En pratique, le type `embed` évite d'avoir à recopier des données dans le
site : l'export de l'appli suffit tel quel.

## L'appli de préparation des séries (outils/editeur-series.html)

C'est l'outil qui sert à composer une série (glisser les photos, régler la
mise en page, ajouter des titres de section) puis à l'exporter. Il est
volontairement **séparé du site public** : aucun lien vers lui n'apparaît
dans le menu, pour que les visiteurs ne tombent jamais dessus par hasard.

Pour l'utiliser : ouvre simplement `outils/editeur-series.html` dans un
navigateur, comme n'importe quel fichier du dossier. Une fois la série
exportée en HTML, suis les 3 étapes ci-dessus pour l'intégrer.

## Couleurs et typographies

Tous les réglages sont centralisés en haut de `assets/css/style.css` (bloc
`:root`). Modifier une valeur là suffit à la répercuter sur tout le site.
