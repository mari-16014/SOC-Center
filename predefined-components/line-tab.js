/**
 * LINE TAB — Tab switching behavior
 * Captured from Figma Elegant Components 1.0
 *
 * Handles:
 *   - Click tab header → switch selected state + show/hide body panels
 *   - data-tab on headers maps to data-tab-content on body panels
 *   - Supports multiple independent line-tab groups on the same page
 *   - QuickLink variant works identically (same JS)
 *
 * Usage:
 *   Include this script AFTER the line-tab HTML.
 *   Tab headers need data-tab="id" attribute.
 *   Body panels need data-tab-content="id" attribute.
 *   The .line-tab__body must immediately follow the .line-tab container.
 */
(function () {
  'use strict';

  function initLineTab(tabContainer) {
    var headersWrap = tabContainer.querySelector('.line-tab__headers');
    var headers = headersWrap ? headersWrap.querySelectorAll(':scope > .line-tab__header') : tabContainer.querySelectorAll('.line-tab__header');
    var body = tabContainer.nextElementSibling;

    if (!body || !body.classList.contains('line-tab__body')) return;

    var panels = body.querySelectorAll(':scope > .line-tab__content');
    var isQuicklink = tabContainer.classList.contains('line-tab--quicklink');

    headers.forEach(function (header) {
      header.addEventListener('click', function () {
        var tabId = this.getAttribute('data-tab');
        if (!tabId) return;

        headers.forEach(function (h) {
          h.classList.remove('line-tab__header--selected');
          if (isQuicklink) {
            h.classList.remove('line-tab__header--active');
          }
          h.classList.add('line-tab__header--unselected');
        });

        this.classList.remove('line-tab__header--unselected');
        this.classList.add('line-tab__header--selected');

        panels.forEach(function (panel) {
          if (panel.getAttribute('data-tab-content') === tabId) {
            panel.classList.add('line-tab__content--active');
          } else {
            panel.classList.remove('line-tab__content--active');
          }
        });

        tabContainer.dispatchEvent(new CustomEvent('linetab:change', {
          bubbles: true,
          detail: { tabId: tabId, header: this }
        }));
      });
    });
  }

  function initAll() {
    document.querySelectorAll('.line-tab').forEach(initLineTab);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
