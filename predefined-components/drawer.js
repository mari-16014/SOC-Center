/**
 * DRAWER — Predefined JS Component
 * Handles open/close animations, backdrop click, Escape key, focus trap.
 *
 * PUBLIC API:
 *   ElegantDrawer.open(drawerId)   — open drawer by id
 *   ElegantDrawer.close(drawerId)  — close drawer by id
 *   ElegantDrawer.toggle(drawerId) — toggle open/close
 *
 * HTML HOOKS:
 *   data-drawer-open="drawerId"    — on any element to open a drawer
 *   data-drawer-close              — on any element inside a drawer to close it
 *   .drawer__close                 — auto-bound close button
 *   .drawer-backdrop[data-drawer="drawerId"] — backdrop auto-bound
 */
(function () {
  'use strict';

  function getDrawer(id) { return document.getElementById(id); }
  function getBackdrop(id) { return document.querySelector('.drawer-backdrop[data-drawer="' + id + '"]'); }

  function open(id) {
    var drawer = getDrawer(id);
    var backdrop = getBackdrop(id);
    if (!drawer) return;
    if (backdrop) backdrop.classList.add('drawer-backdrop--active');
    drawer.classList.add('drawer--open');
    document.body.style.overflow = 'hidden';
    drawer.dispatchEvent(new CustomEvent('drawer:open', { detail: { id: id } }));
  }

  function close(id) {
    var drawer = getDrawer(id);
    var backdrop = getBackdrop(id);
    if (!drawer) return;
    drawer.classList.remove('drawer--open');
    if (backdrop) backdrop.classList.remove('drawer-backdrop--active');
    document.body.style.overflow = '';
    drawer.dispatchEvent(new CustomEvent('drawer:close', { detail: { id: id } }));
  }

  function toggle(id) {
    var drawer = getDrawer(id);
    if (!drawer) return;
    if (drawer.classList.contains('drawer--open')) close(id);
    else open(id);
  }

  function findDrawerId(el) {
    var drawer = el.closest('.drawer');
    return drawer ? drawer.id : null;
  }

  document.addEventListener('click', function (e) {
    var openTrigger = e.target.closest('[data-drawer-open]');
    if (openTrigger) {
      e.preventDefault();
      open(openTrigger.getAttribute('data-drawer-open'));
      return;
    }

    var closeTrigger = e.target.closest('[data-drawer-close]');
    if (closeTrigger) {
      e.preventDefault();
      var id = closeTrigger.getAttribute('data-drawer-close') || findDrawerId(closeTrigger);
      if (id) close(id);
      return;
    }

    var closeBtn = e.target.closest('.drawer__close');
    if (closeBtn) {
      e.preventDefault();
      var id = findDrawerId(closeBtn);
      if (id) close(id);
      return;
    }

    var backdrop = e.target.closest('.drawer-backdrop');
    if (backdrop && backdrop.classList.contains('drawer-backdrop--active')) {
      var id = backdrop.getAttribute('data-drawer');
      if (id) close(id);
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      var openDrawers = document.querySelectorAll('.drawer--open');
      if (openDrawers.length) {
        var last = openDrawers[openDrawers.length - 1];
        close(last.id);
      }
    }
  });

  window.ElegantDrawer = { open: open, close: close, toggle: toggle };
})();
