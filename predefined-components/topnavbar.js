/* ============================================================
   TOPNAVBAR — Predefined JavaScript
   Priority+ Navigation: shows as many tabs as fit, always
   keeps the active tab visible, overflows the rest to "...".
   On desktop (>1024px) all tabs are visible, no overflow.

   Include via: <script src="../predefined-components/topnavbar.js"></script>
   ============================================================ */

(function () {
  'use strict';

  var DESKTOP_BREAKPOINT = 1024;
  var MORE_BTN_WIDTH = 38;
  var _resizeTimer = null;

  /* ── Set data-active-tab and apply classes ── */
  function setActiveTab(name) {
    var header = document.querySelector('.topnavbar');
    var tabs   = document.querySelectorAll('.topnavbar__tab');

    tabs.forEach(function (t) {
      if (t.textContent.trim() === name) {
        t.classList.remove('topnavbar__tab--unselected');
        t.classList.add('topnavbar__tab--selected');
      } else {
        t.classList.remove('topnavbar__tab--selected');
        t.classList.add('topnavbar__tab--unselected');
      }
    });

    if (header) header.setAttribute('data-active-tab', name);

    syncBottomSheetActive(name);
    computeOverflow();
  }

  /* ── Apply data-active-tab on load ── */
  function initNavTabs() {
    var header = document.querySelector('.topnavbar');
    var tabs   = document.querySelectorAll('.topnavbar__tab');
    if (!header || !tabs.length) return;

    var activeTabName = header.getAttribute('data-active-tab');
    if (activeTabName) {
      tabs.forEach(function (tab) {
        if (tab.textContent.trim() === activeTabName) {
          tab.classList.remove('topnavbar__tab--unselected');
          tab.classList.add('topnavbar__tab--selected');
        } else {
          tab.classList.remove('topnavbar__tab--selected');
          tab.classList.add('topnavbar__tab--unselected');
        }
      });
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function (e) {
        e.preventDefault();
        setActiveTab(tab.textContent.trim());
      });
    });
  }

  /* ══════════════════════════════════════════════════════════
     PRIORITY+ OVERFLOW ENGINE
     Measures which tabs fit in the available space.
     Active tab is always guaranteed visible.
     Overflowed tabs get .topnavbar__tab--overflow class.
     "..." button appears only when there are hidden tabs.
     ══════════════════════════════════════════════════════════ */
  function computeOverflow() {
    var tabsContainer = document.querySelector('.topnavbar__tabs');
    var moreBtn       = document.querySelector('.topnavbar__more');
    var tabs          = document.querySelectorAll('.topnavbar__tab');
    var header        = document.querySelector('.topnavbar');
    if (!tabsContainer || !tabs.length) return;

    var isDesktop = window.innerWidth > DESKTOP_BREAKPOINT;

    if (isDesktop) {
      tabs.forEach(function (t) { t.classList.remove('topnavbar__tab--overflow'); });
      if (moreBtn) moreBtn.classList.remove('topnavbar__more--visible');
      syncBottomSheet([]);
      return;
    }

    var activeTabName = header ? header.getAttribute('data-active-tab') : '';

    tabs.forEach(function (t) { t.classList.remove('topnavbar__tab--overflow'); });

    var containerWidth = tabsContainer.offsetWidth;
    var budgetWithMore = containerWidth - MORE_BTN_WIDTH;
    var budgetNoMore   = containerWidth;

    var tabWidths = [];
    tabs.forEach(function (t) {
      tabWidths.push({ el: t, width: t.offsetWidth, name: t.textContent.trim() });
    });

    var usedWidth = 0;
    var fitsCount = 0;
    for (var i = 0; i < tabWidths.length; i++) {
      if (usedWidth + tabWidths[i].width <= budgetNoMore) {
        usedWidth += tabWidths[i].width;
        fitsCount++;
      } else {
        break;
      }
    }

    if (fitsCount === tabWidths.length) {
      if (moreBtn) moreBtn.classList.remove('topnavbar__more--visible');
      syncBottomSheet([]);
      return;
    }

    usedWidth = 0;
    var visibleSet = [];
    var overflowSet = [];

    for (var j = 0; j < tabWidths.length; j++) {
      if (usedWidth + tabWidths[j].width <= budgetWithMore) {
        usedWidth += tabWidths[j].width;
        visibleSet.push(tabWidths[j]);
      } else {
        overflowSet.push(tabWidths[j]);
      }
    }

    var activeInVisible = visibleSet.some(function (v) { return v.name === activeTabName; });

    if (!activeInVisible) {
      var activeEntry = null;
      var newOverflow = [];
      overflowSet.forEach(function (o) {
        if (o.name === activeTabName) {
          activeEntry = o;
        } else {
          newOverflow.push(o);
        }
      });

      if (activeEntry) {
        while (visibleSet.length > 0 && usedWidth + activeEntry.width > budgetWithMore) {
          var removed = visibleSet.pop();
          usedWidth -= removed.width;
          newOverflow.unshift(removed);
        }
        visibleSet.push(activeEntry);
        overflowSet = newOverflow;
      }
    }

    var overflowNames = overflowSet.map(function (o) { return o.name; });

    tabs.forEach(function (t) {
      var tName = t.textContent.trim();
      if (overflowNames.indexOf(tName) !== -1) {
        t.classList.add('topnavbar__tab--overflow');
      } else {
        t.classList.remove('topnavbar__tab--overflow');
      }
    });

    if (moreBtn) {
      if (overflowNames.length > 0) {
        moreBtn.classList.add('topnavbar__more--visible');
      } else {
        moreBtn.classList.remove('topnavbar__more--visible');
      }
    }

    syncBottomSheet(overflowNames);
  }

  /* ── Sync bottom sheet: show only overflowed tabs ── */
  function syncBottomSheet(overflowNames) {
    var items = document.querySelectorAll('.nav-bottom-sheet__item');
    items.forEach(function (item) {
      var li = item.closest('li');
      var tabName = item.getAttribute('data-tab');
      if (overflowNames.length === 0) {
        if (li) li.style.display = '';
        return;
      }
      if (overflowNames.indexOf(tabName) !== -1) {
        if (li) li.style.display = '';
      } else {
        if (li) li.style.display = 'none';
      }
    });
  }

  function syncBottomSheetActive(activeTabName) {
    var items = document.querySelectorAll('.nav-bottom-sheet__item');
    items.forEach(function (item) {
      if (item.getAttribute('data-tab') === activeTabName) {
        item.classList.add('nav-bottom-sheet__item--active');
      } else {
        item.classList.remove('nav-bottom-sheet__item--active');
      }
    });
  }

  /* ── Bottom Sheet open/close ── */
  function initBottomSheet() {
    var moreBtn  = document.querySelector('.topnavbar__more');
    var sheet    = document.getElementById('navBottomSheet');
    if (!moreBtn || !sheet) return;

    var backdrop = sheet.querySelector('.nav-bottom-sheet__backdrop');
    var items    = sheet.querySelectorAll('.nav-bottom-sheet__item');
    var header   = document.querySelector('.topnavbar');

    function openSheet() {
      var activeTabName = header ? header.getAttribute('data-active-tab') : '';
      syncBottomSheetActive(activeTabName);
      sheet.classList.add('nav-bottom-sheet--open');
      document.body.style.overflow = 'hidden';
    }

    function closeSheet() {
      sheet.classList.remove('nav-bottom-sheet--open');
      document.body.style.overflow = '';
    }

    moreBtn.addEventListener('click', function () {
      if (sheet.classList.contains('nav-bottom-sheet--open')) {
        closeSheet();
      } else {
        openSheet();
      }
    });

    if (backdrop) {
      backdrop.addEventListener('click', closeSheet);
    }

    items.forEach(function (item) {
      item.addEventListener('click', function () {
        var tabName = item.getAttribute('data-tab');
        setActiveTab(tabName);
        closeSheet();
      });
    });
  }

  /* ── Resize handler: debounced recompute ── */
  function onResize() {
    clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(computeOverflow, 80);
  }

  /* ── Bootstrap ── */
  function init() {
    initNavTabs();
    initBottomSheet();
    computeOverflow();
    window.addEventListener('resize', onResize);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
