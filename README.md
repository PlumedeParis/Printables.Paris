# Printables — site vitrine d'un atelier d'impression 3D

Site statique (HTML / CSS / JavaScript, sans dépendance ni build) pour un atelier
d'impression 3D : catalogue de modèles, grille tarifaire au poids, estimateur de
prix et devis en ligne.

## Lancer le site

Ouvrez `index.html` dans un navigateur, ou servez le dossier :

```bash
python3 -m http.server 8000   # puis http://localhost:8000
```

Le site est publiable tel quel sur GitHub Pages (branche + dossier racine).

## Grille tarifaire

| Poids imprimé | Prix    |
| ------------- | ------- |
| 20 g          | 3,00 €  |
| 50 g          | 6,00 €  |
| 100 g         | 12,00 € |
| 150 g         | 20,00 € |
| 200 g         | 27,00 € |
| plus de 200 g | sur devis |

Règles appliquées par `priceFor()` dans `assets/js/app.js` :

- en dessous de 20 g, le tarif minimum de 3,00 € s'applique ;
- entre deux paliers, le prix est interpolé linéairement puis arrondi aux
  50 centimes (75 g → 9,00 €, 45 g → 5,50 €) ;
- au-delà de 200 g, aucun prix automatique : la pièce passe en devis ;
- à partir de 5 exemplaires identiques, remise de 10 % sur la ligne.

Pour changer les tarifs, il suffit de modifier la constante `TIERS` : le
catalogue, l'échelle de prix, l'estimateur et le devis se recalculent tous
à partir d'elle.

## Contenu

- `index.html` — structure des sections (héros, catalogue, tarifs, estimateur,
  déroulé, matières, FAQ, contact, devis).
- `assets/css/styles.css` — thème clair et sombre par variables CSS, mise en page
  responsive, animations.
- `assets/js/app.js` — catalogue (`MODELS`), calcul des prix, filtres, estimateur,
  panier de devis persistant (`localStorage`), thème, menu mobile.

## Ajouter un modèle au catalogue

Ajoutez une entrée dans le tableau `MODELS` de `assets/js/app.js` :

```js
{ id: 'lampe', name: 'Lampe hexagonale', cat: 'deco', g: 180, glyph: '💡',
  desc: 'Abat-jour en PLA translucide, douille E14 à insérer.' }
```

`cat` accepte `deco`, `bureau`, `gaming`, `figurine` ou `utile` (les filtres du
catalogue). Le prix affiché est déduit du poids `g`, il n'est jamais saisi à la main.

## Détails d'implémentation

- Accessibilité : navigation au clavier, focus visible, `aria-*` sur le menu, le
  tiroir de devis et les curseurs, respect de `prefers-reduced-motion`.
- Thème : suit le réglage système par défaut, bouton de bascule mémorisé.
- Le formulaire de contact et l'envoi de devis ouvrent le client mail de
  l'utilisateur (`mailto:`) — à remplacer par un vrai back-end le jour venu.
