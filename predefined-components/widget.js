/**
 * WIDGET — Chart rendering, alert feed, and widget interactivity
 * Captured from Figma Elegant Components 1.0 — SOC Alerts Overview
 *
 * Requires Chart.js 4.x loaded before this script.
 * CDN: <script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js"></script>
 *
 * CHART METHODOLOGY (from Figma inspection):
 *   - Font: Zoho Puvi everywhere (via CSS --font-family)
 *   - Grid lines: #E9E9E9 (--chart-grid)
 *   - Tick labels: 11px #626262
 *   - Chart colors: --chart-blue #2C66DD, --chart-teal #009CBB,
 *     --chart-purple #A51C50, --chart-orange #D14900,
 *     --chart-green #198019, --chart-red #DD1616,
 *     --chart-amber #FABB34
 *   - Donut cutout: 65-75%
 *   - No outer borders on charts; minimal padding
 *   - Legends rendered in HTML (not Chart.js built-in)
 *
 * PUBLIC API:
 *   ElegantWidget.donut(canvasId, data, options)
 *   ElegantWidget.hbar(containerId, data, options)
 *   ElegantWidget.radar(canvasId, data, options)
 *   ElegantWidget.line(canvasId, data, options)
 *   ElegantWidget.bar(canvasId, data, options)
 *   ElegantWidget.combo(canvasId, data, options)
 *   ElegantWidget.sparkline(canvasId, data, options)
 *   ElegantWidget.prioBar(containerId, segments)
 *   ElegantWidget.alertFeed(containerId, alerts)
 *   ElegantWidget.bubble(canvasId, data, options)
 */
