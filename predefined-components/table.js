/* ============================================================
   TABLE — Predefined JavaScript
   Checkbox selection (3-state), row highlight, actionbar refresh.
   Include via: <script src="../predefined-components/table.js"></script>
   ============================================================ */

(function () {
  'use strict';

  /* ── SVG templates for the 3 checkbox states (from Figma Elegant 1.0) ── */
  var SVG_UNCHECKED =
    '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<rect x="0.5" y="0.5" width="15" height="15" rx="1.5" fill="white" stroke="#ABABAB"/>' +
    '</svg>';

  var SVG_CHECKED =
    '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<path fill-rule="evenodd" clip-rule="evenodd" d="M2 0C0.895431 0 0 0.895431 0 2V14C0 15.1046 0.895431 16 2 16H14C15.1046 16 16 15.1046 16 14V2C16 0.895431 15.1046 0 14 0H2Z" fill="#2C66DD"/>' +
    '<path d="M12 5.5L6.5 10.5L4 8.22727" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>';

  var SVG_INDETERMINATE =
    '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<rect x="0.5" y="0.5" width="15" height="15" rx="1.5" fill="white" stroke="#2C66DD"/>' +
    '<rect x="4" y="7" width="8" height="1.5" rx="0.75" fill="#2C66DD"/>' +
    '</svg>';

  /* ── Checkbox State Machine ── */

  function setCheckboxState(cell, state) {
    if (!cell) return;
    cell.setAttribute('data-checked', state);
    if (state === 'checked') {
      cell.innerHTML = SVG_CHECKED;
    } else if (state === 'indeterminate') {
      cell.innerHTML = SVG_INDETERMINATE;
    } else {
      cell.innerHTML = SVG_UNCHECKED;
    }
  }

  function getCheckboxState(cell) {
    return cell ? (cell.getAttribute('data-checked') || 'unchecked') : 'unchecked';
  }

  function isRowChecked(row) {
    var cb = row.querySelector('.cell-checkbox');
    return cb && getCheckboxState(cb) === 'checked';
  }

  /* ── Header ↔ Body sync ── */

  function syncHeaderCheckbox(table) {
    var headerCb = table.querySelector('thead .cell-checkbox');
    var bodyRows = table.querySelectorAll('tbody tr');
    if (!headerCb || bodyRows.length === 0) return;

    var total = 0;
    var checked = 0;
    bodyRows.forEach(function (row) {
      var cb = row.querySelector('.cell-checkbox');
      if (cb) {
        total++;
        if (getCheckboxState(cb) === 'checked') checked++;
      }
    });

    if (checked === 0) {
      setCheckboxState(headerCb, 'unchecked');
    } else if (checked === total) {
      setCheckboxState(headerCb, 'checked');
    } else {
      setCheckboxState(headerCb, 'indeterminate');
    }
  }

  function updateRowHighlight(row) {
    if (isRowChecked(row)) {
      row.classList.add('data-table__row--selected');
    } else {
      row.classList.remove('data-table__row--selected');
    }
  }

  /* ── Initialise checkbox interactions per table ── */

  function initCheckboxes() {
    document.querySelectorAll('.data-table').forEach(function (table) {
      var headerCb = table.querySelector('thead .cell-checkbox');
      var bodyRows = table.querySelectorAll('tbody tr');

      // Replace existing <img> checkboxes with inline SVG (unchecked default)
      table.querySelectorAll('.cell-checkbox').forEach(function (cell) {
        setCheckboxState(cell, 'unchecked');
        cell.style.cursor = 'pointer';
      });

      // Header checkbox: click → select all / deselect all
      if (headerCb) {
        headerCb.addEventListener('click', function (e) {
          e.stopPropagation();
          var currentState = getCheckboxState(headerCb);
          var newRowState = (currentState === 'checked') ? 'unchecked' : 'checked';

          bodyRows.forEach(function (row) {
            var cb = row.querySelector('.cell-checkbox');
            if (cb) {
              setCheckboxState(cb, newRowState);
              updateRowHighlight(row);
            }
          });

          setCheckboxState(headerCb, newRowState === 'checked' ? 'checked' : 'unchecked');
          fireSelectionChange(table);
        });
      }

      // Body row checkboxes: individual toggle
      bodyRows.forEach(function (row) {
        var cb = row.querySelector('.cell-checkbox');
        if (!cb) return;

        cb.addEventListener('click', function (e) {
          e.stopPropagation();
          var current = getCheckboxState(cb);
          var next = (current === 'checked') ? 'unchecked' : 'checked';
          setCheckboxState(cb, next);
          updateRowHighlight(row);
          syncHeaderCheckbox(table);
          fireSelectionChange(table);
        });
      });
    });
  }

  /* ── Selection change custom event ── */

  function fireSelectionChange(table) {
    var selected = [];
    table.querySelectorAll('tbody tr').forEach(function (row, i) {
      if (isRowChecked(row)) selected.push(i);
    });
    table.dispatchEvent(new CustomEvent('table:selectionchange', {
      detail: { selectedIndices: selected, count: selected.length },
      bubbles: true
    }));
  }

  /* ── Public API: get selected rows ── */

  window.TableCheckbox = {
    getSelectedRows: function (tableEl) {
      var rows = [];
      if (!tableEl) return rows;
      tableEl.querySelectorAll('tbody tr').forEach(function (row) {
        if (isRowChecked(row)) rows.push(row);
      });
      return rows;
    },
    getSelectedCount: function (tableEl) {
      if (!tableEl) return 0;
      var count = 0;
      tableEl.querySelectorAll('tbody tr').forEach(function (row) {
        if (isRowChecked(row)) count++;
      });
      return count;
    },
    selectAll: function (tableEl) {
      if (!tableEl) return;
      tableEl.querySelectorAll('tbody tr').forEach(function (row) {
        var cb = row.querySelector('.cell-checkbox');
        if (cb) { setCheckboxState(cb, 'checked'); updateRowHighlight(row); }
      });
      syncHeaderCheckbox(tableEl);
      fireSelectionChange(tableEl);
    },
    deselectAll: function (tableEl) {
      if (!tableEl) return;
      tableEl.querySelectorAll('tbody tr').forEach(function (row) {
        var cb = row.querySelector('.cell-checkbox');
        if (cb) { setCheckboxState(cb, 'unchecked'); updateRowHighlight(row); }
      });
      syncHeaderCheckbox(tableEl);
      fireSelectionChange(tableEl);
    }
  };

  /* ── Row click highlight (non-checkbox area) ── */
  function initRowHighlight() {
    document.querySelectorAll('.data-table tbody tr').forEach(function (row) {
      row.addEventListener('click', function (e) {
        if (e.target.closest('.cell-checkbox') || e.target.closest('.cell-actions')) return;
        document.querySelectorAll('.data-table tbody tr').forEach(function (r) {
          if (!isRowChecked(r)) r.classList.remove('data-table__row--focused');
        });
        if (!isRowChecked(row)) row.classList.add('data-table__row--focused');
      });
    });
  }

  /* ── ActionBar refresh button ── */
  function initRefreshBtn() {
    document.querySelectorAll('.actionbar__icon-btn[title="Refresh"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var icon = btn.querySelector('img') || btn.querySelector('svg');
        if (!icon) return;
        icon.style.transition = 'transform 0.4s ease';
        icon.style.transform  = 'rotate(360deg)';
        setTimeout(function () { icon.style.transform = ''; }, 450);
      });
    });
  }

  /* ── MutationObserver: re-init when tbody rows are dynamically added ── */
  function observeTableBody() {
    document.querySelectorAll('.data-table tbody').forEach(function (tbody) {
      var observer = new MutationObserver(function () {
        initCheckboxes();
        initRowHighlight();
      });
      observer.observe(tbody, { childList: true });
    });
  }

  /* ── ActionBar state switcher (for bulk action button states) ── */
  function initActionBarStates() {
    document.querySelectorAll('.ab-state-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var state = btn.getAttribute('data-ab-state');
        var targetId = btn.getAttribute('data-ab-target');
        var group = btn.closest('.ab-state-switcher');
        if (!group || !targetId) return;

        group.querySelectorAll('.ab-state-btn').forEach(function (b) {
          b.classList.remove('ab-state-btn--active');
        });
        btn.classList.add('ab-state-btn--active');

        var actions = document.getElementById(targetId).querySelectorAll('[data-ab-action]');
        actions.forEach(function (a) {
          a.classList.remove('actionbar__action--active');
          if (state === 'default') {
            a.style.background = '#fff';
          } else if (state === 'hover') {
            a.style.background = '#E9E9E9';
          } else if (state === 'active') {
            a.style.background = '#EAF0FC';
            a.classList.add('actionbar__action--active');
          }
        });
      });
    });
  }

  function init() {
    initCheckboxes();
    initRowHighlight();
    initRefreshBtn();
    initActionBarStates();
    observeTableBody();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
