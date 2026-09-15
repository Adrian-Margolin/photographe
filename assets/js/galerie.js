// galerie.js — moteur des séries photo
//
// Trois types de séries :
//  - "embed" : une page HTML autonome (exportée telle quelle depuis l'appli
//              maquette-livre-photo, images incluses) affichée dans un cadre.
//              C'est le type recommandé — le plus simple à préparer.
//  - "book"  : mise en page en doubles pages, pilotée par un ordre.json
//              exporté depuis l'appli maquette-livre-photo.
//  - "flat"  : simple grille (façon mur d'images), pour une série sans
//              mise en page particulière — juste une liste de fichiers.
//
// Pour ajouter une série de type "embed" (le plus simple) :
//   1. Exporte la page HTML complète depuis l'appli maquette-livre-photo.
//   2. Dépose le fichier dans /embeds/<nom>.html
//   3. Ajoute une entrée ci-dessous avec type:'embed', src:'embeds/<nom>.html'.
//
// Pour "book" et "flat", voir le README.

var CARNETS = [
  {
    id: 'portraits',
    type: 'embed',
    title: 'Portraits',
    titleEn: 'Portraits',
    description: 'Visages, en lumière naturelle.',
    descriptionEn: 'Faces, in natural light.',
    src: 'embeds/portraits.html',
    cover: 'photos/teaser/cover-portraits.jpg'
  },
  {
    id: 'abstraction',
    type: 'embed',
    title: "Vers l'abstraction",
    titleEn: 'Toward Abstraction',
    description: 'Formes, matières, lumière.',
    descriptionEn: 'Shapes, materials, light.',
    src: 'embeds/abstraction.html',
    cover: 'photos/teaser/cover-abstraction.jpg'
  }
];

