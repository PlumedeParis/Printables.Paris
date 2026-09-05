# Printables — site vitrine d'impression 3D à la demande

Site statique (HTML / CSS / JavaScript, sans dépendance ni build) : idées
d'objets à imprimer, grille tarifaire au poids, estimateur de prix, panier en
ligne et demande préparée pour email ou WhatsApp.

Impression en PLA uniquement, sur **Bambu Lab A1 Combo** (volume
256 × 256 × 256 mm, jusqu'à 4 couleurs avec l'AMS lite).

Palette bleu cobalt (`--accent`) et rouille (`--secondary`), sur un fond
gris-bleu froid — tous les jetons de couleur sont définis en variables CSS en
tête de `assets/css/styles.css`, déclinées pour le thème clair et le thème
sombre ; changer une couleur là suffit à la répercuter partout sur le site.

## Lancer le site

Ouvrez `index.html` dans un navigateur, ou servez le dossier :

```bash
python3 -m http.server 8000   # puis http://localhost:8000
```

Publiable tel quel sur GitHub Pages (branche + dossier racine).

## Comment part une demande

Aucun serveur, aucune base de données. Le panier se remplit en cliquant une
idée ou en décrivant une pièce personnalisée (voir plus bas) ; le tiroir du
panier propose ensuite deux boutons, tous deux déclenchés par le visiteur —
rien ne part sans lui. L'email est mis en avant (bouton plein, en premier) ;
WhatsApp reste disponible juste en dessous (bouton en contour) :

