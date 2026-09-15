// main.js — comportements partagés par toutes les pages

(function () {
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  var backBtn = document.getElementById('back-to-top');
  if (backBtn) {
    var toggleVisible = function () {
      if (window.scrollY > 400) backBtn.classList.add('is-visible');
      else backBtn.classList.remove('is-visible');
    };
    toggleVisible();
    window.addEventListener('scroll', toggleVisible, { passive: true });
    backBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();