(function () {
  'use strict';

  var COLORS = {
    blue:   '#2C66DD',
    teal:   '#009CBB',
    purple: '#A51C50',
    orange: '#D14900',
    green:  '#198019',
    red:    '#DD1616',
    amber:  '#FABB34',
    lightBlue: '#4A90D9',
    grid:   '#E9E9E9',
    label:  '#626262',
    black:  '#000000',
    white:  '#FFFFFF',
  };

  var PALETTE = [COLORS.blue, COLORS.teal, COLORS.purple, COLORS.orange, COLORS.green, COLORS.red, COLORS.amber, COLORS.lightBlue];

  var fontFamily = "'Zoho Puvi', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

  var baseDefaults = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#272D42',
        titleFont: { family: fontFamily, size: 12 },
        bodyFont: { family: fontFamily, size: 11 },
        cornerRadius: 4,
        padding: 8,
      },
    },
  };

  function merge(a, b) {
    var r = JSON.parse(JSON.stringify(a));
    for (var k in b) {
      if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k])) {
        r[k] = merge(r[k] || {}, b[k]);
      } else {
        r[k] = b[k];
      }
    }
    return r;
  }

  function getCtx(id) {
    var el = document.getElementById(id);
    return el ? el.getContext('2d') : null;
  }

  /* ── DONUT / DOUGHNUT ── */
  function donut(canvasId, data, options) {
    var ctx = getCtx(canvasId);
    if (!ctx) return null;
    var opts = options || {};
    var config = merge(baseDefaults, {
      type: 'doughnut',
      data: {
        labels: data.labels || [],
        datasets: [{
          data: data.values || [],
          backgroundColor: data.colors || PALETTE.slice(0, (data.values || []).length),
          borderWidth: 0,
          hoverOffset: 4,
        }],
      },
      options: {
        cutout: opts.cutout || '68%',
        plugins: {
          legend: { display: false },
        },
      },
    });
    return new Chart(ctx, config);
  }

  /* ── HORIZONTAL BAR (pure DOM, no Chart.js) ── */
  function hbar(containerId, data, options) {
    var el = document.getElementById(containerId);
    if (!el) return;
    var opts = options || {};
    var max = 0;
    data.forEach(function (d) { if (d.value > max) max = d.value; });
    if (max === 0) max = 1;
    el.innerHTML = '';
    data.forEach(function (d) {
      var pct = Math.round((d.value / max) * 100);
      var color = d.color || COLORS.red;
      var row = document.createElement('div');
      row.className = 'hbar__row';
      row.innerHTML =
        '<span class="hbar__label">' + d.label + '</span>' +
        '<span class="widget__label" style="width:40px;text-align:right;flex-shrink:0">' + (d.secondary || '') + '</span>' +
        '<div class="hbar__track"><div class="hbar__fill" style="width:' + pct + '%;background:' + color + '"></div></div>' +
        '<span class="hbar__value" style="color:' + color + '">' + d.value + '</span>';
      el.appendChild(row);
    });
  }

  /* ── RADAR / SPIDER ── */
  function radar(canvasId, data, options) {
    var ctx = getCtx(canvasId);
    if (!ctx) return null;
    var config = merge(baseDefaults, {
      type: 'radar',
      data: {
        labels: data.labels || [],
        datasets: (data.datasets || []).map(function (ds, i) {
          return {
            label: ds.label || '',
            data: ds.values || [],
            backgroundColor: (ds.color || PALETTE[i]) + '20',
            borderColor: ds.color || PALETTE[i],
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: ds.color || PALETTE[i],
          };
        }),
      },
      options: {
        scales: {
          r: {
            ticks: { display: false },
            grid: { color: COLORS.grid },
            angleLines: { color: COLORS.grid },
            pointLabels: {
              font: { family: fontFamily, size: 10 },
              color: COLORS.label,
            },
          },
        },
      },
    });
    return new Chart(ctx, config);
  }

  /* ── LINE CHART ── */
  function line(canvasId, data, options) {
    var ctx = getCtx(canvasId);
    if (!ctx) return null;
    var config = merge(baseDefaults, {
      type: 'line',
      data: {
        labels: data.labels || [],
        datasets: (data.datasets || []).map(function (ds, i) {
          return {
            label: ds.label || '',
            data: ds.values || [],
            borderColor: ds.color || PALETTE[i],
            backgroundColor: (ds.color || PALETTE[i]) + '15',
            fill: ds.fill !== undefined ? ds.fill : false,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: ds.pointRadius !== undefined ? ds.pointRadius : 2,
            pointBackgroundColor: ds.color || PALETTE[i],
          };
        }),
      },
      options: {
        scales: {
          x: {
            grid: { color: COLORS.grid },
            ticks: { font: { family: fontFamily, size: 10 }, color: COLORS.label },
          },
          y: {
            grid: { color: COLORS.grid },
            ticks: { font: { family: fontFamily, size: 10 }, color: COLORS.label },
            beginAtZero: true,
          },
        },
      },
    });
    return new Chart(ctx, config);
  }

  /* ── BAR CHART ── */
  function bar(canvasId, data, options) {
    var ctx = getCtx(canvasId);
    if (!ctx) return null;
    var opts = options || {};
    var config = merge(baseDefaults, {
      type: 'bar',
      data: {
        labels: data.labels || [],
        datasets: (data.datasets || []).map(function (ds, i) {
          return {
            label: ds.label || '',
            data: ds.values || [],
            backgroundColor: ds.colors || ds.color || PALETTE[i],
            borderRadius: 2,
            maxBarThickness: opts.maxBarThickness || 40,
          };
        }),
      },
      options: {
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { family: fontFamily, size: 10 }, color: COLORS.label },
            stacked: opts.stacked || false,
          },
          y: {
            grid: { color: COLORS.grid },
            ticks: { font: { family: fontFamily, size: 10 }, color: COLORS.label },
            beginAtZero: true,
            stacked: opts.stacked || false,
          },
        },
      },
    });
    return new Chart(ctx, config);
  }

  /* ── COMBO (BAR + LINE) ── */
  function combo(canvasId, data, options) {
    var ctx = getCtx(canvasId);
    if (!ctx) return null;
    var opts = options || {};
    var datasets = [];

    (data.bars || []).forEach(function (ds, i) {
      datasets.push({
        type: 'bar',
        label: ds.label || '',
        data: ds.values || [],
        backgroundColor: ds.color || PALETTE[i],
        borderRadius: 2,
        maxBarThickness: 32,
        yAxisID: 'y',
        stack: opts.stacked ? 'stack1' : undefined,
      });
    });

    (data.lines || []).forEach(function (ds, i) {
      datasets.push({
        type: 'line',
        label: ds.label || '',
        data: ds.values || [],
        borderColor: ds.color || PALETTE[i + (data.bars || []).length],
        backgroundColor: 'transparent',
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: ds.color || PALETTE[i + (data.bars || []).length],
        yAxisID: opts.dualAxis ? 'y1' : 'y',
      });
    });

    var scalesConfig = {
      x: {
        grid: { display: false },
        ticks: { font: { family: fontFamily, size: 10 }, color: COLORS.label },
        stacked: opts.stacked || false,
      },
      y: {
        grid: { color: COLORS.grid },
        ticks: { font: { family: fontFamily, size: 10 }, color: COLORS.label },
        beginAtZero: true,
        position: 'left',
        stacked: opts.stacked || false,
      },
    };

    if (opts.dualAxis) {
      scalesConfig.y1 = {
        grid: { display: false },
        ticks: { font: { family: fontFamily, size: 10 }, color: COLORS.label },
        position: 'right',
        beginAtZero: true,
      };
    }

    var config = merge(baseDefaults, {
      data: { labels: data.labels || [], datasets: datasets },
      options: { scales: scalesConfig },
    });

    return new Chart(ctx, config);
  }

  /* ── SPARKLINE (tiny line, no axes) ── */
  function sparkline(canvasId, data, options) {
    var ctx = getCtx(canvasId);
    if (!ctx) return null;
    var opts = options || {};
    var config = merge(baseDefaults, {
      type: 'line',
      data: {
        labels: data.labels || data.values.map(function (_, i) { return ''; }),
        datasets: [{
          data: data.values || [],
          borderColor: opts.color || COLORS.red,
          backgroundColor: (opts.color || COLORS.red) + '15',
          fill: true,
          tension: 0.4,
          borderWidth: 1.5,
          pointRadius: 0,
        }],
      },
      options: {
        scales: {
          x: { display: false },
          y: { display: false },
        },
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
        },
      },
    });
    return new Chart(ctx, config);
  }

  /* ── BUBBLE / PROPORTIONAL CIRCLES ── */
  function bubble(canvasId, data, options) {
    var ctx = getCtx(canvasId);
    if (!ctx) return null;
    var config = merge(baseDefaults, {
      type: 'bubble',
      data: {
        datasets: (data.datasets || []).map(function (ds, i) {
          return {
            label: ds.label || '',
            data: [{ x: ds.x || i * 2, y: ds.y || 1, r: ds.r || 20 }],
            backgroundColor: (ds.color || PALETTE[i]) + '90',
            borderColor: ds.color || PALETTE[i],
            borderWidth: 2,
          };
        }),
      },
      options: {
        scales: {
          x: { display: false },
          y: { display: false },
        },
      },
    });
    return new Chart(ctx, config);
  }

  /* ── PRIORITY SCORE BAR (DOM-based) ── */
  function prioBar(containerId, segments) {
    var el = document.getElementById(containerId);
    if (!el) return;
    var total = 0;
    segments.forEach(function (s) { total += s.value; });

    var track = document.createElement('div');
    track.className = 'prio-bar__track';
    segments.forEach(function (s) {
      var seg = document.createElement('div');
      seg.className = 'prio-bar__segment';
      seg.style.width = (total > 0 ? (s.value / total * 100) : 0) + '%';
      seg.style.background = s.color;
      track.appendChild(seg);
    });

    var labels = document.createElement('div');
    labels.className = 'prio-bar__labels';
    segments.forEach(function (s) {
      var lbl = document.createElement('div');
      lbl.className = 'prio-bar__label';
      lbl.innerHTML =
        '<span class="prio-bar__label-dot" style="background:' + s.color + '"></span>' +
        '<span class="prio-bar__label-text">' + s.label + '</span>' +
        '<span class="prio-bar__label-value">' + s.value + '</span>';
      labels.appendChild(lbl);
    });

    el.innerHTML = '';
    el.appendChild(track);
    el.appendChild(labels);
  }

  /* ── ALERT FEED (DOM-based card list) ── */
  function alertFeed(containerId, alerts) {
    var el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = '';

    var iconMap = {
      critical: 'sev-badge--critical',
      high: 'sev-badge--high',
      medium: 'sev-badge--medium',
      low: 'sev-badge--low',
      verylow: 'sev-badge--verylow',
    };
    var cardIconMap = {
      critical: 'alert-card__icon--critical',
      high: 'alert-card__icon--high',
      medium: 'alert-card__icon--medium',
      low: 'alert-card__icon--low',
    };

    alerts.forEach(function (a) {
      var card = document.createElement('div');
      card.className = 'alert-card';

      var sevClass = iconMap[a.severity] || 'sev-badge--medium';
      var iconClass = cardIconMap[a.severity] || 'alert-card__icon--medium';

      card.innerHTML =
        '<div class="alert-card__header">' +
          '<div class="alert-card__icon ' + iconClass + '">' + (a.icon || '⚠') + '</div>' +
          '<span class="alert-card__name">' + (a.title || '') + '</span>' +
          '<span class="sev-badge ' + sevClass + '">' + (a.severityLabel || a.severity || '') + '</span>' +
        '</div>' +
        '<div class="alert-card__body">' + (a.body || '') + '</div>' +
        '<div class="alert-card__meta">' +
          '<span>' + (a.meta || '') + '</span>' +
        '</div>';

      el.appendChild(card);
    });
  }

  /* ── PUBLIC API ── */
  window.ElegantWidget = {
    donut: donut,
    hbar: hbar,
    radar: radar,
    line: line,
    bar: bar,
    combo: combo,
    sparkline: sparkline,
    bubble: bubble,
    prioBar: prioBar,
    alertFeed: alertFeed,
    COLORS: COLORS,
    PALETTE: PALETTE,
  };
})();
