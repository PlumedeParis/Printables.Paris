# Printables — site vitrine d'impression 3D à la demande

Site statique (HTML / CSS / JavaScript, sans dépendance ni build) : idées
d'objets à imprimer, grille tarifaire au poids, estimateur de prix, panier en
ligne et demande préparée pour WhatsApp.

Impression en PLA uniquement, sur **Bambu Lab A1 Combo** (volume
256 × 256 × 256 mm, jusqu'à 4 couleurs avec l'AMS lite).

## Lancer le site

Ouvrez `index.html` dans un navigateur, ou servez le dossier :

```bash
python3 -m http.server 8000   # puis http://localhost:8000
```

Publiable tel quel sur GitHub Pages (branche + dossier racine).

## Comment part une demande

Aucun serveur, aucune base de données, aucune adresse email, aucun numéro de
téléphone publié. Les boutons « Copier ma demande » et « Copier mon message »
composent le texte (message libre + détail du panier en cours) et le placent
dans le presse-papiers du visiteur, qui le colle dans WhatsApp.

Si le navigateur refuse la copie automatique (`navigator.clipboard` puis
`document.execCommand` en secours), le texte s'affiche dans une zone
sélectionnable — le visiteur n'est jamais bloqué.

Un lien `wa.me` avait été essayé au départ : il est refusé par la politique de
sécurité (CSP) de certains hébergeurs de prévisualisation, d'où la copie.

## Grille tarifaire

| Poids imprimé | Prix    |
| ------------- | ------- |
| 20 g          | 3,00 €  |
| 50 g          | 6,00 €  |
| 100 g         | 12,00 € |
| 150 g         | 20,00 € |
| 200 g         | 27,00 € |
| plus de 200 g | estimation au même taux, à confirmer |

Règles appliquées par `priceFor()` dans `assets/js/app.js` :

- en dessous de 20 g, le tarif minimum de 3,00 € s'applique ;
- entre deux paliers, prix interpolé puis arrondi aux 50 centimes
  (75 g → 9,00 €, 45 g → 5,50 €) ;
- au-delà de 200 g, le prix continue au même taux que le dernier palier
  (150 g → 200 g, soit 0,14 €/g) — c'est une estimation, affichée avec la
  mention « estimation » ; le prix ferme d'une grosse pièce se confirme
  avant impression ;
- seules les idées ajoutées au panier sans poids connu restent « à définir ».

Modifier la constante `TIERS` suffit : carte du héros, échelle de prix,
estimateur et panier se recalculent à partir d'elle.

## Remise sur le montant

La technique la plus simple et la plus lisible : un palier de remise dès
que le panier atteint un certain montant. Pas de comptage de pièces —
seulement le total, dans `BULK_TIERS` (`assets/js/app.js`) :

| Montant | Remise |
| ------- | ------ |
| 20 €    | −10 %  |
| 40 €    | −20 %  |
| 60 €    | −30 %  |
| 100 €   | −40 %  |
| 150 €   | −50 %  |

`bulkDiscount(amount)` renvoie le meilleur palier atteint ;
`nextBulkTier(amount)` renvoie le prochain palier non atteint (ou `null` au
maximum). Elles s'appliquent :

- au panier : `cartTotals()` additionne le prix brut de chaque ligne
  (`raw`), calcule la remise sur ce montant, et renvoie le prix remisé
  (`sum`) ; le tiroir affiche le détail (sous-total, remise, total) dès
  qu'une remise s'applique, avec un rappel du prochain palier tant qu'on
  n'est pas au maximum, et le message copié pour WhatsApp reprend le même
  détail ;
- à l'estimateur, comme aperçu : la remise est calculée sur le montant de
  la pièce en cours de réglage, avec un badge « Remise incluse » (remise
  active) ou « Encore X € pour −Y % » (prochain palier) — avant même
  l'ajout au panier ; une fois ajoutée, le panier recalcule sur le montant
  réel de la commande, qui peut différer si d'autres pièces s'y trouvent
  déjà ;
- au clic sur une idée ou l'ajout d'une pièce sur mesure : `discountToast()`
  affiche immédiatement, dans le message flottant, la remise déjà active ou
  ce qu'il manque pour la débloquer — la promotion se voit dès qu'on choisit
  un produit, pas seulement une fois le panier ouvert.

Modifier `BULK_TIERS` (paliers ou taux) suffit à ajuster la remise partout.

## Idées d'impression

La section « Idées » n'est pas un catalogue produit : pas de prix, pas de
lien, pas d'image par idée — juste des noms d'objets groupés par thème, pour
inspirer le visiteur. Le tableau `IDEAS` de `assets/js/app.js` :

```js
{ cat: 'Maison', items: [
  'Clips à sachet', 'Presse-tube à dentifrice', 'Crochets muraux', …
]}
```

Pour ajouter une idée, ajoutez une chaîne dans le tableau `items` du bon
groupe (ou créez un nouveau groupe `{ cat: '…', items: [...] }`). Cliquer sur
une idée l'ajoute au panier sans poids ni prix (affiché « à définir ») ; le
prix réel vient toujours de l'estimateur ou d'un échange direct.

## Couleurs

Les bobines annoncées sur le site (section « Le PLA ») : noir, blanc, gris,
vert, orange, bleu clair, jaune, bleu transparent, rouge, titane. Elles sont
listées en HTML dans `index.html`, bloc `.swatches`.

## Contenu des fichiers

- `index.html` — sections : héros, idées, tarifs, estimateur, déroulé,
  matière, FAQ, contact, tiroir panier.
- `assets/css/styles.css` — thèmes clair et sombre par variables CSS, mise en
  page responsive, animations.
- `assets/js/app.js` — barème, idées, estimateur, panier persistant
  (`localStorage`), copie du message, thème, menu mobile.

## Détails d'implémentation

- Aucun délai, aucune adresse, aucun horaire, aucun email : ces informations
  restent pour la discussion WhatsApp.
- Accessibilité : navigation au clavier, focus visible, `aria-*` sur le menu, le
  tiroir panier et les curseurs, respect de `prefers-reduced-motion`.
- Thème : suit le réglage système par défaut, bouton de bascule mémorisé.
