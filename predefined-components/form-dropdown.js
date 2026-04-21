/* ============================================================
   FORM DROPDOWN — Interactive Behaviors
   ============================================================ */
(function () {
  function initDropdownToggles() {
    document.querySelectorAll('[data-dropdown-trigger]').forEach(trigger => {
      const wrap = trigger.closest('.form-dropdown-wrap');
      if (!wrap) return;
      const dd = wrap.querySelector('.form-dropdown');
      if (!dd) return;
      trigger.addEventListener('click', e => {
        e.stopPropagation();
        const isOpen = dd.classList.contains('form-dropdown--open');
        closeAllDropdowns();
        if (!isOpen) dd.classList.add('form-dropdown--open');
      });
    });
    document.addEventListener('click', () => closeAllDropdowns());
    document.querySelectorAll('.form-dropdown').forEach(dd => {
      dd.addEventListener('click', e => e.stopPropagation());
    });
  }

  function closeAllDropdowns() {
    document.querySelectorAll('.form-dropdown--open').forEach(dd => {
      dd.classList.remove('form-dropdown--open');
    });
  }

  function initDropdownItems() {
    document.querySelectorAll('.form-dropdown__item:not(.form-dropdown__item--check):not(.form-dropdown__item--radio)').forEach(item => {
      item.addEventListener('click', () => {
        const list = item.closest('.form-dropdown__list');
        if (!list) return;
        list.querySelectorAll('.form-dropdown__item').forEach(i => i.classList.remove('form-dropdown__item--selected'));
        item.classList.add('form-dropdown__item--selected');
        const wrap = item.closest('.form-dropdown-wrap');
        if (wrap) {
          const trigger = wrap.querySelector('[data-dropdown-trigger]');
          if (trigger && trigger.tagName !== 'BUTTON') {
            const sel = trigger.querySelector('.form-input') || trigger;
            if (sel.tagName === 'SELECT') return;
            sel.value = item.textContent.trim();
          }
          const dd = wrap.querySelector('.form-dropdown');
          if (dd) dd.classList.remove('form-dropdown--open');
        }
      });
    });
  }

  function initCheckboxItems() {
    document.querySelectorAll('.form-dropdown__item--check').forEach(item => {
      item.addEventListener('click', () => {
        const icon = item.querySelector('.form-dropdown__item-icon');
        if (!icon) return;
        const isChecked = icon.dataset.checked === 'true';
        icon.dataset.checked = isChecked ? 'false' : 'true';
        icon.src = isChecked
          ? './assets/icons/icon-checkbox.svg'
          : './assets/icons/icon-checkbox-checked.svg';
        item.classList.toggle('form-dropdown__item--active', !isChecked);
        updateSelectAll(item.closest('.form-dropdown'));
      });
    });
  }

  function initSelectAll() {
    document.querySelectorAll('.form-dropdown__select-all').forEach(row => {
      row.addEventListener('click', () => {
        const dd = row.closest('.form-dropdown');
        if (!dd) return;
        const items = dd.querySelectorAll('.form-dropdown__item--check');
        const allChecked = [...items].every(i => i.querySelector('.form-dropdown__item-icon')?.dataset.checked === 'true');
        items.forEach(item => {
          const icon = item.querySelector('.form-dropdown__item-icon');
          if (!icon) return;
          icon.dataset.checked = allChecked ? 'false' : 'true';
          icon.src = allChecked
            ? './assets/icons/icon-checkbox.svg'
            : './assets/icons/icon-checkbox-checked.svg';
          item.classList.toggle('form-dropdown__item--active', !allChecked);
        });
        const saIcon = row.querySelector('.form-dropdown__item-icon');
        if (saIcon) {
          saIcon.dataset.checked = allChecked ? 'false' : 'true';
          saIcon.src = allChecked
            ? './assets/icons/icon-checkbox.svg'
            : './assets/icons/icon-checkbox-checked.svg';
        }
      });
    });
  }

  function updateSelectAll(dd) {
    if (!dd) return;
    const items = dd.querySelectorAll('.form-dropdown__item--check');
    const saRow = dd.querySelector('.form-dropdown__select-all');
    if (!saRow) return;
    const saIcon = saRow.querySelector('.form-dropdown__item-icon');
    if (!saIcon) return;
    const checkedCount = [...items].filter(i => i.querySelector('.form-dropdown__item-icon')?.dataset.checked === 'true').length;
    if (checkedCount === 0) {
      saIcon.src = './assets/icons/icon-checkbox.svg';
      saIcon.dataset.checked = 'false';
    } else if (checkedCount === items.length) {
      saIcon.src = './assets/icons/icon-checkbox-checked.svg';
      saIcon.dataset.checked = 'true';
    } else {
      saIcon.src = './assets/icons/icon-checkbox-indeterminate.svg';
      saIcon.dataset.checked = 'partial';
    }
  }

  function initRadioItems() {
    document.querySelectorAll('.form-dropdown__item--radio').forEach(item => {
      item.addEventListener('click', () => {
        const list = item.closest('.form-dropdown__list');
        if (!list) return;
        list.querySelectorAll('.form-dropdown__item--radio').forEach(i => {
          const icon = i.querySelector('.form-dropdown__item-icon');
          if (icon) {
            icon.src = './assets/icons/icon-radio-unchecked.svg';
            icon.dataset.checked = 'false';
          }
          i.classList.remove('form-dropdown__item--active');
        });
        const icon = item.querySelector('.form-dropdown__item-icon');
        if (icon) {
          icon.src = './assets/icons/icon-radio-checked.svg';
          icon.dataset.checked = 'true';
        }
        item.classList.add('form-dropdown__item--active');
      });
    });
  }

  function initSearchFilter() {
    document.querySelectorAll('.form-dropdown__search-input').forEach(input => {
      const dd = input.closest('.form-dropdown');
      if (!dd) return;
      const clearBtn = dd.querySelector('.form-dropdown__search-clear');
      input.addEventListener('input', () => {
        const q = input.value.toLowerCase();
        if (clearBtn) clearBtn.classList.toggle('form-dropdown__search-clear--visible', q.length > 0);
        dd.querySelectorAll('.form-dropdown__item').forEach(item => {
          const text = item.textContent.toLowerCase();
          item.style.display = text.includes(q) ? '' : 'none';
        });
        const noData = dd.querySelector('.form-dropdown__no-data');
        if (noData) {
          const anyVisible = [...dd.querySelectorAll('.form-dropdown__item')].some(i => i.style.display !== 'none');
          noData.style.display = anyVisible ? 'none' : '';
        }
      });
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          input.value = '';
          input.dispatchEvent(new Event('input'));
          clearBtn.classList.remove('form-dropdown__search-clear--visible');
        });
      }
    });
  }

  function initApplyCancel() {
    document.querySelectorAll('.form-dropdown__footer .btn-apply').forEach(btn => {
      btn.addEventListener('click', () => {
        const dd = btn.closest('.form-dropdown');
        if (dd) dd.classList.remove('form-dropdown--open');
      });
    });
    document.querySelectorAll('.form-dropdown__footer .btn-cancel').forEach(btn => {
      btn.addEventListener('click', () => {
        const dd = btn.closest('.form-dropdown');
        if (dd) dd.classList.remove('form-dropdown--open');
      });
    });
    document.querySelectorAll('.form-dropdown__footer .btn-clear').forEach(btn => {
      btn.addEventListener('click', () => {
        const dd = btn.closest('.form-dropdown');
        if (!dd) return;
        dd.querySelectorAll('.form-dropdown__item--check, .form-dropdown__item--radio').forEach(item => {
          const icon = item.querySelector('.form-dropdown__item-icon');
          if (!icon) return;
          const isRadio = item.classList.contains('form-dropdown__item--radio');
          icon.src = isRadio ? './assets/icons/icon-radio-unchecked.svg' : './assets/icons/icon-checkbox.svg';
          icon.dataset.checked = 'false';
          item.classList.remove('form-dropdown__item--active');
        });
        updateSelectAll(dd);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initDropdownToggles();
    initDropdownItems();
    initCheckboxItems();
    initSelectAll();
    initRadioItems();
    initSearchFilter();
    initApplyCancel();
  });
})();
