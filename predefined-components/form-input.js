/* ============================================================
   FORM INPUT — Predefined Component JS
   Handles: password toggle, number spinner, tags, radio groups,
   file upload, validation states
   ============================================================ */
(function () {
  var ICON = './assets/icons/';

  /* ── Password Toggle ── */
  function initPasswordToggles() {
    document.querySelectorAll('.form-input-password__toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var wrap = btn.closest('.form-input-password');
        var inp = wrap.querySelector('.form-input');
        var img = btn.querySelector('img');
        if (inp.type === 'password') {
          inp.type = 'text';
          img.src = ICON + 'icon-eye-hide.svg';
          img.alt = 'Hide';
        } else {
          inp.type = 'password';
          img.src = ICON + 'icon-eye-show.svg';
          img.alt = 'Show';
        }
      });
    });
  }

  /* ── Number Spinner ── */
  function initNumberSpinners() {
    document.querySelectorAll('.form-input-number').forEach(function (wrap) {
      var inp = wrap.querySelector('.form-input');
      var upBtn = wrap.querySelector('.form-input-number__btn--up');
      var downBtn = wrap.querySelector('.form-input-number__btn--down');
      if (!inp) return;

      var min = inp.hasAttribute('min') ? parseInt(inp.min, 10) : -Infinity;
      var max = inp.hasAttribute('max') ? parseInt(inp.max, 10) : Infinity;
      var step = inp.hasAttribute('step') ? parseInt(inp.step, 10) : 1;

      function update(delta) {
        var val = parseInt(inp.value, 10) || 0;
        val += delta;
        if (val < min) val = min;
        if (val > max) val = max;
        inp.value = val;
        inp.dispatchEvent(new Event('change', { bubbles: true }));
      }

      if (upBtn) upBtn.addEventListener('click', function () { update(step); });
      if (downBtn) downBtn.addEventListener('click', function () { update(-step); });
    });
  }

  /* ── Tags Input ── */
  function initTagsInputs() {
    document.querySelectorAll('.form-input-tags').forEach(function (wrap) {
      var input = wrap.querySelector('.form-input-tags__input');
      if (!input) return;

      wrap.addEventListener('click', function () { input.focus(); });

      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ',') {
          e.preventDefault();
          var val = input.value.trim().replace(/,/g, '');
          if (!val) return;
          addTag(wrap, val);
          input.value = '';
        }
        if (e.key === 'Backspace' && !input.value) {
          var tags = wrap.querySelectorAll('.form-input-tags__tag');
          if (tags.length) tags[tags.length - 1].remove();
        }
      });

      wrap.querySelectorAll('.form-input-tags__tag-remove').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          btn.closest('.form-input-tags__tag').remove();
        });
      });
    });
  }

  function addTag(wrap, text) {
    var input = wrap.querySelector('.form-input-tags__input');
    var tag = document.createElement('span');
    tag.className = 'form-input-tags__tag';
    tag.innerHTML = text + ' <img class="form-input-tags__tag-remove" src="' + ICON + 'icon-tag-close.svg" alt="remove" />';
    tag.querySelector('.form-input-tags__tag-remove').addEventListener('click', function (e) {
      e.stopPropagation();
      tag.remove();
    });
    wrap.insertBefore(tag, input);
  }

  /* ── Radio Groups ── */
  function initRadioGroups() {
    document.querySelectorAll('.form-radio-group').forEach(function (group) {
      group.querySelectorAll('.form-radio').forEach(function (label) {
        var input = label.querySelector('.form-radio__input');
        if (!input) return;
        input.addEventListener('change', function () {
          group.querySelectorAll('.form-radio').forEach(function (l) {
            var ci = l.querySelector('.form-radio__icon--checked');
            var ui = l.querySelector('.form-radio__icon--unchecked');
            var ri = l.querySelector('.form-radio__input');
            if (ri && ri.checked) {
              if (ci) ci.style.display = 'block';
              if (ui) ui.style.display = 'none';
            } else {
              if (ci) ci.style.display = 'none';
              if (ui) ui.style.display = 'block';
            }
          });
        });
      });
    });
  }

  /* ── File Upload ── */
  function initFileUploads() {
    document.querySelectorAll('.form-input-upload').forEach(function (wrap) {
      var btn = wrap.querySelector('.form-input-upload__btn');
      var display = wrap.querySelector('.form-input');
      if (!btn || !display) return;

      var fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.style.display = 'none';
      wrap.appendChild(fileInput);

      btn.addEventListener('click', function () { fileInput.click(); });

      fileInput.addEventListener('change', function () {
        if (fileInput.files.length) {
          display.value = fileInput.files[0].name;
          display.style.color = '#000';
        }
      });
    });
  }

  /* ── State Demonstration (for demo page) ── */
  function initStateSwitchers() {
    document.querySelectorAll('[data-form-state-target]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var targetId = btn.getAttribute('data-form-state-target');
        var state = btn.getAttribute('data-form-state');
        var target = document.getElementById(targetId);
        if (!target) return;

        target.className = target.className.replace(/form-input--(hover|focus|error|disabled|readonly)/g, '').trim();
        target.disabled = false;
        target.readOnly = false;

        if (state === 'hover') target.classList.add('form-input--hover');
        else if (state === 'focus') target.classList.add('form-input--focus');
        else if (state === 'error') target.classList.add('form-input--error');
        else if (state === 'disabled') { target.classList.add('form-input--disabled'); target.disabled = true; }
        else if (state === 'readonly') { target.classList.add('form-input--readonly'); target.readOnly = true; }

        btn.parentElement.querySelectorAll('[data-form-state-target]').forEach(function (b) {
          b.classList.remove('ab-state-btn--active');
        });
        btn.classList.add('ab-state-btn--active');
      });
    });
  }

  /* ── Init ── */
  function init() {
    initPasswordToggles();
    initNumberSpinners();
    initTagsInputs();
    initRadioGroups();
    initFileUploads();
    initStateSwitchers();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
