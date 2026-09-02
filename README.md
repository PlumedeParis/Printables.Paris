# Printables — site vitrine d'impression 3D à la demande

Site statique (HTML / CSS / JavaScript, sans dépendance ni build) : catalogue de
modèles, grille tarifaire au poids, estimateur de prix, devis en ligne et
commande par WhatsApp.

## Lancer le site

Ouvrez `index.html` dans un navigateur, ou servez le dossier :

```bash
python3 -m http.server 8000   # puis http://localhost:8000
```

Le site est publiable tel quel sur GitHub Pages (branche + dossier racine).

## ⚠️ À configurer : le numéro WhatsApp

Première ligne de `assets/js/app.js` :

```js
var WHATSAPP = '';   // ex. '33612345678' pour +33 6 12 34 56 78
```

Format international, sans `+`, sans espaces ni tirets. Tous les boutons du site
(héros, devis, formulaire de contact) ouvrent alors WhatsApp avec un message
déjà rédigé, adressé à ce numéro. Tant que la valeur est vide, WhatsApp s'ouvre
quand même mais le visiteur doit choisir lui-même le destinataire.

Aucun serveur, aucune base de données, aucune adresse email : le message est
construit dans le navigateur et le visiteur appuie lui-même sur « envoyer ».

## Grille tarifaire

| Poids imprimé | Prix    |
| ------------- | ------- |
| 20 g          | 3,00 €  |
| 50 g          | 6,00 €  |
| 100 g         | 12,00 € |
| 150 g         | 20,00 € |
| 200 g         | 27,00 € |
| plus de 200 g | à définir |

Règles appliquées par `priceFor()` dans `assets/js/app.js` :

- en dessous de 20 g, le tarif minimum de 3,00 € s'applique ;
- entre deux paliers, le prix est interpolé linéairement puis arrondi aux
  50 centimes (75 g → 9,00 €, 45 g → 5,50 €) ;
- au-delà de 200 g, aucun prix automatique : la pièce passe en devis ;
- plusieurs exemplaires = prix unitaire × quantité, sans remise automatique.

Pour changer les tarifs, modifiez la constante `TIERS` : le catalogue, la carte
du héros, l'échelle de prix, l'estimateur et le devis se recalculent tous à
partir d'elle.

## Catalogue

Le tableau `MODELS` de `assets/js/app.js` liste des modèles réellement diffusés
par la communauté (3DBenchy, Flexi Rex, lapin de Stanford, cube d'engrenages…).
Les poids sont ceux d'une impression PLA à la taille habituelle, remplissage
15 % — ils sont affichés avec un « ≈ » et servent d'estimation, le prix ferme
étant confirmé après passage au trancheur.

Ajouter un modèle :

```js
{ id: 'rex', name: 'Flexi Rex', cat: 'articule', g: 45, glyph: '🦖',
  desc: 'T-Rex articulé imprimé d\'un seul tenant.' }
```

`cat` accepte `classique`, `articule`, `mecanisme`, `deco` ou `utile` — ce sont
les filtres du catalogue. Le prix affiché découle du poids `g`, il n'est jamais
saisi à la main.

## Contenu des fichiers

- `index.html` — sections : héros, catalogue, tarifs, estimateur, déroulé,
  matière, FAQ, contact, tiroir de devis.
- `assets/css/styles.css` — thèmes clair et sombre par variables CSS, mise en
  page responsive, animations.
- `assets/js/app.js` — numéro WhatsApp, barème, catalogue, filtres, estimateur,
  devis persistant (`localStorage`), thème, menu mobile.

## Détails d'implémentation

- Une seule matière annoncée : le PLA.
- Aucun délai, aucune adresse, aucun horaire, aucune adresse email : ces
  informations sont laissées à la discussion WhatsApp.
- Accessibilité : navigation au clavier, focus visible, `aria-*` sur le menu, le
  tiroir de devis et les curseurs, respect de `prefers-reduced-motion`.
- Thème : suit le réglage système par défaut, bouton de bascule mémorisé.
