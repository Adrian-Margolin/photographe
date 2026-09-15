// sprite-chase.js — un petit photographe pixelisé qui court après le curseur.
// Deux feuilles séparées, une par sens de course (fournies telles quelles),
// chacune contenant le même dessin tourné vers la droite — celle de gauche
// est donc retournée en CSS pour regarder vers la gauche. Séparer les deux
// mouvements en deux fichiers réduit le risque d'erreur de découpe.

(function () {
  if (window.matchMedia && !window.matchMedia('(pointer: fine)').matches) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

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
  var frame = 0, frameTimer = 0;
  var facing = 'right';
  var trend = 0;
  var active = false;
  var lastMoveT = Date.now();
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
    lastMoveT = Date.now();
    if (!active) {
      active = true;
      el.classList.add('is-active');
    }
  });

  function render() {
    el.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    el.style.backgroundPosition = '-' + (frame * displayW) + 'px 0';
  }

  function loop() {
    requestAnimationFrame(loop);

    if (Date.now() - lastMoveT > 1500) {
      el.classList.remove('is-active');
      active = false;
      return;
    }

    var targetX = mouseX - displayW / 2;
    var targetY = mouseY - DISPLAY_H * 1.3;
    var dx = targetX - x;
    var dy = targetY - y;
    var dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 4) {
      var speed = Math.min(dist * 0.12, 14);
      x += (dx / (dist || 1)) * speed;
      y += (dy / (dist || 1)) * speed;

      frameTimer++;
      if (frameTimer > 9) {
        frameTimer = 0;
        frame = (frame + 1) % FRAMES;
      }
    } else {
      frame = 0;
    }

    render();
  }

  requestAnimationFrame(loop);
})();
