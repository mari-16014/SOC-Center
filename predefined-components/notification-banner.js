/* ============================================================
   NOTIFICATION BANNER — Predefined JavaScript
   Auto-creates the banner DOM, shows/hides with animation,
   auto-dismisses after configurable duration (default 5s).

   Figma Component: "Notification Banner"
   States: Inside Table | In Page Width Status Bar | Push Notification
   Styles: Success | Error | Info | Warning

   API:
     ElegantNotif.show(message, type, duration)
     ElegantNotif.hide()

   Types: 'success' | 'warning' | 'error' | 'info'
   Duration: ms (default 5000). Set 0 for persistent (manual close only).

   Icons: Figma-exported SVGs from assets/icons/ (Tier 1 ONLY).
     icon-notif-success.svg — green filled circle with white check
     icon-notif-error.svg   — red filled circle with white X
     icon-notif-info.svg    — blue filled circle with white i
     icon-notif-warning.svg — orange filled triangle with white !
     icon-notif-close.svg   — 10×10 grey X stroke
   ============================================================ */

var ElegantNotif = (function () {
  'use strict';

  var ICON_PATH = './assets/icons/';
  var ICONS = {
    success: ICON_PATH + 'icon-notif-success.svg',
    warning: ICON_PATH + 'icon-notif-warning.svg',
    error:   ICON_PATH + 'icon-notif-error.svg',
    info:    ICON_PATH + 'icon-notif-info.svg'
  };
  var CLOSE_ICON = ICON_PATH + 'icon-notif-close.svg';
  var DEFAULT_DURATION = 5000;
  var timer = null;
  var el = null;

  function ensureElement() {
    if (el) return el;
    el = document.createElement('div');
    el.className = 'notif-banner notif-banner--success';
    el.id = 'notifBanner';
    el.innerHTML =
      '<span class="notif-banner__icon"><img src="' + ICONS.success + '" alt="" /></span>' +
      '<span class="notif-banner__msg"></span>' +
      '<button class="notif-banner__close" aria-label="Close">' +
      '<img src="' + CLOSE_ICON + '" alt="" />' +
      '</button>';
    document.body.appendChild(el);

    el.querySelector('.notif-banner__close').addEventListener('click', function () {
      hide();
    });

    return el;
  }

  function positionBanner(banner) {
    var mc = document.querySelector('.main-content');
    if (mc) {
      var rect = mc.getBoundingClientRect();
      banner.style.left = (rect.left + rect.width / 2) + 'px';
      banner.style.top = (rect.top + 48) + 'px';
    }
  }

  function show(message, type, duration) {
    var banner = ensureElement();
    type = type || 'success';
    duration = duration !== undefined ? duration : DEFAULT_DURATION;

    if (timer) { clearTimeout(timer); timer = null; }

    banner.className = 'notif-banner notif-banner--' + type;
    banner.querySelector('.notif-banner__msg').textContent = message;
    banner.querySelector('.notif-banner__icon img').src = ICONS[type] || ICONS.success;

    positionBanner(banner);
    void banner.offsetWidth;
    banner.classList.add('notif-banner--visible');

    if (duration > 0) {
      timer = setTimeout(function () { hide(); }, duration);
    }
  }

  function hide() {
    if (!el) return;
    if (timer) { clearTimeout(timer); timer = null; }
    el.classList.remove('notif-banner--visible');
  }

  return { show: show, hide: hide };
})();