- **Envoyer par email** — ouvre une petite fenêtre (`#mailModal` dans
  `index.html`) demandant le nom et l'email du visiteur ; une fois validés
  (les deux champs sont requis, l'email doit avoir une forme correcte), un
  appel `fetch()` poste la demande à [Web3Forms](https://web3forms.com), un
  service gratuit qui relaie vers `CONTACT_EMAIL`, sans backend à héberger —
  le client mail du visiteur ne s'ouvre jamais. Le nom et l'email sont
  transmis comme champs `name`/`email` : Web3Forms les affiche dans le mail
  reçu et utilise l'email comme adresse de réponse directe. Ils sont aussi
  mémorisés dans `localStorage` (`printables.contact.v1`) pour préremplir la
  fenêtre à la prochaine visite. C'est aussi ce bouton (icône enveloppe)
  qu'on retrouve en CTA principal du héros. Configuration en une fois :
  créez une clé sur web3forms.com (il suffit de confirmer l'adresse qui doit
  recevoir les demandes), puis collez cette clé dans `WEB3FORMS_KEY` en tête
  de `assets/js/app.js`. Tant que `WEB3FORMS_KEY` est vide, la fenêtre
  prévient que l'envoi n'est pas encore activé plutôt que d'échouer
  silencieusement ;
- **Copier pour WhatsApp** — compose le détail complet et le place dans le
  presse-papiers du visiteur, qui le colle dans WhatsApp. Si le navigateur
  refuse la copie automatique (`navigator.clipboard` puis
  `document.execCommand` en secours), le texte s'affiche dans une zone
  sélectionnable — le visiteur n'est jamais bloqué. Un lien `wa.me` avait été
  essayé au départ : il est refusé par la politique de sécurité (CSP) de
  certains hébergeurs de prévisualisation, d'où la copie.

Les deux boutons appellent la même fonction `fullMessage()`, qui compose le
texte à partir de `quoteText()` — un seul endroit à modifier pour changer le
contenu du message, quel que soit le canal choisi.

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

## Remise quantité

Sur le nombre total de pièces du panier (tous modèles confondus), dans
`BULK_TIERS` (`assets/js/app.js`) :

| Pièces | Remise |
| ------ | ------ |
| 2      | −10 %  |
| 4      | −20 %  |
| 6      | −30 %  |
| 10     | −40 %  |
| 16     | −50 %  |

`bulkDiscount(qty)` renvoie le meilleur palier atteint ; `nextBulkTier(qty)`
renvoie le prochain palier non atteint (ou `null` au maximum). Elles
s'appliquent :

- au panier : `cartTotals()` additionne le prix brut de chaque ligne
  (`raw`) et le nombre total de pièces (`qty`, une idée sans poids connu
  compte aussi), calcule la remise sur ce nombre, et renvoie le prix remisé
  (`sum`). Le tiroir affiche le détail (sous-total, remise, total) dès
  qu'une remise s'applique et qu'au moins une pièce a un prix ; si le panier
  ne contient que des pièces sans poids connu, le total affiche « Prix à
  définir selon le modèle » et la note ajoute directement « Vous aurez −X %
  sur le prix final » dès que le nombre de pièces suffit — la remise se voit
  même avant de connaître le prix. Sinon, un rappel du prochain palier
  s'affiche tant qu'on n'est pas au maximum. Le message copié pour WhatsApp
  reprend le sous-total, et la ligne « Remise : −X % » termine toujours le
  message, même quand rien n'est encore chiffré ;
- à l'estimateur, comme aperçu : la remise est calculée sur la seule
  quantité de la pièce en cours de réglage, avec un badge « Remise incluse »
  (remise active) ou « Encore X pièce(s) pour −Y % » (prochain palier) —
  avant même l'ajout au panier ; une fois ajoutée, le panier recalcule sur
  la quantité réelle de la commande, qui peut différer si d'autres pièces
  s'y trouvent déjà ;
- au clic sur une idée ou à l'ajout d'une pièce (sur mesure ou personnalisée,
  voir plus bas) : `discountToast()` affiche immédiatement, dans le message
  flottant, la remise déjà active ou ce qu'il manque pour la débloquer, dès
  qu'au moins une pièce est au panier (prix connu ou non) — la promotion se
  voit dès qu'on choisit un produit, pas seulement une fois le panier ouvert.

Modifier `BULK_TIERS` (paliers ou taux) suffit à ajuster la remise partout.

## Galerie

Section `#galerie` (entre les idées et les tarifs, pour rassurer avant de
parler prix) : de vraies photos de pièces déjà imprimées, en mise en page
« masonry » (colonnes CSS, `.gallery{ columns: 4 220px; }`) qui respecte le
format de chaque photo sans la recadrer.

Les fichiers vivent dans `assets/img/gallery/` — réorientés (rotation EXIF
appliquée), réduits à 1400 px sur le plus grand côté et compressés en JPEG
qualité ~80, pour un total d'environ 1 Mo pour 8 photos. Pour ajouter une
photo : déposez-la dans ce dossier, puis ajoutez un bloc dans `index.html` :

```html
<figure class="gphoto">
  <img src="assets/img/gallery/nom-du-fichier.jpg" width="…" height="…" loading="lazy" alt="Description de la pièce et de son contexte">
  <figcaption><b>Nom court</b><span>Détail en une ligne</span></figcaption>
</figure>
```

`width`/`height` (les dimensions réelles du fichier) évitent un saut de mise
en page pendant le chargement ; `loading="lazy"` diffère le chargement des
photos hors écran.

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

## Produit personnalisé

La section Contact (`#customForm` dans `index.html`) n'est plus un simple
champ de message libre : c'est un petit formulaire (nom du produit, poids
approximatif, quantité, description, case « je joindrai un fichier ») qui
ajoute directement une ligne au panier, comme une idée ou une pièce de
l'estimateur.

- le poids saisi calcule un prix indicatif avec la même grille tarifaire
  (`priceFor()`) — pas de champ de prix séparé ;
- la description et le drapeau « fichier » sont stockés sur l'article du
  panier (`it.desc`, `it.file`) et réapparaissent dans la carte du panier et
  dans le message copié pour WhatsApp (précédés de `↳`, avec un rappel
  « 📎 Fichier à joindre » si la case est cochée) — cocher la case n'attache
  aucun fichier réel, c'est un pense-bête pour ne pas l'oublier à l'envoi ;
- nom et description viennent d'un champ texte libre : ils passent par
  `escapeHtml()` avant d'être insérés dans le panier (`innerHTML`), pour
  éviter toute injection de balises. Le texte copié pour WhatsApp reste du
  texte brut, jamais interprété comme du HTML.

## Couleurs

Les bobines annoncées sur le site (section « Le PLA ») : noir, blanc, gris,
vert, orange, bleu clair, jaune, bleu transparent, rouge, titane. Elles sont
listées en HTML dans `index.html`, bloc `.swatches`.

## Contenu des fichiers

- `index.html` — sections : héros, idées, galerie, tarifs, estimateur,
  déroulé, matière, FAQ, contact (formulaire de produit personnalisé),
  tiroir panier.
- `assets/img/gallery/` — photos de pièces réellement imprimées.
- `assets/css/styles.css` — thèmes clair et sombre par variables CSS, mise en
  page responsive, animations.
- `assets/js/app.js` — barème, remise quantité, idées, estimateur, produit
  personnalisé, panier persistant (`localStorage`), copie du message
  (échappement HTML inclus), thème, menu mobile.

## Détails d'implémentation

- Aucun délai, aucune adresse, aucun horaire, aucun email : ces informations
  restent pour la discussion WhatsApp.
- Accessibilité : navigation au clavier, focus visible, `aria-*` sur le menu, le
  tiroir panier et les curseurs, respect de `prefers-reduced-motion`.
- Thème : suit le réglage système par défaut, bouton de bascule mémorisé.
