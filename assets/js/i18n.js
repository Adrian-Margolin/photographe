// i18n.js — bascule FR / EN, légère, sans dépendance.
//
// Marquage :
//   <p data-en="English text">Texte français</p>            -> contenu (innerHTML)
//   <input data-en-placeholder="English">  placeholder="Français"
//   <img data-en-alt="English" alt="Français">
//   <button data-en-aria-label="English" aria-label="Français">
//
// Pour du contenu généré en JS (séries, listes...), ajoute les mêmes
// attributs data-en / data-en-alt sur les éléments au moment de leur
// création, puis appelle window.applyI18n(window.siteLang(), conteneur)
// pour les traduire immédiatement s'ils sont ajoutés après le chargement.

(function () {
  var KEY = 'site-lang';

  function currentLang() {
    return localStorage.getItem(KEY) || 'fr';
  }

  function swapAttr(el, dataAttr, cacheAttr, realAttr, lang) {
    if (!(cacheAttr in el.dataset)) el.dataset[cacheAttr] = el.getAttribute(realAttr) || '';
    var en = el.dataset[dataAttr];
    el.setAttribute(realAttr, lang === 'en' && en != null ? en : el.dataset[cacheAttr]);
  }

  function applyI18n(lang, root) {
    root = root || document;
    lang = lang || currentLang();
    document.documentElement.lang = lang;
    document.documentElement.setAttribute('data-lang', lang);

    root.querySelectorAll('[data-en]').forEach(function (el) {
      if (!('frCache' in el.dataset)) el.dataset.frCache = el.innerHTML;
      el.innerHTML = lang === 'en' ? el.dataset.en : el.dataset.frCache;
    });

    root.querySelectorAll('[data-en-placeholder]').forEach(function (el) {
      swapAttr(el, 'enPlaceholder', 'frPlaceholder', 'placeholder', lang);
    });
    root.querySelectorAll('[data-en-alt]').forEach(function (el) {
      swapAttr(el, 'enAlt', 'frAlt', 'alt', lang);
    });
    root.querySelectorAll('[data-en-aria-label]').forEach(function (el) {
      swapAttr(el, 'enAriaLabel', 'frAriaLabel', 'aria-label', lang);
    });

    document.querySelectorAll('[data-lang-btn]').forEach(function (btn) {
      var active = btn.getAttribute('data-lang-btn') === lang;
      btn.classList.toggle('is-active', active);
    });
  }

  window.applyI18n = applyI18n;
  window.siteLang = currentLang;

  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('[data-lang-btn]');
    if (!btn) return;
    var lang = btn.getAttribute('data-lang-btn');
    localStorage.setItem(KEY, lang);
    applyI18n(lang);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { applyI18n(currentLang()); });
  } else {
    applyI18n(currentLang());
  }
})();
