// transition.js — simple fondu entre les pages : la page s'estompe au clic
// sur un lien interne, puis la navigation a lieu ; la page suivante
// apparaît en fondu à son chargement. Fiable et fluide sur toutes les
// pages, sans effet de mise en page qui saute.

(function () {
  var REDUCE = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DURATION = 220;
  var navigating = false;

  document.documentElement.classList.add('fade-ready');

  if (!REDUCE) {
    requestAnimationFrame(function () {
      document.documentElement.classList.add('fade-in');
    });
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#') return;
    if (a.target === '_blank') return;
    if (href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0) return;
    if (a.hostname && a.hostname !== window.location.hostname) return;
    if (navigating) { e.preventDefault(); return; }

    document.dispatchEvent(new CustomEvent('page:leaving', { detail: { href: href } }));

    if (REDUCE) return; // navigation normale, instantanée

    e.preventDefault();
    navigating = true;
    document.documentElement.classList.remove('fade-in');
    document.documentElement.classList.add('fade-out');
    window.setTimeout(function () {
      window.location.href = href;
    }, DURATION);
  }, true);
})();