(function () {
  var grid = document.getElementById('carnets-grid');
  var viewer = document.getElementById('viewer');
  if (!grid || !viewer) return;

  var viewerHead = viewer.querySelector('.viewer-head h2');
  var viewerBack = document.getElementById('viewer-back');
  var spreadsEl = document.getElementById('spreads');

  if (viewerBack) {
    viewerBack.addEventListener('click', function () {
      viewer.hidden = true;
      grid.hidden = false;
      spreadsEl.innerHTML = '';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var currentPlates = []; // {full}
  var lightbox = document.getElementById('lightbox');
  var lbImg = lightbox.querySelector('img');
  var lbIndex = 0;

  function buildTiles() {
    CARNETS.forEach(function (carnet) {
      var tile = document.createElement('div');
      tile.className = 'carnet-tile';
      tile.innerHTML =
        '<div class="cover"><img src="' + carnet.cover + '" alt="" loading="lazy"></div>' +
        '<div class="meta"><h3 data-en="' + carnet.titleEn + '">' + carnet.title + '</h3>' +
        '<p class="count" data-en="' + carnet.descriptionEn + '">' + carnet.description + '</p></div>';
      tile.addEventListener('click', function () { openCarnet(carnet); });
      grid.appendChild(tile);
    });
    if (window.applyI18n) window.applyI18n(window.siteLang(), grid);
  }

  function openCarnet(carnet) {
    if (carnet.type === 'embed') {
      window.location.href = carnet.src;
      return;
    }
    grid.hidden = true;
    viewer.hidden = false;
    spreadsEl.innerHTML = '<p class="loading-row" data-en="Loading…">Chargement…</p>';
    if (window.applyI18n) window.applyI18n(window.siteLang(), spreadsEl);
    viewer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    viewerHead.textContent = window.siteLang && window.siteLang() === 'en' ? carnet.titleEn : carnet.title;

    if (carnet.type === 'flat') {
      renderFlat(carnet);
      return;
    }

    if (carnet.type === 'embed') {
      renderEmbed(carnet);
      return;
    }

    if (carnet.dataElementId) {
      var el = document.getElementById(carnet.dataElementId);
      if (!el) {
        spreadsEl.innerHTML = '<p class="loading-row" data-en="No data found for this series.">Données introuvables pour cette série.</p>';
        if (window.applyI18n) window.applyI18n(window.siteLang(), spreadsEl);
        return;
      }
      try {
        var data = JSON.parse(el.textContent);
        renderBook(carnet, data);
      } catch (err) {
        spreadsEl.innerHTML = '<p class="loading-row" data-en="This series\' JSON is invalid.">Le JSON de cette série est invalide.</p>';
        if (window.applyI18n) window.applyI18n(window.siteLang(), spreadsEl);
      }
      return;
    }

    fetch(carnet.json)
      .then(function (r) { return r.json(); })
      .then(function (data) { renderBook(carnet, data); })
      .catch(function () {
        spreadsEl.innerHTML = '<p class="loading-row" data-en="Could not load this series (the site needs to be hosted, not just opened from disk).">Impossible de charger cette série (le site doit être hébergé, pas seulement ouvert depuis le disque).</p>';
        if (window.applyI18n) window.applyI18n(window.siteLang(), spreadsEl);
      });
  }

  function renderEmbed(carnet) {
    spreadsEl.className = '';
    spreadsEl.innerHTML = '';
    currentPlates = [];
    var frame = document.createElement('iframe');
    frame.className = 'embed-frame';
    frame.src = carnet.src;
    frame.loading = 'lazy';
    frame.setAttribute('title', carnet.title);
    // La hauteur s'ajuste au contenu réel de la page intégrée une fois chargée.
    frame.addEventListener('load', function () {
      try {
        var doc = frame.contentDocument;
        if (doc) frame.style.height = doc.documentElement.scrollHeight + 'px';
      } catch (e) { /* rien à faire si l'accès est bloqué */ }
    });
    spreadsEl.appendChild(frame);
  }

  function renderFlat(carnet) {
    spreadsEl.innerHTML = '';
    spreadsEl.className = '';
    currentPlates = [];

    var groups = carnet.groups && carnet.groups.length ? carnet.groups : [carnet.count];
    var i = 1; // index de la photo, 1..count

    groups.forEach(function (groupSize) {
      var groupEl = document.createElement('div');
      groupEl.className = 'flat-grid';
      for (var g = 0; g < groupSize && i <= carnet.count; g++, i++) {
        var num = (i < 10 ? '0' : '') + i;
        var full = carnet.base + '/' + num + '.jpg';
        var mini = carnet.base + '/miniatures/' + num + '-mini.jpg';
        currentPlates.push({ full: full });

        var fig = document.createElement('figure');
        fig.className = 'flat-plate';
        var img = document.createElement('img');
        img.loading = 'lazy';
        img.alt = '';
        img.src = mini;
        img.dataset.full = full;
        (function (idx) {
          fig.addEventListener('click', function () { openLightbox(idx); });
        })(i - 1);
        fig.appendChild(img);
        groupEl.appendChild(fig);
      }
      spreadsEl.appendChild(groupEl);
    });
  }

  function renderBook(carnet, data) {
    spreadsEl.className = '';

    var raw = (data.elements || []).slice().sort(function (a, b) { return a.rangee - b.rangee; });

    // Regroupe les photos par rangée, dans l'ordre d'apparition, en gardant
    // les éventuelles rangées "titre" (nom du sujet) à leur place.
    var rows = []; // { type: 'photos', items: [...] } ou { type: 'titre', texte }
    var byRangee = {};
    raw.forEach(function (el) {
      if (!el) return;
      if (el.type === 'titre' && el.texte) {
        rows.push({ type: 'titre', texte: el.texte });
        return;
      }
      if (el.type === 'photo' && el.fichier &&
          el.rangee !== null && el.rangee !== undefined && el.rangee > 0 &&
          el.position !== null && el.position !== undefined && el.position > 0) {
        if (!byRangee[el.rangee]) {
          byRangee[el.rangee] = { type: 'photos', items: [] };
          rows.push(byRangee[el.rangee]);
        }
        byRangee[el.rangee].items.push(el);
      }
    });
    rows.forEach(function (row) {
      if (row.type === 'photos') row.items.sort(function (a, b) { return a.position - b.position; });
    });

    currentPlates = [];
    rows.forEach(function (row) {
      if (row.type !== 'photos') return;
      row.items.forEach(function (el) {
        currentPlates.push({ full: carnet.base + '/' + el.fichier });
      });
    });

    spreadsEl.innerHTML = '';
    var plateCursor = 0;
    rows.forEach(function (row) {
      if (row.type === 'titre') {
        var heading = document.createElement('h3');
        heading.className = 'section-title';
        heading.textContent = row.texte;
        spreadsEl.appendChild(heading);
        return;
      }

      var spread = document.createElement('div');
      spread.className = 'spread';
      spread.style.gridTemplateColumns = 'repeat(' + row.items.length + ', 1fr)';

      row.items.forEach(function (el) {
        var plateIndex = plateCursor++;
        var plate = document.createElement('figure');
        plate.className = 'plate';
        var img = document.createElement('img');
        img.loading = 'lazy';
        img.alt = '';
        img.src = carnet.base + '/' + el.miniature;
        img.dataset.full = carnet.base + '/' + el.fichier;
        plate.appendChild(img);
        plate.addEventListener('click', function () { openLightbox(plateIndex); });
        spread.appendChild(plate);
      });

      spreadsEl.appendChild(spread);
    });

    setupLazyLoad();
  }

  function setupLazyLoad() {
    var imgs = spreadsEl.querySelectorAll('img[data-full]');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            swapToFull(entry.target);
            obs.unobserve(entry.target);
          }
        });
      }, { rootMargin: '300px' });
      imgs.forEach(function (img) { io.observe(img); });
    }
  }

  function swapToFull(img) {
    var full = new Image();
    full.onload = function () { img.src = full.src; };
    full.src = img.getAttribute('data-full');
  }

  function openLightbox(index) {
    if (index < 0 || index >= currentPlates.length) return;
    lbIndex = index;
    showLightboxFrame();
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function showLightboxFrame() {
    lbImg.src = currentPlates[lbIndex].full;
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  lightbox.querySelector('.lb-close').addEventListener('click', closeLightbox);
  lightbox.querySelector('.lb-next').addEventListener('click', function () {
    lbIndex = (lbIndex + 1) % currentPlates.length; showLightboxFrame();
  });
  lightbox.querySelector('.lb-prev').addEventListener('click', function () {
    lbIndex = (lbIndex - 1 + currentPlates.length) % currentPlates.length; showLightboxFrame();
  });
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') { lbIndex = (lbIndex + 1) % currentPlates.length; showLightboxFrame(); }
    if (e.key === 'ArrowLeft') { lbIndex = (lbIndex - 1 + currentPlates.length) % currentPlates.length; showLightboxFrame(); }
  });

  // Glisser au doigt pour passer à l'image suivante/précédente (mobile).
  var touchStartX = 0, touchStartY = 0, touchActive = false;
  var SWIPE_THRESHOLD = 40; // px minimum pour compter comme un glissement volontaire

  lightbox.addEventListener('touchstart', function (e) {
    if (e.touches.length !== 1) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchActive = true;
  }, { passive: true });

  lightbox.addEventListener('touchend', function (e) {
    if (!touchActive) return;
    touchActive = false;
    var touch = e.changedTouches[0];
    var dx = touch.clientX - touchStartX;
    var dy = touch.clientY - touchStartY;
    // On ignore les glissements trop verticaux (l'utilisateur scrolle / ferme autrement)
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) {
      lbIndex = (lbIndex + 1) % currentPlates.length;
    } else {
      lbIndex = (lbIndex - 1 + currentPlates.length) % currentPlates.length;
    }
    showLightboxFrame();
  }, { passive: true });

  buildTiles();

  var hash = window.location.hash;
  if (hash.indexOf('#viewer') === 0 && CARNETS.length) {
    var wantedId = hash.indexOf(':') > -1 ? hash.split(':')[1] : null;
    var target = wantedId ? CARNETS.filter(function (c) { return c.id === wantedId; })[0] : CARNETS[0];
    openCarnet(target || CARNETS[0]);
  }
})();
