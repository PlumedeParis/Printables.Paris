/* ══════════════════════════════════════════════════════════
   Printables — logique du site
   Tarif : 20 g = 3 €, 50 g = 6 €, 100 g = 12 €, 150 g = 20 €,
   200 g = 27 €. Entre deux paliers, prix au prorata.
   Au-delà de 200 g : devis personnalisé.
   ══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var TIERS = [[20, 3], [50, 6], [100, 12], [150, 20], [200, 27]];
  var MAX_G = 200;              // au-delà : sur devis
  var BULK_FROM = 5;            // remise quantité
  var BULK_OFF = 0.10;
  var M_PER_G = 0.335;          // 1 g de PLA ≈ 33,5 cm de filament 1,75 mm
  var G_PER_H = 12;             // débit machine moyen

  /* ── prix ─────────────────────────────────────────────── */
  function priceFor(g) {
    if (!g || g <= 0) return null;
    if (g > MAX_G) return null;                       // sur devis
    if (g <= TIERS[0][0]) return TIERS[0][1];         // minimum atelier
    for (var i = 1; i < TIERS.length; i++) {
      var a = TIERS[i - 1], b = TIERS[i];
      if (g <= b[0]) {
        var p = a[1] + (g - a[0]) * (b[1] - a[1]) / (b[0] - a[0]);
        return Math.round(p * 2) / 2;                 // arrondi aux 50 centimes
      }
    }
    return null;
  }

  function euro(n) {
    return n.toFixed(2).replace('.', ',') + ' €';
  }

  function lineTotal(g, qty) {
    var u = priceFor(g);
    if (u === null) return null;
    var t = u * qty;
    if (qty >= BULK_FROM) t *= (1 - BULK_OFF);
    return Math.round(t * 100) / 100;
  }

  /* ── catalogue ────────────────────────────────────────── */
  var MODELS = [
    { id: 'wave',    name: 'Support téléphone « Wave »', cat: 'bureau',   g: 45,  glyph: '📱', desc: 'Une seule courbe continue, imprimée sans support. Tient aussi en mode paysage.' },
    { id: 'gyro',    name: 'Vase Gyroïde',               cat: 'deco',     g: 200, glyph: '🏺', desc: 'Imprimé en spirale, paroi unique de 1,2 mm. Étanche après vernis, ou avec tube en verre.' },
    { id: 'dragon',  name: 'Dragon articulé',            cat: 'figurine', g: 95,  glyph: '🐉', desc: '38 segments qui bougent dès la sortie du plateau. Aucun assemblage, aucune vis.' },
    { id: 'lampe',   name: 'Lampe hexagonale',           cat: 'deco',     g: 180, glyph: '💡', desc: 'Abat-jour en PLA translucide, douille E14 à insérer. Diffuse une lumière chaude.' },
    { id: 'manette', name: 'Range-manettes mural',       cat: 'gaming',   g: 70,  glyph: '🎮', desc: 'Double crochet pour manettes Xbox, PS5 ou Switch Pro. Vis et chevilles fournies.' },
    { id: 'des',     name: 'Boîte à dés JDR',            cat: 'gaming',   g: 90,  glyph: '🎲', desc: 'Charnière imprimée d\'un bloc, fermeture aimantée. Sept dés bien calés à l\'intérieur.' },
    { id: 'pot',     name: 'Cache-pot spirale',          cat: 'deco',     g: 120, glyph: '🪴', desc: 'Pour pot de 12 cm. Soucoupe intégrée, nervures qui laissent respirer les racines.' },
    { id: 'cables',  name: 'Organiseur de câbles',       cat: 'bureau',   g: 80,  glyph: '🔌', desc: 'Cinq gorges de largeurs différentes, base lestable. Fini le câble qui tombe du bureau.' },
    { id: 'toupie',  name: 'Toupie fidget infinie',      cat: 'figurine', g: 25,  glyph: '🌀', desc: 'Roulement imprimé en une pièce, tourne plus de deux minutes sur une surface lisse.' },
    { id: 'serre',   name: 'Mini serre à semis',         cat: 'utile',    g: 40,  glyph: '🌱', desc: 'Quatre alvéoles et un couvercle transparent à clipser. Parfait pour un rebord de fenêtre.' },
    { id: 'casque',  name: 'Support casque gaming',      cat: 'gaming',   g: 150, glyph: '🎧', desc: 'Se pince sur un plateau de 4 cm max, mousse de protection collée sur l\'arc.' },
    { id: 'porte',   name: 'Plaque de porte gravée',     cat: 'utile',    g: 55,  glyph: '🚪', desc: 'Votre texte en relief, changement de couleur à la couche 12. Deux polices au choix.' },
    { id: 'crochet', name: 'Crochets muraux (lot de 4)',  cat: 'utile',    g: 18,  glyph: '🪝', desc: 'Testés à 3 kg en PETG. Adhésif 3M ou vis, selon votre mur.' },
    { id: 'macbook', name: 'Support pour ordinateur',    cat: 'bureau',   g: 210, glyph: '💻', desc: 'Relève l\'écran de 11 cm, patins en TPU. Grosse pièce : prix sur devis.' }
  ];

  var CAT_LABEL = { deco: 'Déco', bureau: 'Bureau', gaming: 'Gaming', figurine: 'Figurine', utile: 'Utile' };

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ── rendu du catalogue ───────────────────────────────── */
  var grid = $('#grid');

  function cardHTML(m, i) {
    var p = priceFor(m.g);
    var priceHTML = p === null
      ? '<span class="price quote">Sur devis<small>PIÈCE DE PLUS DE 200 G</small></span>'
      : '<span class="price">' + euro(p) + '<small>' + m.g + ' G DE PLA</small></span>';
    return '<article class="card" data-cat=""' + m.cat + '" style="animation-delay:' + (i % 4) * 60 + 'ms">' +
      '<div class="card-view">' +
        '<span class="card-tag">' + CAT_LABEL[m.cat] + '</span>' +
        '<span class="card-w">' + m.g + ' g</span>' +
        '<span class="glyph" role="img" aria-label="' + m.name + '">' + m.glyph + '</span>' +
      '</div>' +
      '<div class="card-body">' +
        '<h3>' + m.name + '</h3>' +
        '<p>' + m.desc + '</p>' +
        '<div class="card-foot">' + priceHTML +
          '<button class="add" type="button" data-add="' + m.id + '">' +
            (p === null ? 'Demander' : 'Ajouter') + '</button>' +
        '</div>' +
      '</div>' +
    '</article>';
  }

  if (grid) {
    grid.innerHTML = MODELS.map(cardHTML).join('');
  }

  /* filtres */
  $$('.chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      $$('.chip').forEach(function (c) { c.classList.remove('is-on'); });
      chip.classList.add('is-on');
      var f = chip.getAttribute('data-filter');
      $$('.card', grid).forEach(function (card, i) {
        var show = f === 'tous' || card.getAttribute('data-cat') === f;
        card.classList.toggle('is-hidden', !show);
        if (show) {                       // relance l'animation d'entrée
          card.style.animation = 'none';
          void card.offsetWidth;
          card.style.animation = '';
          card.style.animationDelay = (i % 4) * 50 + 'ms';
        }
      });
    });
  });

  /* ── échelle de tarifs ────────────────────────────────── */
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

  function hhmm(hours) {
    var h = Math.floor(hours), m = Math.round((hours - h) * 60);
    if (m === 60) { h += 1; m = 0; }
    return h + ' h ' + (m < 10 ? '0' + m : m);
  }

  function updateCalc() {
    if (!wIn) return;
    var g = +wIn.value, q = +qIn.value;
    fillTrack(wIn); fillTrack(qIn);

    $('#weightOut').textContent = g + ' g';
    $('#qtyOut').textContent = q + (q > 1 ? ' pièces' : ' pièce');

    var priceEl = $('#price'), curEl = $('.calc-price');
    var total = lineTotal(g, q);

    if (total === null) {
      curEl.classList.add('is-quote');
      priceEl.textContent = 'Sur devis';
      $('.cur').style.display = 'none';
      $('#priceSub').textContent = g + ' g : au-delà de 200 g, on en parle ensemble';
      $('#addCustom').textContent = 'Demander un devis pour cette pièce';
    } else {
      curEl.classList.remove('is-quote');
      $('.cur').style.display = '';
      priceEl.textContent = total.toFixed(2).replace('.', ',');
      $('#priceSub').textContent = g + ' g en PLA · ' + q + (q > 1 ? ' pièces' : ' pièce') +
        (q >= BULK_FROM ? ' · remise série −10 %' : '');
      $('#addCustom').textContent = 'Ajouter cette pièce au devis';
    }

    var tg = g * q;
    $('#metaFil').textContent = Math.round(tg * M_PER_G) + ' m';
    $('#metaTime').textContent = hhmm(tg / G_PER_H);
    var unit = priceFor(g);
    $('#metaGram').textContent = unit === null ? '—' : (unit / g).toFixed(3).replace('.', ',') + ' €';

    var hint = 'Un porte-clés pèse ~12 g, un vase ~200 g.';
    if (g <= 20) hint = 'Sous 20 g, le tarif minimum de l\'atelier s\'applique : 3,00 €.';
    else if (g > MAX_G) hint = 'Grosse pièce : souvent imprimée en plusieurs morceaux puis collée.';
    else if (q >= BULK_FROM) hint = 'À partir de 5 exemplaires identiques, la remise série de 10 % est appliquée.';
    $('#calcHint').textContent = hint;
  }

  if (wIn) {
    wIn.addEventListener('input', updateCalc);
    qIn.addEventListener('input', updateCalc);
    updateCalc();
  }

  /* ── devis (panier) ───────────────────────────────────── */
  var KEY = 'printables.devis.v1';
  var cart = [];
  try { cart = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { cart = []; }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) { /* mode privé */ }
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
    var body = $('#cartBody'), count = $('#cartCount');
    var n = cart.reduce(function (a, it) { return a + it.qty; }, 0);
    count.textContent = n;
    $('#openCart').classList.toggle('has-items', n > 0);

    if (!cart.length) {
      body.innerHTML = '<p class="cart-empty">Votre devis est vide. Ajoutez un modèle du catalogue, ou une pièce sur mesure depuis l\'estimateur.</p>';
    } else {
      body.innerHTML = cart.map(function (it, i) {
        var t = lineTotal(it.g, it.qty);
        return '<div class="cart-item">' +
          '<h3>' + it.name + '</h3>' +
          '<span class="ci-p">' + (t === null ? 'Devis' : euro(t)) + '</span>' +
          '<span class="ci-meta">' + it.g + ' g · ' + (priceFor(it.g) === null ? 'sur mesure' : euro(priceFor(it.g)) + ' / pièce') + '</span>' +
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
      : 'Estimation hors livraison. Le prix est confirmé après passage au trancheur.';
    save();
  }

  function addItem(name, g, qty) {
    var existing = null;
    cart.forEach(function (it) { if (it.name === name && it.g === g) existing = it; });
    if (existing) existing.qty += (qty || 1);
    else cart.push({ name: name, g: g, qty: qty || 1 });
    renderCart();
  }

  /* petit message flottant */
  var toastEl = $('#toast'), toastT = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('on');
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove('on'); }, 2600);
  }

  document.addEventListener('click', function (e) {
    if (!(e.target instanceof Element)) return;
    var add = e.target.closest('[data-add]');
    if (add) {
      var m = MODELS.filter(function (x) { return x.id === add.getAttribute('data-add'); })[0];
      if (!m) return;
      addItem(m.name, m.g, 1);
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
      addItem('Pièce sur mesure ' + g + ' g', g, q);
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
    if (e.key === 'Escape') {
      if (!drawer.hidden) closeDrawer();
      var nav = $('#nav');
      if (nav.classList.contains('open')) toggleNav(false);
    }
  });

  function quoteText() {
    if (!cart.length) return '';
    var lines = cart.map(function (it) {
      var t = lineTotal(it.g, it.qty);
      return '- ' + it.name + ' × ' + it.qty + ' (' + it.g + ' g) : ' + (t === null ? 'sur devis' : euro(t));
    });
    var tot = cartTotals();
    lines.push('Total estimé : ' + euro(tot.sum) + (tot.quote ? ' + pièces sur devis' : ''));
    return lines.join('\n');
  }

  $('#sendQuote').addEventListener('click', function () {
    if (!cart.length) { toast('Ajoutez d\'abord un modèle à votre devis'); return; }
    var body = 'Bonjour,\n\nJe souhaite faire imprimer :\n\n' + quoteText() + '\n\nMerci !';
    window.location.href = 'mailto:bonjour@printables.paris?subject=' +
      encodeURIComponent('Demande de devis Printables') + '&body=' + encodeURIComponent(body);
    toast('Votre logiciel de mail s\'ouvre avec le récapitulatif');
  });

  renderCart();

  /* ── formulaire ───────────────────────────────────────── */
  var form = $('#contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = $('#formNote');
      var name = $('#cName'), mail = $('#cMail'), msg = $('#cMsg');
      var bad = false;
      [name, mail, msg].forEach(function (f) {
        var empty = !f.value.trim();
        var wrong = f === mail && f.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value);
        f.classList.toggle('err', empty || wrong);
        if (empty || wrong) bad = true;
      });
      if (bad) {
        note.classList.remove('ok');
        note.textContent = 'Il manque votre nom, un email valide ou la description du projet.';
        return;
      }
      var body = msg.value + (cart.length ? '\n\nDevis en cours :\n' + quoteText() : '') +
        '\n\n— ' + name.value + ' (' + mail.value + ')';
      note.classList.add('ok');
      note.textContent = 'Merci ' + name.value.split(' ')[0] + ' ! Votre message est prêt à partir, réponse sous 24 h ouvrées.';
      window.location.href = 'mailto:bonjour@printables.paris?subject=' +
        encodeURIComponent('[' + $('#cSubj').value + '] ' + name.value) + '&body=' + encodeURIComponent(body);
    });
  }

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
  burger.addEventListener('click', function () {
    toggleNav(!nav.classList.contains('open'));
  });
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

  /* ── ticker G-code du héros ───────────────────────────── */
  var gline = $('#gcodeLine');
  if (gline && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var layer = 1;
    setInterval(function () {
      layer = layer % 340 + 1;
      var z = (layer * 0.2).toFixed(2);
      gline.textContent = 'G1 Z' + z + ' F1200 ; couche ' + layer + '/340 · buse 210 °C · plateau 60 °C';
    }, 1800);
  }

  /* ── année ────────────────────────────────────────────── */
  var y = $('#year');
  if (y) y.textContent = new Date().getFullYear();
})();
