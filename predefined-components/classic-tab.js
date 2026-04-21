/* ============================================================
   CLASSIC TAB — Predefined JavaScript
   Handles tab switching for the classic-tab component.
   Include via: <script src="../predefined-components/classic-tab.js"></script>
   ============================================================ */

(function () {
  'use strict';

  function initClassicTabs() {
    document.querySelectorAll('.classic-tab').forEach(function (tabGroup) {
      var headersWrap = tabGroup.querySelector('.classic-tab__headers');
      if (!headersWrap) return;
      var headers = headersWrap.querySelectorAll(':scope > .classic-tab__header');
      var bodyWrap = tabGroup.querySelector(':scope > .classic-tab__body');
      var panels = bodyWrap ? bodyWrap.querySelectorAll(':scope > .classic-tab__content') : [];

      headers.forEach(function (header, index) {
        header.addEventListener('click', function () {
          if (header.hasAttribute('data-no-switch')) return;
          headers.forEach(function (h) {
            h.classList.remove('classic-tab__header--selected');
            h.classList.add('classic-tab__header--unselected');
          });

          header.classList.remove('classic-tab__header--unselected');
          header.classList.add('classic-tab__header--selected');

          panels.forEach(function (panel, i) {
            panel.style.display = (i === index) ? '' : 'none';
          });
        });
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initClassicTabs);
  } else {
    initClassicTabs();
  }
})();
