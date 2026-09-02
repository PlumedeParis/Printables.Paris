# Printables — site vitrine d'impression 3D à la demande

Site statique (HTML / CSS / JavaScript, sans dépendance ni build) : catalogue de
modèles gratuits MakerWorld, grille tarifaire au poids, estimateur de prix,
devis en ligne et demande préparée pour WhatsApp.

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
composent le texte (message libre + détail du devis avec les liens MakerWorld)
et le placent dans le presse-papiers du visiteur, qui le colle dans WhatsApp.

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
| plus de 200 g | à définir |

Règles appliquées par `priceFor()` dans `assets/js/app.js` :

- en dessous de 20 g, le tarif minimum de 3,00 € s'applique ;
- entre deux paliers, prix interpolé puis arrondi aux 50 centimes
  (75 g → 9,00 €, 45 g → 5,50 €) ;
- au-delà de 200 g, aucun prix automatique : la pièce passe en devis ;
- plusieurs exemplaires = prix unitaire × quantité, sans remise automatique.

Modifier la constante `TIERS` suffit : catalogue, carte du héros, échelle de
prix, estimateur et devis se recalculent à partir d'elle.

## Catalogue

Le tableau `MODELS` de `assets/js/app.js` ne contient que des modèles
**gratuits sur MakerWorld**, chacun avec le lien vers la page de son auteur
(affiché sur la fiche : « Voir le modèle sur MakerWorld »).

```js
{ id: 'door', name: 'Cale-porte', cat: 'maison', g: 30, glyph: '🚪',
  url: 'https://makerworld.com/en/models/1596339-door-stopper-door-holder-door-stop',
  desc: 'Fin, solide, imprimé d\'une pièce.' }
```

`cat` accepte `maison`, `bureau`, `articule` ou `deco` — ce sont les filtres du
catalogue. Le prix affiché découle du poids `g`, jamais saisi à la main.

⚠️ Les poids sont des **estimations** (taille d'origine, PLA, remplissage 15 %),
affichées avec un « ≈ ». Remplacez-les par les valeurs de votre trancheur au fur
et à mesure que vous imprimez ces modèles : le prix affiché suivra tout seul.

## Couleurs

Les bobines annoncées sur le site (section « Le PLA ») : noir, blanc, gris,
vert, orange, bleu, bleu clair, jaune, transparent, rouge métallisé. Elles sont
listées en HTML dans `index.html`, bloc `.swatches`.

## Contenu des fichiers

- `index.html` — sections : héros, catalogue, tarifs, estimateur, déroulé,
  matière, FAQ, contact, tiroir de devis.
- `assets/css/styles.css` — thèmes clair et sombre par variables CSS, mise en
  page responsive, animations.
- `assets/js/app.js` — barème, catalogue, filtres, estimateur, devis persistant
  (`localStorage`), copie du message, thème, menu mobile.

## Détails d'implémentation

- Aucun délai, aucune adresse, aucun horaire, aucun email : ces informations
  restent pour la discussion WhatsApp.
- Accessibilité : navigation au clavier, focus visible, `aria-*` sur le menu, le
  tiroir de devis et les curseurs, respect de `prefers-reduced-motion`.
- Thème : suit le réglage système par défaut, bouton de bascule mémorisé.
