/* ============================================================
   SIDEMENU — Predefined JavaScript
   Reads data-active-item from <aside class="sidemenu"> and
   auto-activates the matching item + expands its parent section.
   Handles: desktop collapse/expand, mobile/tablet overlay drawer,
   section toggle, click highlight, and search filtering.

   Include via: <script src="../predefined-components/sidemenu.js"></script>
   ============================================================ */

(function () {
  'use strict';

  var CHEVRON_DOWN  = './assets/icons/icon-sm-chevron-down.svg';
  var CHEVRON_RIGHT = './assets/icons/icon-sm-chevron-right.svg';
  var TABLET_BREAKPOINT = 1024;

  function isOverlayMode() {
    return window.innerWidth <= TABLET_BREAKPOINT;
  }

  /* ── Read data-active-item and set the active menu item ── */
  function initActiveFromData() {
    var sidebar = document.querySelector('.sidemenu');
    if (!sidebar) return;

    var activeItemName = sidebar.getAttribute('data-active-item');
    if (!activeItemName) return;

    var items = sidebar.querySelectorAll('.sidemenu__item');
    items.forEach(function (item) {
      if (item.textContent.trim() === activeItemName) {
        item.classList.add('sidemenu__item--active');
      } else {
        item.classList.remove('sidemenu__item--active');
      }
    });
  }

  /* ── Auto-expand the section that contains the active item ── */
  function initAutoExpand() {
    var active = document.querySelector('.sidemenu__item--active');
    if (!active) return;

    var section = active.closest('.sidemenu__section');
    if (!section) return;

    var chevron  = section.querySelector('.sidemenu__chevron');
    var children = section.querySelectorAll(
      '.sidemenu__l2-subheader, .sidemenu__item'
    );

    children.forEach(function (el) { el.style.display = ''; });
    if (chevron) chevron.src = CHEVRON_DOWN;
  }

  /* ── Collapse / Expand sidebar (desktop + overlay close) ── */
  function initSidebarToggle() {
    var sidebar    = document.querySelector('.sidemenu');
    var collapseBtn = document.querySelector('.sidemenu__bottom-btn');
    var expandBtn  = document.getElementById('sidebarExpand');
    var backdrop   = document.querySelector('.sidemenu-backdrop');

    if (!sidebar || !collapseBtn || !expandBtn) return;

    function closeOverlay() {
      sidebar.classList.remove('sidemenu--overlay-open');
      if (backdrop) backdrop.classList.remove('sidemenu-backdrop--visible');
      document.body.style.overflow = '';
    }

    function collapse() {
      if (isOverlayMode()) {
        closeOverlay();
      }
      sidebar.classList.add('sidemenu--collapsed');
      expandBtn.classList.add('sidemenu-expand--visible');
      collapseBtn.title = 'Expand sidebar';
    }

    function expand() {
      sidebar.classList.remove('sidemenu--collapsed');
      expandBtn.classList.remove('sidemenu-expand--visible');
      collapseBtn.title = 'Collapse sidebar';
    }

    collapseBtn.addEventListener('click', function () {
      if (sidebar.classList.contains('sidemenu--collapsed')) {
        expand();
      } else {
        collapse();
      }
    });

    expandBtn.addEventListener('click', expand);
  }

  /* ── Mobile/Tablet: overlay drawer toggle ── */
  function initOverlayDrawer() {
    var sidebar  = document.querySelector('.sidemenu');
    var backdrop = document.querySelector('.sidemenu-backdrop');
    var hamburger = document.querySelector('.topnavbar__hamburger');

    if (!sidebar || !backdrop || !hamburger) return;

    function openDrawer() {
      sidebar.classList.add('sidemenu--overlay-open');
      backdrop.classList.add('sidemenu-backdrop--visible');
      document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
      sidebar.classList.remove('sidemenu--overlay-open');
      backdrop.classList.remove('sidemenu-backdrop--visible');
      document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', function () {
      if (sidebar.classList.contains('sidemenu--overlay-open')) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });

    backdrop.addEventListener('click', closeDrawer);

    window.addEventListener('resize', function () {
      if (!isOverlayMode() && sidebar.classList.contains('sidemenu--overlay-open')) {
        closeDrawer();
      }
    });
  }

  /* ── L1 Section Expand / Collapse (skip --flat, handled by initFlatAccordion) ── */
  function initSectionToggle() {
    document.querySelectorAll('.sidemenu__l1:not(.sidemenu__l1--flat)').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var section  = btn.closest('.sidemenu__section');
        var chevron  = btn.querySelector('.sidemenu__chevron');
        var children = section.querySelectorAll(
          '.sidemenu__l2-subheader, .sidemenu__item'
        );

        var isOpen = children.length > 0 && children[0].style.display !== 'none';

        children.forEach(function (el) {
          el.style.display = isOpen ? 'none' : '';
        });

        if (chevron) {
          chevron.src = isOpen ? CHEVRON_RIGHT : CHEVRON_DOWN;
        }
      });
    });
  }

  /* ── Active Item Highlight on click ── */
  function initActiveItem() {
    var sidebar = document.querySelector('.sidemenu');

    document.querySelectorAll('.sidemenu__item').forEach(function (item) {
      item.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelectorAll('.sidemenu__item--active').forEach(function (el) {
          el.classList.remove('sidemenu__item--active');
        });
        item.classList.add('sidemenu__item--active');

        if (sidebar) {
          sidebar.setAttribute('data-active-item', item.textContent.trim());
        }
      });
    });
  }

  /* ── Search Filter ── */
  function initSearchFilter() {
    var input = document.querySelector('.sidemenu__search input');
    if (!input) return;

    input.addEventListener('input', function () {
      var query = input.value.toLowerCase().trim();

      document.querySelectorAll('.sidemenu__item').forEach(function (item) {
        var text = item.textContent.toLowerCase();
        item.style.display = (!query || text.includes(query)) ? '' : 'none';
      });
    });
  }

  /* ── Type 2: OS Dropdown toggle ── */
  function initOsDropdown() {
    document.querySelectorAll('.sidemenu__os-dropdown').forEach(function (dd) {
      var opts = dd.querySelector('.sidemenu__os-options');
      if (!opts) return;

      dd.addEventListener('click', function (e) {
        e.stopPropagation();
        opts.classList.toggle('sidemenu__os-options--open');
      });

      opts.querySelectorAll('.sidemenu__os-option').forEach(function (opt) {
        opt.addEventListener('click', function (e) {
          e.stopPropagation();
          var osLabel = dd.querySelector('.sidemenu__os-label');
          var osIcon  = dd.querySelector('.sidemenu__os-icon');
          if (osLabel) osLabel.textContent = opt.getAttribute('data-label');
          if (osIcon && opt.getAttribute('data-icon')) osIcon.src = opt.getAttribute('data-icon');
          opts.classList.remove('sidemenu__os-options--open');
        });
      });

      document.addEventListener('click', function () {
        opts.classList.remove('sidemenu__os-options--open');
      });
    });
  }

  /* ── Type 2: Flat L1 accordion toggle ── */
  function initFlatAccordion() {
    document.querySelectorAll('.sidemenu--type2 .sidemenu__l1--flat').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var section = btn.closest('.sidemenu__section');
        var chevron = btn.querySelector('.sidemenu__chevron');
        var children = section.querySelectorAll('.sidemenu__item');
        if (children.length === 0) return;
        var isOpen = children[0].style.display !== 'none';

        children.forEach(function (el) {
          el.style.display = isOpen ? 'none' : '';
        });
        if (chevron) {
          chevron.src = isOpen ? CHEVRON_RIGHT : CHEVRON_DOWN;
        }
      });
    });
  }

  /* ── Type 2: Active L1 from data-active-item ── */
  function initType2Active() {
    document.querySelectorAll('.sidemenu--type2').forEach(function (sidebar) {
      var activeItemName = sidebar.getAttribute('data-active-item');
      if (!activeItemName) return;

      sidebar.querySelectorAll('.sidemenu__l1--flat').forEach(function (btn) {
        var span = btn.querySelector('span');
        if (span && span.textContent.trim() === activeItemName) {
          btn.classList.add('sidemenu__l1--active');
          var section = btn.closest('.sidemenu__section');
          var chevron = btn.querySelector('.sidemenu__chevron');
          var children = section.querySelectorAll('.sidemenu__item');
          children.forEach(function (el) { el.style.display = ''; });
          if (chevron) chevron.src = CHEVRON_DOWN;
        }
      });

      sidebar.querySelectorAll('.sidemenu__item').forEach(function (item) {
        if (item.textContent.trim() === activeItemName) {
          item.classList.add('sidemenu__item--active');
          var section = item.closest('.sidemenu__section');
          if (section) {
            var chevron = section.querySelector('.sidemenu__chevron');
            var children = section.querySelectorAll('.sidemenu__item');
            children.forEach(function (el) { el.style.display = ''; });
            if (chevron) chevron.src = CHEVRON_DOWN;
          }
        }
      });
    });
  }

  /* ── Type 2: Click highlight for flat L1 items ── */
  function initType2ClickHighlight() {
    document.querySelectorAll('.sidemenu--type2 .sidemenu__l1--flat').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var sidebar = btn.closest('.sidemenu--type2');
        sidebar.querySelectorAll('.sidemenu__l1--active').forEach(function (el) {
          el.classList.remove('sidemenu__l1--active');
        });
        sidebar.querySelectorAll('.sidemenu__item--active').forEach(function (el) {
          el.classList.remove('sidemenu__item--active');
        });
      });
    });

    document.querySelectorAll('.sidemenu--type2 .sidemenu__item').forEach(function (item) {
      item.addEventListener('click', function (e) {
        e.preventDefault();
        var sidebar = item.closest('.sidemenu--type2');
        sidebar.querySelectorAll('.sidemenu__item--active').forEach(function (el) {
          el.classList.remove('sidemenu__item--active');
        });
        sidebar.querySelectorAll('.sidemenu__l1--active').forEach(function (el) {
          el.classList.remove('sidemenu__l1--active');
        });
        item.classList.add('sidemenu__item--active');
      });
    });
  }

  /* ── Type 2: Search filter for flat items ── */
  function initType2Search() {
    document.querySelectorAll('.sidemenu--type2 .sidemenu__search input').forEach(function (input) {
      input.addEventListener('input', function () {
        var query = input.value.toLowerCase().trim();
        var sidebar = input.closest('.sidemenu--type2');
        sidebar.querySelectorAll('.sidemenu__section').forEach(function (section) {
          var l1 = section.querySelector('.sidemenu__l1--flat');
          var items = section.querySelectorAll('.sidemenu__item');
          var l1Text = l1 ? l1.textContent.toLowerCase() : '';
          var anyVisible = false;

          if (!query) {
            if (l1) l1.style.display = '';
            items.forEach(function (it) { it.style.display = 'none'; });
            return;
          }

          if (l1Text.includes(query)) {
            if (l1) l1.style.display = '';
            anyVisible = true;
          }

          items.forEach(function (it) {
            if (it.textContent.toLowerCase().includes(query)) {
              it.style.display = '';
              anyVisible = true;
            } else {
              it.style.display = 'none';
            }
          });

          if (l1) l1.style.display = anyVisible ? '' : 'none';
        });
      });
    });
  }

  /* ── Bootstrap ── */
  function init() {
    initActiveFromData();
    initAutoExpand();
    initSidebarToggle();
    initOverlayDrawer();
    initSectionToggle();
    initActiveItem();
    initSearchFilter();
    initOsDropdown();
    initFlatAccordion();
    initType2Active();
    initType2ClickHighlight();
    initType2Search();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
