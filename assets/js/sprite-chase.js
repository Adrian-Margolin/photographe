// sprite-chase.js — un petit photographe pixelisé qui court après le curseur.
// Deux feuilles séparées, une par sens de course (fournies telles quelles),
// chacune contenant le même dessin tourné vers la droite — celle de gauche
// est donc retournée en CSS pour regarder vers la gauche. Séparer les deux
// mouvements en deux fichiers réduit le risque d'erreur de découpe.
//
// Comportement :
//  - il court vers le curseur à vitesse CONSTANTE (il peut donc mettre du
//    temps à l'atteindre si le curseur est loin) ;
//  - quand le curseur s'arrête, il s'immobilise sur place, dans la pose où
//    il se trouve (sans revenir à la pose initiale), puis disparaît ;
//  - si la souris bouge de nouveau avant ou après sa disparition, il
//    reprend sa course.

(function () {
  if (window.matchMedia && !window.matchMedia('(pointer: fine)').matches) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // ---- Réglages ----------------------------------------------------------
  var SPEED = 320;            // vitesse de course, en pixels par seconde (constante)
  var FRAME_MS = 150;         // durée d'une image de la foulée, en millisecondes
  var STOP_AFTER_MS = 120;    // le curseur est « à l'arrêt » après ce délai sans mouvement
  var HIDE_AFTER_MS = 1200;   // délai entre l'immobilisation du personnage et sa disparition
  var FREEZE_ON_STOP = true;  // true : il s'arrête dès que le curseur s'arrête, même loin
                              // false : il finit d'abord sa course jusqu'au curseur, puis s'arrête
  var ARRIVE_DIST = 4;        // distance (px) à partir de laquelle il est « arrivé »
  // ------------------------------------------------------------------------

  var FRAME_W = 210;
  var FRAME_H = { right: 224, left: 224 };
  var FRAMES = 6;
  var DISPLAY_H = 67;
  var FLIP_THRESHOLD = 10;

  var SHEETS = {
    right: 'assets/img/sprite-droite.png',
    left: 'assets/img/sprite-gauche.png'
  };

  var el = document.createElement('div');
  el.id = 'cursor-chaser';
  document.body.appendChild(el);

  function applySheet(dir) {
    var h = FRAME_H[dir];
    var displayW = Math.round(FRAME_W * (DISPLAY_H / h));
    el.style.width = displayW + 'px';
    el.style.height = DISPLAY_H + 'px';
    el.style.backgroundImage = 'url(' + SHEETS[dir] + ')';
    el.style.backgroundSize = (displayW * FRAMES) + 'px ' + DISPLAY_H + 'px';
    return displayW;
  }

  var mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  var lastMouseX = mouseX;
  var x = mouseX, y = mouseY;
  var frame = 0, frameAcc = 0;
  var facing = 'right';
  var trend = 0;
  var active = false;
  var lastMoveT = performance.now();
  var stoppedAt = null;       // instant où le personnage s'est immobilisé (null = en course)
  var lastT = performance.now();
  var displayW = applySheet('right');

  document.addEventListener('mousemove', function (e) {
    var dxMouse = e.clientX - lastMouseX;
    lastMouseX = e.clientX;

    if ((dxMouse > 0 && trend < 0) || (dxMouse < 0 && trend > 0)) {
      trend = dxMouse;
    } else {
      trend += dxMouse;
    }
    var newFacing = facing;
    if (trend > FLIP_THRESHOLD) newFacing = 'left';
    else if (trend < -FLIP_THRESHOLD) newFacing = 'right';
    if (newFacing !== facing) {
      facing = newFacing;
      displayW = applySheet(facing);
    }

    mouseX = e.clientX; mouseY = e.clientY;
    lastMoveT = performance.now();
    stoppedAt = null;
    if (!active) {
      active = true;
      el.classList.add('is-active');
    }
  });

  function render() {
    el.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    el.style.backgroundPosition = '-' + (frame * displayW) + 'px 0';
  }

  function loop(now) {
    requestAnimationFrame(loop);
    var dt = Math.min(now - lastT, 50); // plafonné : pas de saut si l'onglet était en veille
    lastT = now;
    if (!active) return;

    var cursorStopped = (now - lastMoveT) > STOP_AFTER_MS;
    var running = false;

    // Si FREEZE_ON_STOP, il ne bouge plus dès que le curseur est à l'arrêt.
    if (!(FREEZE_ON_STOP && cursorStopped)) {
      var dx = (mouseX - displayW / 2) - x;
      var dy = (mouseY - DISPLAY_H * 1.3) - y;
      var dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > ARRIVE_DIST) {
        // vitesse constante, sans dépasser le curseur
        var step = Math.min(SPEED * dt / 1000, dist - ARRIVE_DIST);
        x += (dx / dist) * step;
        y += (dy / dist) * step;
        running = true;

        frameAcc += dt;
        while (frameAcc >= FRAME_MS) {
          frameAcc -= FRAME_MS;
          frame = (frame + 1) % FRAMES;
        }
      }
    }

    if (running) {
      stoppedAt = null;
    } else {
      // Immobile : on garde la pose actuelle (pas de retour à la pose initiale),
      // puis on le fait disparaître.
      if (stoppedAt === null) stoppedAt = now;
      if (cursorStopped && now - stoppedAt > HIDE_AFTER_MS) {
        el.classList.remove('is-active');
        active = false;
      }
    }

    render();
  }

  requestAnimationFrame(loop);
})();
