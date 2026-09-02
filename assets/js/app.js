/* ══════════════════════════════════════════════════════════
   Printables — logique du site

   Les boutons « envoyer » ne partent pas tout seuls : ils
   COPIENT le message dans le presse-papiers, à coller ensuite
   dans WhatsApp. Aucun serveur, aucune adresse email.
   ══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* Tarif : 20 g = 3 €, 50 g = 6 €, 100 g = 12 €, 150 g = 20 €,
     200 g = 27 €. Entre deux paliers, prix au prorata.
     Au-delà de 200 g : prix fixé de la main à la main.          */
  var TIERS = [[20, 3], [50, 6], [100, 12], [150, 20], [200, 27]];
  var MAX_G = 200;      // au-delà : sur devis
  var M_PER_G = 0.335;  // 1 g de PLA ≈ 33,5 cm de filament 1,75 mm

  /* ── prix ─────────────────────────────────────────────── */
  function priceFor(g) {
    if (!g || g <= 0) return null;
    if (g > MAX_G) return null;
    if (g <= TIERS[0][0]) return TIERS[0][1];         // tarif minimum
    for (var i = 1; i < TIERS.length; i++) {
      var a = TIERS[i - 1], b = TIERS[i];
      if (g <= b[0]) {
        var p = a[1] + (g - a[0]) * (b[1] - a[1]) / (b[0] - a[0]);
        return Math.round(p * 2) / 2;                 // arrondi aux 50 centimes
      }
    }
    return null;
  }

  function euro(n) { return n.toFixed(2).replace('.', ',') + ' €'; }

  function lineTotal(g, qty) {
    var u = priceFor(g);
    return u === null ? null : Math.round(u * qty * 100) / 100;
  }

  /* ── catalogue ────────────────────────────────────────────
     Tous les modèles sont gratuits sur MakerWorld : le lien de
     chaque fiche pointe vers la page d'origine de son auteur.
     Les poids sont des estimations (PLA, taille d'origine,
     remplissage 15 %) — le poids exact vient du trancheur.     */
  var MODELS = [
    /* ── maison ───────────────────────────────────────── */
    { id: 'bagclip', name: 'Clips de sachet (lot de 6)', cat: 'maison', g: 22, glyph: '🥨',
      url: 'https://makerworld.com/en/models/1101226-mini-bag-clip',
      desc: 'Le petit clip qui referme un paquet de chips ou de pâtes. Une fois qu\'on en a, on en veut partout dans la cuisine.' },
    { id: 'tube', name: 'Presse-tube à dentifrice', cat: 'maison', g: 20, glyph: '🦷',
      url: 'https://makerworld.com/en/models/30246-ratcheted-toothpaste-tube-squeezer',
      desc: 'À cliquet : on tourne, le tube se roule et il ne redescend jamais. Vide le tube jusqu\'à la dernière goutte.' },
    { id: 'hook', name: 'Crochets muraux (lot de 2)', cat: 'maison', g: 24, glyph: '🪝',
      url: 'https://makerworld.com/en/models/772124-strong-wall-hook-no-screws',
      desc: 'Costauds et sans perçage : ils se collent avec une bande adhésive double face. Parfait pour un torchon ou un manteau.' },
    { id: 'door', name: 'Cale-porte', cat: 'maison', g: 30, glyph: '🚪',
      url: 'https://makerworld.com/en/models/1596339-door-stopper-door-holder-door-stop',
      desc: 'Fin, solide, imprimé d\'une pièce. Il glisse sous la porte et la tient ouverte sans marquer le sol.' },
    { id: 'keys', name: 'Porte-clés mural avec étagères', cat: 'maison', g: 90, glyph: '🔑',
      url: 'https://makerworld.com/en/models/807967-wall-mount-key-holder-organizer-with-shelves',
      desc: 'Six crochets pour les clés et deux petites étagères pour le portefeuille et le téléphone. L\'entrée devient nette.' },
    { id: 'brush', name: 'Porte-brosses à dents mural', cat: 'maison', g: 40, glyph: '🪥',
      url: 'https://makerworld.com/en/models/379430-wall-mounted-practical-toothbrush-holder',
      desc: 'Les brosses restent au sec et ne traînent plus sur le lavabo. Se démonte en trois parties pour le nettoyage.' },
    { id: 'remote', name: 'Range-télécommandes', cat: 'maison', g: 70, glyph: '📺',
      url: 'https://makerworld.com/en/models/547497-modern-remote-control-holder-remote-caddy',
      desc: 'Toutes les télécommandes debout au même endroit, sur la table basse. Fin de la chasse au trésor dans le canapé.' },

    /* ── bureau ───────────────────────────────────────── */
    { id: 'grid', name: 'Bacs Gridfinity (l\'unité)', cat: 'bureau', g: 25, glyph: '🧰',
      url: 'https://makerworld.com/en/models/47599-ultimate-gridfinity-bins-collection-parametric',
      desc: 'Le système de rangement modulaire qui a conquis tous les ateliers : des bacs qui s\'emboîtent au millimètre dans un tiroir. Dites-moi les tailles voulues.' },
    { id: 'cables', name: 'Passe-câbles de bureau', cat: 'bureau', g: 45, glyph: '🔌',
      url: 'https://makerworld.com/en/models/1400922-desk-cable-management-holder-cable-organizer',
      desc: 'Des tubes pivotants qui retiennent chaque câble au bord du bureau. Le chargeur ne tombe plus derrière le meuble.' },
    { id: 'phone', name: 'Support téléphone pliable', cat: 'bureau', g: 10, glyph: '📱',
      url: 'https://makerworld.com/en/models/1776596-flexistand-print-in-place-foldable-phone-stand',
      desc: 'Imprimé déjà articulé : il se déplie pour poser le téléphone, se replie à plat et tient dans une poche.' },
    { id: 'headset', name: 'Support casque à pince', cat: 'bureau', g: 55, glyph: '🎧',
      url: 'https://makerworld.com/en/models/941155-desk-side-headphone-hanger-clamp-headset-stand',
      desc: 'Se pince sur le côté du bureau, sans vis ni colle. Le casque est suspendu, le plan de travail est libre.' },

    /* ── articulés ────────────────────────────────────── */
    { id: 'dragon', name: 'Dragon articulé', cat: 'articule', g: 120, glyph: '🐉',
      url: 'https://makerworld.com/en/models/603571-print-in-place-articulated-dragon',
      desc: 'Imprimé d\'un seul tenant, sans support : il ondule dès qu\'on le décolle du plateau. Le cadeau qui impressionne à tous les coups.' },
    { id: 'spark', name: 'Bébé dragon « Spark »', cat: 'articule', g: 35, glyph: '🦎',
      url: 'https://makerworld.com/en/models/2005756-spark-articulated-baby-dragon-print-in-place',
      desc: 'La version de poche du dragon articulé. Idéal en petit cadeau ou en compagnon de bureau à triturer.' },

    /* ── déco ─────────────────────────────────────────── */
    { id: 'vase', name: 'Vase spiralé', cat: 'deco', g: 15, glyph: '🏺',
      url: 'https://makerworld.com/en/models/137028-vase-spiral-vase-mode',
      desc: 'Imprimé en mode vase : une seule paroi continue, très léger, très rapide. Superbe agrandi. Pour de l\'eau, prévoir un tube en verre.' },
    { id: 'benchy', name: '3DBenchy', cat: 'deco', g: 13, glyph: '⛵',
      url: 'https://makerworld.com/en/models/1123776-original-3d-benchy',
      desc: 'Le petit bateau de test le plus imprimé au monde, passé dans le domaine public. Un classique à poser sur une étagère.' }
  ];

  var CAT_LABEL = { maison: 'Maison', bureau: 'Bureau', articule: 'Articulé', deco: 'Déco' };

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ── copie dans le presse-papiers ─────────────────────── */
  function copyText(text, okMsg) {
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      var done = false;
      try { done = document.execCommand('copy'); } catch (e) { done = false; }
      document.body.removeChild(ta);
      if (done) toast(okMsg);
      else showMessageBox(text);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast(okMsg); }, fallback);
    } else {
      fallback();
    }
  }

  /* dernier recours : on affiche le texte, prêt à être sélectionné */
  function showMessageBox(text) {
    var box = $('#msgBox');
    box.hidden = false;
    var ta = $('#msgBoxText');
    ta.value = text;
    ta.focus();
    ta.select();
    box.scrollIntoView({ block: 'center' });
    toast('Copie automatique refusée par le navigateur : sélectionnez le texte');
  }

  /* ── rendu du catalogue ───────────────────────────────── */
  var grid = $('#grid');

  function cardHTML(m, i) {
    var p = priceFor(m.g);
    var priceHTML = p === null
      ? '<span class="price quote">Sur devis<small>PIÈCE DE PLUS DE 200 G</small></span>'
      : '<span class="price">' + euro(p) + '<small>≈ ' + m.g + ' G DE PLA</small></span>';
    return '<article class="card" data-cat="' + m.cat + '" style="animation-delay:' + (i % 4) * 60 + 'ms">' +
      '<div class="card-view">' +
        '<span class="card-tag">' + CAT_LABEL[m.cat] + '</span>' +
        '<span class="card-w">≈ ' + m.g + ' g</span>' +
        '<span class="glyph" role="img" aria-label="' + m.name + '">' + m.glyph + '</span>' +
      '</div>' +
      '<div class="card-body">' +
        '<h3>' + m.name + '</h3>' +
        '<p>' + m.desc + '</p>' +
        '<a class="card-link" href="' + m.url + '" target="_blank" rel="noopener noreferrer">Voir le modèle sur MakerWorld</a>' +
        '<div class="card-foot">' + priceHTML +
          '<button class="add" type="button" data-add="' + m.id + '">' +
            (p === null ? 'Demander' : 'Ajouter') + '</button>' +
        '</div>' +
      '</div>' +
    '</article>';
  }

  if (grid) grid.innerHTML = MODELS.map(cardHTML).join('');

  /* filtres par catégorie */
  $$('.chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      $$('.chip').forEach(function (c) { c.classList.remove('is-on'); });
      chip.classList.add('is-on');

      var f = chip.getAttribute('data-filter');
      var shown = 0;
      $$('.card', grid).forEach(function (card) {
        var show = (f === 'tous') || (card.getAttribute('data-cat') === f);
        card.classList.toggle('is-hidden', !show);
        if (show) {                       // relance l'animation d'entrée
          card.style.animation = 'none';
          void card.offsetWidth;
          card.style.animation = '';
          card.style.animationDelay = (shown % 4) * 50 + 'ms';
          shown++;
        }
      });
      $('#gridEmpty').hidden = shown > 0;
    });
  });

  /* ── barème (héros + section tarifs) ──────────────────── */
  var heroTiers = $('#heroTiers');
  if (heroTiers) {
    heroTiers.innerHTML = TIERS.map(function (t) {
      return '<li><span>' + t[0] + ' g</span><b>' + euro(t[1]) + '</b></li>';
    }).join('');
  }

  var ladder = $('#ladder');
  if (ladder) {
    var rows = TIERS.map(function (t, i) {
      return '<li class="reveal"><span class="w">' + t[0] + ' g</span>' +
        '<span class="bar"><i style="--w:' + Math.round(t[0] / 260 * 100) + '%;animation-delay:' + (i * 90) + 'ms"></i></span>' +
        '<span class="p">' + euro(t[1]) + '</span></li>';
    }).join('');
    rows += '<li class="more reveal"><span class="w">200 g +</span>' +
      '<span class="bar"><i style="--w:100%;animation-delay:450ms"></i></span>' +
      '<span class="p">À voir ensemble</span></li>';
    ladder.innerHTML = rows;
  }

  /* ── estimateur ───────────────────────────────────────── */
  var wIn = $('#weight'), qIn = $('#qty');

  function fillTrack(el) {
    var pct = (el.value - el.min) / (el.max - el.min) * 100;
    el.style.setProperty('--fill', pct + '%');
  }

  function updateCalc() {
    if (!wIn) return;
    var g = +wIn.value, q = +qIn.value;
    fillTrack(wIn); fillTrack(qIn);

    $('#weightOut').textContent = g + ' g';
    $('#qtyOut').textContent = q + (q > 1 ? ' pièces' : ' pièce');

    var priceEl = $('#price'), box = $('.calc-price');
    var total = lineTotal(g, q);

    if (total === null) {
      box.classList.add('is-quote');
      priceEl.textContent = 'Sur devis';
      $('.cur').style.display = 'none';
      $('#priceSub').textContent = g + ' g : au-delà de 200 g, on en parle ensemble';
    } else {
      box.classList.remove('is-quote');
      $('.cur').style.display = '';
      priceEl.textContent = total.toFixed(2).replace('.', ',');
      $('#priceSub').textContent = g + ' g en PLA · ' + q + (q > 1 ? ' pièces' : ' pièce');
    }

    var tg = g * q;
    $('#metaTotal').textContent = tg + ' g';
    $('#metaFil').textContent = Math.round(tg * M_PER_G) + ' m';
    var unit = priceFor(g);
    $('#metaGram').textContent = unit === null ? '—' : (unit / g).toFixed(3).replace('.', ',') + ' €';

    var hint = 'Un porte-clés pèse une dizaine de grammes, un vase environ 200 g.';
    if (g <= 20) hint = 'Sous 20 g, le tarif minimum s\'applique : 3,00 €.';
    else if (g > MAX_G) hint = 'Au-delà de 200 g, écrivez-moi : on fixe le prix ensemble.';
    $('#calcHint').textContent = hint;
  }

  if (wIn) {
    wIn.addEventListener('input', updateCalc);
    qIn.addEventListener('input', updateCalc);
    updateCalc();
  }

  /* ── petit message flottant ───────────────────────────── */
  var toastEl = $('#toast'), toastT = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('on');
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove('on'); }, 3200);
  }

  /* ── devis (panier) ───────────────────────────────────── */
  var KEY = 'printables.devis.v3';
  var cart = [];
  try { cart = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { cart = []; }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) { /* navigation privée */ }
  }

  function cartTotals() {
    var sum = 0, quote = false;
    cart.forEach(function (it) {
      var t = lineTotal(it.g, it.qty);
      if (t === null) quote = true; else sum += t;
    });
    return { sum: Math.round(sum * 100) / 100, quote: quote };
  }

  function renderCart() {
    var body = $('#cartBody');
    var n = cart.reduce(function (a, it) { return a + it.qty; }, 0);
    $('#cartCount').textContent = n;
    $('#openCart').classList.toggle('has-items', n > 0);

    if (!cart.length) {
      body.innerHTML = '<p class="cart-empty">Votre devis est vide. Ajoutez un modèle du catalogue, ou une pièce sur mesure depuis l\'estimateur.</p>';
    } else {
      body.innerHTML = cart.map(function (it, i) {
        var t = lineTotal(it.g, it.qty);
        return '<div class="cart-item">' +
          '<h3>' + it.name + '</h3>' +
          '<span class="ci-p">' + (t === null ? 'Devis' : euro(t)) + '</span>' +
          '<span class="ci-meta">≈ ' + it.g + ' g · ' + (priceFor(it.g) === null ? 'sur mesure' : euro(priceFor(it.g)) + ' / pièce') + '</span>' +
          '<div class="qty"><button type="button" data-dec="' + i + '" aria-label="Retirer une unité">−</button>' +
          '<b>' + it.qty + '</b>' +
          '<button type="button" data-inc="' + i + '" aria-label="Ajouter une unité">+</button></div>' +
          '<button class="cart-rm" type="button" data-rm="' + i + '">Retirer</button>' +
          '</div>';
      }).join('');
    }

    var tot = cartTotals();
    $('#cartTotal').textContent = tot.sum > 0 ? euro(tot.sum) : (tot.quote ? 'Sur devis' : euro(0));
    $('#cartNote').textContent = tot.quote
      ? 'Une pièce dépasse 200 g : son prix sera fixé avec vous avant l\'impression.'
      : 'Estimation d\'après les poids du catalogue. Le prix est confirmé après passage au trancheur.';

    var note = $('#formNote');
    if (note) {
      note.textContent = cart.length
        ? 'Votre devis (' + n + (n > 1 ? ' pièces' : ' pièce') + ') sera ajouté au message.'
        : 'Votre devis en cours sera ajouté au message.';
    }
    save();
  }

  function addItem(name, g, qty, url) {
    var existing = null;
    cart.forEach(function (it) { if (it.name === name && it.g === g) existing = it; });
    if (existing) existing.qty += (qty || 1);
    else cart.push({ name: name, g: g, qty: qty || 1, url: url || '' });
    renderCart();
  }

  document.addEventListener('click', function (e) {
    if (!(e.target instanceof Element)) return;

    var add = e.target.closest('[data-add]');
    if (add) {
      var m = MODELS.filter(function (x) { return x.id === add.getAttribute('data-add'); })[0];
      if (!m) return;
      addItem(m.name, m.g, 1, m.url);
      add.classList.add('done');
      var old = add.textContent;
      add.textContent = 'Ajouté ✓';
      setTimeout(function () { add.classList.remove('done'); add.textContent = old; }, 1400);
      toast(m.name + ' ajouté à votre devis');
      return;
    }

    var inc = e.target.closest('[data-inc]'), dec = e.target.closest('[data-dec]'), rm = e.target.closest('[data-rm]');
    if (inc) { cart[+inc.getAttribute('data-inc')].qty++; renderCart(); }
    if (dec) {
      var i = +dec.getAttribute('data-dec');
      cart[i].qty--; if (cart[i].qty < 1) cart.splice(i, 1);
      renderCart();
    }
    if (rm) { cart.splice(+rm.getAttribute('data-rm'), 1); renderCart(); }
  });

  var addCustom = $('#addCustom');
  if (addCustom) {
    addCustom.addEventListener('click', function () {
      var g = +wIn.value, q = +qIn.value;
      addItem('Pièce sur mesure ≈ ' + g + ' g', g, q, '');
      toast('Pièce de ' + g + ' g ajoutée à votre devis');
      openDrawer();
    });
  }

  /* tiroir */
  var drawer = $('#drawer'), back = $('#drawerBack'), lastFocus = null;

  function openDrawer() {
    lastFocus = document.activeElement;
    drawer.hidden = false; back.hidden = false;
    document.body.style.overflow = 'hidden';
    $('#closeCart').focus();
  }
  function closeDrawer() {
    drawer.hidden = true; back.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  $('#openCart').addEventListener('click', openDrawer);
  $('#closeCart').addEventListener('click', closeDrawer);
  back.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!drawer.hidden) closeDrawer();
    if ($('#nav').classList.contains('open')) toggleNav(false);
  });

  function quoteText() {
    if (!cart.length) return '';
    var lines = cart.map(function (it) {
      var t = lineTotal(it.g, it.qty);
      return '• ' + it.name + ' × ' + it.qty + ' (≈ ' + it.g + ' g) : ' +
        (t === null ? 'à définir' : euro(t)) + (it.url ? '\n  ' + it.url : '');
    });
    var tot = cartTotals();
    lines.push('Total estimé : ' + euro(tot.sum) + (tot.quote ? ' + pièces à chiffrer' : ''));
    return lines.join('\n');
  }

  $('#sendQuote').addEventListener('click', function () {
    if (!cart.length) { toast('Ajoutez d\'abord un modèle à votre devis'); return; }
    copyText('Bonjour ! Je voudrais faire imprimer :\n\n' + quoteText(),
      'Devis copié ! Collez-le dans WhatsApp et envoyez-le-moi.');
  });

  renderCart();

  /* ── formulaire → copie du message ────────────────────── */
  var waForm = $('#waForm');
  if (waForm) {
    waForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var ta = $('#waMsg');
      var msg = ta.value.trim();
      if (!msg && !cart.length) {
        ta.classList.add('err');
        ta.focus();
        toast('Écrivez un mot, ou ajoutez un modèle à votre devis');
        return;
      }
      ta.classList.remove('err');
      var text = msg || 'Bonjour ! Je voudrais faire imprimer ces pièces :';
      if (cart.length) text += '\n\n' + quoteText();
      copyText(text, 'Message copié ! Collez-le dans WhatsApp et envoyez-le-moi.');
    });
    $('#waMsg').addEventListener('input', function () { this.classList.remove('err'); });
  }

  var closeBox = $('#msgBoxClose');
  if (closeBox) closeBox.addEventListener('click', function () { $('#msgBox').hidden = true; });

  /* ── thème ────────────────────────────────────────────── */
  var TKEY = 'printables.theme';
  try {
    var saved = localStorage.getItem(TKEY);
    if (saved) document.documentElement.setAttribute('data-theme', saved);
  } catch (e) { /* rien */ }

  $('#themeBtn').addEventListener('click', function () {
    var cur = document.documentElement.getAttribute('data-theme');
    if (!cur) cur = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    var next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem(TKEY, next); } catch (e) { /* rien */ }
  });

  /* ── menu mobile ──────────────────────────────────────── */
  var burger = $('#burger'), nav = $('#nav');
  function toggleNav(open) {
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  burger.addEventListener('click', function () { toggleNav(!nav.classList.contains('open')); });
  $$('#nav a').forEach(function (a) {
    a.addEventListener('click', function () { toggleNav(false); });
  });

  /* ── apparition au défilement ─────────────────────────── */
  document.documentElement.classList.add('js');
  $$('.sec-head, .note, .steps li, .mat, .swatches, .faq details, .calc, .contact-txt, .form, .grid-note')
    .forEach(function (el) { el.classList.add('reveal'); });

  var targets = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    targets.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.95) el.classList.add('in');
      else io.observe(el);
    });
  } else {
    targets.forEach(function (el) { el.classList.add('in'); });
  }

  /* ── année ────────────────────────────────────────────── */
  var y = $('#year');
  if (y) y.textContent = new Date().getFullYear();
})();
