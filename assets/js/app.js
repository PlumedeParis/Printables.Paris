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
     Au-delà de 200 g : le prix continue au même taux que le
     dernier palier (150→200 g) — c'est une estimation, le prix
     ferme d'une grosse pièce se confirme avant impression.      */
  var TIERS = [[20, 3], [50, 6], [100, 12], [150, 20], [200, 27]];
  var MAX_G = TIERS[TIERS.length - 1][0];  // au-delà : estimation extrapolée
  var M_PER_G = 0.335;  // 1 g de PLA ≈ 33,5 cm de filament 1,75 mm

  /* ── prix ─────────────────────────────────────────────── */
  function priceFor(g) {
    if (!g || g <= 0) return null;
    if (g <= TIERS[0][0]) return TIERS[0][1];         // tarif minimum
    for (var i = 1; i < TIERS.length; i++) {
      var a = TIERS[i - 1], b = TIERS[i];
      if (g <= b[0]) {
        var p = a[1] + (g - a[0]) * (b[1] - a[1]) / (b[0] - a[0]);
        return Math.round(p * 2) / 2;                 // arrondi aux 50 centimes
      }
    }
    // extrapolation au-delà du dernier palier, au taux du dernier segment
    var last = TIERS[TIERS.length - 1], prev = TIERS[TIERS.length - 2];
    var rate = (last[1] - prev[1]) / (last[0] - prev[0]);
    var p2 = last[1] + (g - last[0]) * rate;
    return Math.round(p2 * 2) / 2;
  }

  function euro(n) { return n.toFixed(2).replace('.', ',') + ' €'; }

  /* ── remise quantité ──────────────────────────────────────
     Sur le nombre total de pièces (du panier, ou de l'aperçu de
     l'estimateur) : 2 pièces = -10 %, 4 pièces = -20 %,
     6 pièces = -30 %, 10 pièces = -40 %, 16 pièces = -50 %.
     On prend le meilleur palier atteint.                        */
  var BULK_TIERS = [[16, 0.50], [10, 0.40], [6, 0.30], [4, 0.20], [2, 0.10]];

  function bulkTierFor(qty) {
    for (var i = 0; i < BULK_TIERS.length; i++) {
      if (qty >= BULK_TIERS[i][0]) return BULK_TIERS[i];
    }
    return null;
  }

  function bulkDiscount(qty) {
    var t = bulkTierFor(qty);
    return t ? t[1] : 0;
  }

  /* le prochain palier non encore atteint, ou null si on est déjà au max */
  function nextBulkTier(qty) {
    var asc = BULK_TIERS.slice().sort(function (a, b) { return a[0] - b[0]; });
    for (var i = 0; i < asc.length; i++) {
      if (qty < asc[i][0]) return asc[i];
    }
    return null;
  }

  function lineTotal(g, qty) {
    var u = priceFor(g);
    return u === null ? null : Math.round(u * qty * 100) / 100;
  }

  /* ── idées ──────────────────────────────────────────────
     De simples pistes pour s'inspirer : pas de prix fixe, pas
     de lien, pas de photo. Le prix dépend toujours du poids
     réel de la pièce choisie, calculé après passage au
     trancheur (voir l'estimateur plus bas).                   */
  var IDEAS = [
    { cat: 'Maison', items: [
      'Clips à sachet', 'Presse-tube à dentifrice', 'Crochets muraux',
      'Cale-porte', 'Porte-clés mural', 'Porte-brosses à dents',
      'Range-télécommandes', 'Porte-savon', 'Vide-poche'
    ]},
    { cat: 'Bureau', items: [
      'Bacs de rangement modulables', 'Passe-câbles', 'Support téléphone',
      'Porte-casque', 'Porte-stylos', 'Support d\'écran'
    ]},
    { cat: 'Déco', items: [
      'Affiche / plaque murale en relief', 'Vase', 'Porte-lunettes',
      'Cadre photo', 'Bougeoir', 'Figurine articulée'
    ]},
    { cat: 'Autres', items: [
      'Porte-savon de douche', 'Range-bijoux', 'Support d\'enceinte',
      'Pièce de rechange cassée', 'Gabarit ou outil sur mesure'
    ]}
  ];

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* échappe le texte libre (nom/description saisis) avant de l'insérer en innerHTML */
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

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

  /* ── rendu des idées ──────────────────────────────────── */
  var ideasEl = $('#ideas');
  if (ideasEl) {
    ideasEl.innerHTML = IDEAS.map(function (group) {
      var pills = group.items.map(function (name) {
        return '<li><button class="idea" type="button">' + name + '</button></li>';
      }).join('');
      return '<div class="idea-group reveal">' +
        '<h3>' + group.cat + '</h3>' +
        '<ul class="idea-list">' + pills + '</ul>' +
      '</div>';
    }).join('');
  }

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
      '<span class="p">Estimation</span></li>';
    ladder.innerHTML = rows;
  }

  var bulkTiersEl = $('#bulkTiers');
  if (bulkTiersEl) {
    bulkTiersEl.innerHTML = BULK_TIERS.slice().reverse().map(function (t) {
      return '<li><span>' + t[0] + ' pièces</span><b>−' + Math.round(t[1] * 100) + ' %</b></li>';
    }).join('');
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

    var priceEl = $('#price');
    var raw = lineTotal(g, q);
    var discount = bulkDiscount(q);
    var total = Math.round(raw * (1 - discount) * 100) / 100;

    priceEl.textContent = total.toFixed(2).replace('.', ',');
    $('#priceSub').textContent = g + ' g en PLA · ' + q + (q > 1 ? ' pièces' : ' pièce') +
      (g > MAX_G ? ' · estimation' : '');

    var discBadge = $('#calcDiscount');
    if (discount > 0) {
      discBadge.hidden = false;
      discBadge.classList.remove('pending');
      discBadge.textContent = 'Remise incluse : −' + Math.round(discount * 100) + ' % (' + q + ' pièces identiques)';
    } else {
      var next = nextBulkTier(q);
      if (next) {
        var missingQ = next[0] - q;
        discBadge.hidden = false;
        discBadge.classList.add('pending');
        discBadge.textContent = 'Encore ' + missingQ + (missingQ > 1 ? ' pièces' : ' pièce') + ' pour −' + Math.round(next[1] * 100) + ' % de remise';
      } else {
        discBadge.hidden = true;
      }
    }

    var tg = g * q;
    $('#metaTotal').textContent = tg + ' g';
    $('#metaFil').textContent = Math.round(tg * M_PER_G) + ' m';
    var unit = priceFor(g);
    $('#metaGram').textContent = (unit / g).toFixed(3).replace('.', ',') + ' €';

    var hint = 'Un porte-clés pèse une dizaine de grammes, un vase environ 200 g.';
    if (g <= 20) hint = 'Sous 20 g, le tarif minimum s\'applique : 3,00 €.';
    else if (g > MAX_G) hint = 'Au-delà de 200 g, ce prix est une estimation au même tarif : on le confirme ensemble avant impression (matière, découpe éventuelle).';
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

  /* montre la promotion qui s'applique (ou celle qu'on approche)
     juste au moment où on choisit une pièce, pas seulement une fois
     le panier ouvert.                                              */
  function discountToast(label, verb) {
    verb = verb || 'ajouté';
    var tot = cartTotals();
    if (tot.qty <= 0) {
      toast('« ' + label + ' » ' + verb + ' à votre panier');
      return;
    }
    if (tot.discount > 0) {
      toast('« ' + label + ' » ' + verb + ' — remise −' + Math.round(tot.discount * 100) + ' % active (' + tot.qty + (tot.qty > 1 ? ' pièces' : ' pièce') + ')');
      return;
    }
    var next = nextBulkTier(tot.qty);
    if (next) {
      var missing = next[0] - tot.qty;
      toast('« ' + label + ' » ' + verb + ' — encore ' + missing + (missing > 1 ? ' pièces' : ' pièce') + ' pour −' + Math.round(next[1] * 100) + ' %');
    } else {
      toast('« ' + label + ' » ' + verb + ' à votre panier');
    }
  }

  /* ── panier ───────────────────────────────────────────── */
  var KEY = 'printables.panier.v1';
  var cart = [];
  try { cart = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { cart = []; }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) { /* navigation privée */ }
  }

  function cartTotals() {
    var raw = 0, quote = false, qty = 0;
    cart.forEach(function (it) {
      qty += it.qty;
      var t = lineTotal(it.g, it.qty);
      if (t === null) quote = true; else raw += t;
    });
    raw = Math.round(raw * 100) / 100;
    var discount = bulkDiscount(qty);
    var sum = Math.round(raw * (1 - discount) * 100) / 100;
    return { raw: raw, sum: sum, discount: discount, qty: qty, quote: quote };
  }

  function renderCart() {
    var body = $('#cartBody');
    var n = cart.reduce(function (a, it) { return a + it.qty; }, 0);
    $('#cartCount').textContent = n;
    $('#openCart').classList.toggle('has-items', n > 0);

    if (!cart.length) {
      body.innerHTML = '<p class="cart-empty">Votre panier est vide. Cliquez sur une idée ci-dessus, ou ajoutez une pièce sur mesure depuis l\'estimateur.</p>';
    } else {
      body.innerHTML = cart.map(function (it, i) {
        var t = lineTotal(it.g, it.qty);
        var priceLabel = t === null ? 'À définir' : euro(t);
        var metaLabel = it.g
          ? '≈ ' + it.g + ' g · ' + (priceFor(it.g) === null ? 'sur mesure' : euro(priceFor(it.g)) + ' / pièce')
          : 'Poids à définir ensemble';
        var extraHtml = '';
        if (it.desc) extraHtml += '<p class="ci-desc">' + escapeHtml(it.desc) + '</p>';
        if (it.file) extraHtml += '<span class="ci-file">📎 Fichier à joindre</span>';
        return '<div class="cart-item">' +
          '<div class="ci-head"><h3>' + escapeHtml(it.name) + '</h3><span class="ci-p">' + priceLabel + '</span></div>' +
          '<span class="ci-meta">' + metaLabel + '</span>' +
          extraHtml +
          '<div class="ci-foot">' +
            '<div class="qty"><button type="button" data-dec="' + i + '" aria-label="Retirer une unité">−</button>' +
            '<b>' + it.qty + '</b>' +
            '<button type="button" data-inc="' + i + '" aria-label="Ajouter une unité">+</button></div>' +
            '<button class="cart-rm" type="button" data-rm="' + i + '">Retirer</button>' +
          '</div>' +
          '</div>';
      }).join('');
    }

    var tot = cartTotals();

    var rowsHtml = '';
    if (tot.discount > 0 && tot.raw > 0) {
      rowsHtml += '<div class="drawer-row"><span>Sous-total (' + tot.qty + (tot.qty > 1 ? ' pièces' : ' pièce') + ')</span><b>' + euro(tot.raw) + '</b></div>';
      rowsHtml += '<div class="drawer-row discount"><span>Remise −' + Math.round(tot.discount * 100) + ' %</span><b>−' + euro(Math.round((tot.raw - tot.sum) * 100) / 100) + '</b></div>';
    }
    $('#cartRows').innerHTML = rowsHtml;

    var cartTotalEl = $('#cartTotal');
    cartTotalEl.textContent = tot.sum > 0 ? euro(tot.sum) : (tot.quote ? 'Prix à définir selon le modèle' : euro(0));
    cartTotalEl.classList.toggle('is-text', tot.sum <= 0 && tot.quote);
    var cartNote = tot.quote
      ? 'Le poids de certaines pièces reste à définir : leur prix sera fixé avec vous avant l\'impression.'
      : 'Estimation d\'après les poids indiqués. Le prix est confirmé après passage au trancheur.';
    if (tot.qty > 0) {
      if (tot.discount > 0 && tot.raw <= 0) {
        cartNote += ' Vous aurez −' + Math.round(tot.discount * 100) + ' % sur le prix final.';
      } else {
        var nextTier = nextBulkTier(tot.qty);
        if (nextTier) {
          var missingPieces = nextTier[0] - tot.qty;
          cartNote += ' Encore ' + missingPieces + (missingPieces > 1 ? ' pièces' : ' pièce') + ' pour −' + Math.round(nextTier[1] * 100) + ' % de remise.';
        }
      }
    }
    $('#cartNote').textContent = cartNote;
    save();
  }

  function addItem(name, g, qty, extra) {
    var existing = null;
    if (!extra) {
      cart.forEach(function (it) { if (it.name === name && it.g === g && !it.desc && !it.file) existing = it; });
    }
    if (existing) {
      existing.qty += (qty || 1);
    } else {
      var item = { name: name, g: g, qty: qty || 1 };
      if (extra) { for (var k in extra) item[k] = extra[k]; }
      cart.push(item);
    }
    renderCart();
  }

  document.addEventListener('click', function (e) {
    if (!(e.target instanceof Element)) return;

    var idea = e.target.closest('.idea');
    if (idea) {
      var name = idea.textContent.trim();
      addItem(name, null, 1);
      idea.classList.add('done');
      var old = idea.textContent;
      idea.textContent = 'Ajouté ✓';
      setTimeout(function () { idea.classList.remove('done'); idea.textContent = old; }, 1300);
      discountToast(name);
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
      addItem('Pièce sur mesure ≈ ' + g + ' g', g, q);
      discountToast('Pièce de ' + g + ' g', 'ajoutée');
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
      var weightPart = it.g ? ' (≈ ' + it.g + ' g)' : '';
      var line = '• ' + it.name + ' × ' + it.qty + weightPart + ' : ' +
        (t === null ? 'à définir' : euro(t));
      if (it.desc) line += '\n  ↳ ' + it.desc;
      if (it.file) line += '\n  ↳ 📎 Fichier à joindre';
      return line;
    });
    var tot = cartTotals();
    if (tot.discount > 0 && tot.raw > 0) {
      lines.push('Sous-total (' + tot.qty + (tot.qty > 1 ? ' pièces' : ' pièce') + ') : ' + euro(tot.raw));
    }
    var totalLine = tot.sum > 0
      ? 'Total estimé : ' + euro(tot.sum) + (tot.quote ? ' + pièces à chiffrer' : '')
      : (tot.quote ? 'Total : à chiffrer ensemble' : 'Total estimé : ' + euro(tot.sum));
    lines.push(totalLine);
    if (tot.discount > 0) {
      lines.push('Remise : −' + Math.round(tot.discount * 100) + ' % (' + tot.qty + (tot.qty > 1 ? ' pièces' : ' pièce') + ')');
    }
    return lines.join('\n');
  }

  $('#sendQuote').addEventListener('click', function () {
    if (!cart.length) { toast('Ajoutez d\'abord une idée à votre panier'); return; }
    copyText('Bonjour ! Je voudrais faire imprimer :\n\n' + quoteText(),
      'Panier copié ! Collez-le dans WhatsApp et envoyez-le-moi.');
  });

  renderCart();

  /* ── produit personnalisé → ajout au panier ───────────── */
  var customForm = $('#customForm');
  if (customForm) {
    customForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var nameEl = $('#cpName'), weightEl = $('#cpWeight'), qtyEl = $('#cpQty'),
          descEl = $('#cpDesc'), fileEl = $('#cpFile');

      var name = nameEl.value.trim();
      var g = +weightEl.value;
      var q = Math.max(1, Math.round(+qtyEl.value) || 1);
      var bad = false;

      if (!name) { nameEl.classList.add('err'); bad = true; } else nameEl.classList.remove('err');
      if (!g || g <= 0) { weightEl.classList.add('err'); bad = true; } else weightEl.classList.remove('err');
      if (bad) {
        toast('Indiquez au moins le nom et le poids approximatif');
        return;
      }

      var extra = {};
      if (descEl.value.trim()) extra.desc = descEl.value.trim();
      if (fileEl.checked) extra.file = true;

      addItem(name, g, q, extra);
      discountToast(name);
      openDrawer();

      nameEl.value = ''; weightEl.value = ''; qtyEl.value = 1; descEl.value = ''; fileEl.checked = false;
    });
    $('#cpName').addEventListener('input', function () { this.classList.remove('err'); });
    $('#cpWeight').addEventListener('input', function () { this.classList.remove('err'); });
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
  $$('.sec-head, .note, .steps li, .mat, .swatches, .faq details, .calc, .contact-txt, .form')
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
