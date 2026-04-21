/**
 * ElegantEChart — Apache ECharts wrapper with Elegant theme
 * Mirrors the ElegantWidget (Chart.js) API for consistency.
 *
 * Requires:
 *   <script src="./predefined-components/lib/echarts.min.js"></script>
 *   <script src="./predefined-components/echarts-elegant-theme.js"></script>
 *   <script src="./predefined-components/echarts-widget.js"></script>
 *
 * PUBLIC API:
 *   ElegantEChart.bar(domId, data, options)       — vertical bar / grouped / stacked
 *   ElegantEChart.line(domId, data, options)       — line / area / multi-line
 *   ElegantEChart.pie(domId, data, options)        — pie chart
 *   ElegantEChart.donut(domId, data, options)      — donut (ring) chart
 *   ElegantEChart.combo(domId, data, options)      — bar + line mixed
 *   ElegantEChart.radar(domId, data, options)      — radar / spider
 *   ElegantEChart.scatter(domId, data, options)    — scatter / bubble
 *   ElegantEChart.heatmap(domId, data, options)    — heatmap grid
 *   ElegantEChart.gauge(domId, data, options)      — gauge meter
 *   ElegantEChart.treemap(domId, data, options)    — treemap
 *   ElegantEChart.sunburst(domId, data, options)   — sunburst (nested ring)
 *   ElegantEChart.sankey(domId, data, options)     — sankey flow diagram
 *   ElegantEChart.funnel(domId, data, options)     — funnel chart
 *   ElegantEChart.stackedArea(domId, data, options)— stacked area
 *   ElegantEChart.sparkline(domId, data, options)  — tiny inline chart
 *   ElegantEChart.hbar(domId, data, options)       — horizontal bar
 *   ElegantEChart.alertList(domId, data, options)   — scrollable alert feed
 *   ElegantEChart.analysisWidget(domId, data, opts) — KPI summary + top alert profiles
 *   ElegantEChart.metricsWidget(domId, data, opts)  — KPI tiles with ring gauges
 *   ElegantEChart.alertType1(domId, data, options)  — long pending alerts (with age + assignee)
 *   ElegantEChart.alertType2(domId, data, options)  — SLA violated alerts (with violation timer)
 *   ElegantEChart.alertType3(domId, data, options)  — prioritized alerts (critical + SLA)
 *   ElegantEChart.suspectList(domId, data, options) — top suspects with risk bars
 *   ElegantEChart.tangentialPolarBar(domId, data, opts) — tangential polar bar
 *   ElegantEChart.riskDistribution(domId, data, opts)  — composite: polar + sunburst/gauge + radar
 *   ElegantEChart.dispose(domId)                   — destroy instance
 *   ElegantEChart.resize()                         — resize all instances
 *   ElegantEChart.instances                        — Map of all live instances
 */
(function () {
  'use strict';

  /* Auto-inject echarts-widget.css if not already loaded */
  (function injectWidgetCSS() {
    var sheets = document.querySelectorAll('link[rel="stylesheet"]');
    for (var i = 0; i < sheets.length; i++) {
      if (sheets[i].href && sheets[i].href.indexOf('echarts-widget.css') !== -1) return;
    }
    var thisScript = document.currentScript || (function () {
      var scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();
    var basePath = thisScript.src.substring(0, thisScript.src.lastIndexOf('/') + 1);
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = basePath + 'echarts-widget.css';
    document.head.appendChild(link);
  })();

  var PALETTE = window.ElegantThemePalette || [
    '#2C66DD','#009CBB','#A51C50','#D14900','#198019','#DD1616','#FABB34','#4A90D9'
  ];

  var instances = {};

  var TOOLTIP_AXIS = {
    show: true,
    trigger: 'axis',
    backgroundColor: '#272D42',
    borderColor: '#272D42',
    borderWidth: 0,
    textStyle: { fontFamily: "'Zoho Puvi', sans-serif", fontSize: 11, color: '#FFFFFF' },
    extraCssText: 'border-radius:4px;padding:8px 12px;box-shadow:0 2px 8px rgba(0,0,0,.15);',
    axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(44,102,221,0.06)' } }
  };

  var TOOLTIP_ITEM = {
    show: true,
    trigger: 'item',
    backgroundColor: '#272D42',
    borderColor: '#272D42',
    borderWidth: 0,
    textStyle: { fontFamily: "'Zoho Puvi', sans-serif", fontSize: 11, color: '#FFFFFF' },
    extraCssText: 'border-radius:4px;padding:8px 12px;box-shadow:0 2px 8px rgba(0,0,0,.15);'
  };

  var ANIM = { animationDuration: 800, animationEasing: 'cubicOut' };

  var LEGEND_BOTTOM = {
    show: true,
    bottom: 0,
    left: 'center',
    icon: 'circle',
    itemWidth: 8,
    itemHeight: 8,
    itemGap: 16,
    textStyle: { fontFamily: "'Zoho Puvi', sans-serif", fontSize: 11, color: '#626262' }
  };

  function legendBottom(showOverride) {
    var l = Object.assign({}, LEGEND_BOTTOM);
    if (showOverride !== undefined) l.show = showOverride;
    return l;
  }

  function init(domId) {
    if (instances[domId]) { instances[domId].dispose(); }
    var dom = document.getElementById(domId);
    if (!dom) { console.warn('ElegantEChart: #' + domId + ' not found'); return null; }
    var chart = echarts.init(dom, 'elegant');
    instances[domId] = chart;
    return chart;
  }

  function autoResize(chart) {
    var handler = function () { chart.resize(); };
    window.addEventListener('resize', handler);
    chart.__elegantResizeHandler = handler;
  }

  function colorAt(i) { return PALETTE[i % PALETTE.length]; }

  /* ── VERTICAL BAR ── */
  function bar(domId, data, options) {
    var chart = init(domId); if (!chart) return null;
    var opts = options || {};
    var series = (data.datasets || []).map(function (ds, i) {
      return {
        name: ds.label || '',
        type: 'bar',
        data: ds.values || [],
        itemStyle: { color: ds.color || colorAt(i), borderRadius: [2,2,0,0] },
        barMaxWidth: opts.barMaxWidth || 40,
        stack: opts.stacked ? 'total' : undefined,
        emphasis: { itemStyle: { shadowBlur: 8, shadowColor: 'rgba(0,0,0,.12)' } }
      };
    });
    chart.setOption(Object.assign({}, ANIM, {
      tooltip: TOOLTIP_AXIS,
      legend: legendBottom(series.length > 1),
      grid: { left: 48, right: 16, top: 24, bottom: series.length > 1 ? 48 : 24, containLabel: false },
      xAxis: { type: 'category', data: data.labels || [] },
      yAxis: { type: 'value' },
      series: series
    }));
    autoResize(chart);
    return chart;
  }

  /* ── HORIZONTAL BAR ── */
  function hbar(domId, data, options) {
    var chart = init(domId); if (!chart) return null;
    var opts = options || {};
    var series = (data.datasets || []).map(function (ds, i) {
      return {
        name: ds.label || '',
        type: 'bar',
        data: ds.values || [],
        itemStyle: { color: ds.color || colorAt(i), borderRadius: [0,2,2,0] },
        barMaxWidth: opts.barMaxWidth || 24,
        stack: opts.stacked ? 'total' : undefined,
        emphasis: { itemStyle: { shadowBlur: 8, shadowColor: 'rgba(0,0,0,.12)' } }
      };
    });
    chart.setOption(Object.assign({}, ANIM, {
      tooltip: TOOLTIP_AXIS,
      legend: legendBottom(series.length > 1),
      grid: { left: 48, right: 16, top: 24, bottom: series.length > 1 ? 48 : 24, containLabel: true },
      xAxis: { type: 'value' },
      yAxis: { type: 'category', data: data.labels || [], inverse: true },
      series: series
    }));
    autoResize(chart);
    return chart;
  }

  /* ── LINE ── */
  function line(domId, data, options) {
    var chart = init(domId); if (!chart) return null;
    var opts = options || {};
    var series = (data.datasets || []).map(function (ds, i) {
      var c = ds.color || colorAt(i);
      return {
        name: ds.label || '',
        type: 'line',
        data: ds.values || [],
        smooth: opts.smooth !== false,
        showSymbol: opts.showSymbol !== false,
        symbolSize: 6,
        lineStyle: { width: 2, color: c },
        itemStyle: { color: c },
        areaStyle: ds.fill ? { opacity: 0.08, color: c } : undefined,
        emphasis: { lineStyle: { width: 3 }, itemStyle: { borderWidth: 3, borderColor: '#fff', shadowBlur: 6, shadowColor: c } }
      };
    });
    chart.setOption(Object.assign({}, ANIM, {
      tooltip: Object.assign({}, TOOLTIP_AXIS, { axisPointer: { type: 'cross', crossStyle: { color: '#E9E9E9' } } }),
      legend: legendBottom(series.length > 1),
      grid: { left: 48, right: 16, top: 24, bottom: series.length > 1 ? 48 : 24, containLabel: false },
      xAxis: { type: 'category', data: data.labels || [], boundaryGap: false },
      yAxis: { type: 'value' },
      series: series
    }));
    autoResize(chart);
    return chart;
  }

  /* ── helper: hex colour → rgba string ── */
  function hexToRgba(hex, alpha) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }

  /* ── STACKED AREA (gradient fill) ── */
  function stackedArea(domId, data, options) {
    var chart = init(domId); if (!chart) return null;
    var opts = options || {};
    var series = (data.datasets || []).map(function (ds, i) {
      var c = ds.color || colorAt(i);
      return {
        name: ds.label || '',
        type: 'line',
        data: ds.values || [],
        smooth: true,
        stack: opts.noStack ? undefined : 'total',
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: hexToRgba(c, 0.45) },
            { offset: 1, color: hexToRgba(c, 0.03) }
          ])
        },
        lineStyle: { width: 2.5, color: c },
        itemStyle: { color: c },
        showSymbol: false,
        emphasis: { focus: 'series', lineStyle: { width: 3.5 } }
      };
    });
    chart.setOption(Object.assign({}, ANIM, {
      tooltip: Object.assign({}, TOOLTIP_AXIS, { axisPointer: { type: 'cross', crossStyle: { color: '#E9E9E9' } } }),
      legend: legendBottom(true),
      grid: { left: 48, right: 16, top: 24, bottom: 48, containLabel: false },
      xAxis: { type: 'category', data: data.labels || [], boundaryGap: false },
      yAxis: { type: 'value' },
      series: series
    }));
    autoResize(chart);
    return chart;
  }

  /* ── PIE ── */
  function pie(domId, data, options) {
    var chart = init(domId); if (!chart) return null;
    var opts = options || {};
    chart.setOption(Object.assign({}, ANIM, {
      tooltip: Object.assign({}, TOOLTIP_ITEM, {
        formatter: function (p) { return '<b>' + p.name + '</b><br/>' + p.value + ' (' + p.percent + '%)'; }
      }),
      legend: legendBottom(opts.legend !== false),
      series: [{
        type: 'pie',
        radius: opts.radius || '60%',
        center: ['50%', '45%'],
        data: (data.labels || []).map(function (label, i) {
          return {
            name: label,
            value: (data.values || [])[i] || 0,
            itemStyle: { color: (data.colors || PALETTE)[i % PALETTE.length] }
          };
        }),
        label: { show: opts.showLabel !== false, fontSize: 11 },
        emphasis: {
          scale: true, scaleSize: 8,
          itemStyle: { shadowBlur: 12, shadowColor: 'rgba(0,0,0,.2)' }
        },
        animationType: 'scale',
        animationEasing: 'elasticOut'
      }]
    }));
    autoResize(chart);
    return chart;
  }

  /* ── DONUT ── */
  function donut(domId, data, options) {
    var chart = init(domId); if (!chart) return null;
    var opts = options || {};
    var innerRadius = opts.innerRadius || '55%';
    var outerRadius = opts.outerRadius || '75%';
    chart.setOption(Object.assign({}, ANIM, {
      tooltip: Object.assign({}, TOOLTIP_ITEM, {
        formatter: function (p) { return '<b>' + p.name + '</b><br/>' + p.value + ' (' + p.percent + '%)'; }
      }),
      legend: legendBottom(opts.legend !== false),
      series: [{
        type: 'pie',
        radius: [innerRadius, outerRadius],
        center: ['50%', '45%'],
        data: (data.labels || []).map(function (label, i) {
          return {
            name: label,
            value: (data.values || [])[i] || 0,
            itemStyle: { color: (data.colors || PALETTE)[i % PALETTE.length] }
          };
        }),
        label: { show: opts.showLabel !== undefined ? opts.showLabel : false },
        emphasis: {
          scale: true, scaleSize: 6,
          itemStyle: { shadowBlur: 12, shadowColor: 'rgba(0,0,0,.2)' }
        },
        animationType: 'scale',
        animationEasing: 'elasticOut'
      }]
    }));
    autoResize(chart);
    return chart;
  }

  /* ── COMBO (BAR + LINE) ── */
  function combo(domId, data, options) {
    var chart = init(domId); if (!chart) return null;
    var opts = options || {};
    var series = [];
    (data.bars || []).forEach(function (ds, i) {
      series.push({
        name: ds.label || '',
        type: 'bar',
        data: ds.values || [],
        itemStyle: { color: ds.color || colorAt(i), borderRadius: [2,2,0,0] },
        barMaxWidth: 32,
        yAxisIndex: 0,
        emphasis: { itemStyle: { shadowBlur: 8, shadowColor: 'rgba(0,0,0,.12)' } }
      });
    });
    (data.lines || []).forEach(function (ds, i) {
      var c = ds.color || colorAt(i + (data.bars || []).length);
      series.push({
        name: ds.label || '',
        type: 'line',
        data: ds.values || [],
        smooth: true,
        symbolSize: 6,
        lineStyle: { width: 2, color: c },
        itemStyle: { color: c },
        yAxisIndex: opts.dualAxis ? 1 : 0,
        emphasis: { lineStyle: { width: 3 }, itemStyle: { borderWidth: 3, borderColor: '#fff' } }
      });
    });
    var yAxes = [{ type: 'value' }];
    if (opts.dualAxis) { yAxes.push({ type: 'value', splitLine: { show: false } }); }
    chart.setOption(Object.assign({}, ANIM, {
      tooltip: Object.assign({}, TOOLTIP_AXIS, { axisPointer: { type: 'shadow' } }),
      legend: legendBottom(true),
      grid: { left: 48, right: 16, top: 24, bottom: 48, containLabel: false },
      xAxis: { type: 'category', data: data.labels || [] },
      yAxis: yAxes,
      series: series
    }));
    autoResize(chart);
    return chart;
  }

  /* ── RADAR ── */
  function radar(domId, data, options) {
    var chart = init(domId); if (!chart) return null;
    var maxVal = 0;
    (data.datasets || []).forEach(function (ds) {
      (ds.values || []).forEach(function (v) { if (v > maxVal) maxVal = v; });
    });
    chart.setOption(Object.assign({}, ANIM, {
      tooltip: TOOLTIP_ITEM,
      legend: legendBottom((data.datasets || []).length > 1),
      radar: {
        indicator: (data.labels || []).map(function (l) { return { name: l, max: Math.ceil(maxVal * 1.2) }; }),
        shape: 'polygon'
      },
      series: [{
        type: 'radar',
        data: (data.datasets || []).map(function (ds, i) {
          var c = ds.color || colorAt(i);
          return {
            name: ds.label || '',
            value: ds.values || [],
            lineStyle: { color: c, width: 2 },
            itemStyle: { color: c },
            areaStyle: { color: c, opacity: 0.12 },
            emphasis: { lineStyle: { width: 3 }, areaStyle: { opacity: 0.25 } }
          };
        })
      }]
    }));
    autoResize(chart);
    return chart;
  }

  /* ── SCATTER / BUBBLE ── */
  function scatter(domId, data, options) {
    var chart = init(domId); if (!chart) return null;
    var opts = options || {};
    var series = (data.datasets || []).map(function (ds, i) {
      var c = ds.color || colorAt(i);
      return {
        name: ds.label || '',
        type: 'scatter',
        data: ds.values || [],
        symbolSize: opts.bubble ? function (val) { return val[2] || 10; } : 10,
        itemStyle: { color: c, opacity: 0.75 },
        emphasis: { itemStyle: { opacity: 1, shadowBlur: 10, shadowColor: c, borderWidth: 2, borderColor: '#fff' } }
      };
    });
    chart.setOption(Object.assign({}, ANIM, {
      tooltip: Object.assign({}, TOOLTIP_ITEM, {
        formatter: function (p) {
          return '<b>' + p.seriesName + '</b><br/>X: ' + p.value[0] + '<br/>Y: ' + p.value[1];
        }
      }),
      legend: legendBottom(series.length > 1),
      grid: { left: 48, right: 16, top: 24, bottom: series.length > 1 ? 64 : 24, containLabel: false },
      xAxis: { type: 'value', name: opts.xLabel || '', nameLocation: 'center', nameGap: 28 },
      yAxis: { type: 'value', name: opts.yLabel || '', nameLocation: 'center', nameGap: 40 },
      series: series
    }));
    autoResize(chart);
    return chart;
  }

  /* ── HEATMAP ── */
  function heatmap(domId, data, options) {
    var chart = init(domId); if (!chart) return null;
    var opts = options || {};
    var minVal = Infinity, maxVal = -Infinity;
    (data.values || []).forEach(function (v) {
      if (v[2] < minVal) minVal = v[2];
      if (v[2] > maxVal) maxVal = v[2];
    });
    chart.setOption(Object.assign({}, ANIM, {
      tooltip: Object.assign({}, TOOLTIP_ITEM, {
        formatter: function (p) {
          var xLabels = data.xLabels || [];
          var yLabels = data.yLabels || [];
          return '<b>' + (yLabels[p.value[1]] || '') + ', ' + (xLabels[p.value[0]] || '') + '</b><br/>Alerts: ' + p.value[2];
        }
      }),
      xAxis: { type: 'category', data: data.xLabels || [] },
      yAxis: { type: 'category', data: data.yLabels || [] },
      visualMap: {
        min: minVal, max: maxVal, calculable: true,
        orient: 'horizontal', left: 'center', bottom: 0,
        inRange: { color: opts.colorRange || ['#FFFFFF', '#2C66DD'] },
        textStyle: { fontFamily: "'Zoho Puvi', sans-serif", fontSize: 11, color: '#626262' }
      },
      series: [{
        type: 'heatmap',
        data: data.values || [],
        label: { show: opts.showLabel !== false, fontSize: 11, color: '#000' },
        emphasis: { itemStyle: { shadowBlur: 6, shadowColor: 'rgba(0,0,0,.2)', borderColor: '#2C66DD', borderWidth: 2 } }
      }]
    }));
    autoResize(chart);
    return chart;
  }

  /* ── GAUGE ── */
  function gauge(domId, data, options) {
    var chart = init(domId); if (!chart) return null;
    var opts = options || {};
    chart.setOption(Object.assign({}, ANIM, {
      tooltip: Object.assign({}, TOOLTIP_ITEM, {
        formatter: function (p) { return '<b>' + p.name + '</b><br/>' + p.value + '%'; }
      }),
      series: [{
        type: 'gauge',
        min: opts.min || 0,
        max: opts.max || 100,
        progress: { show: true, width: 14 },
        axisLine: {
          lineStyle: {
            width: 14,
            color: [[0.3, '#198019'], [0.7, '#FABB34'], [1, '#DD1616']]
          }
        },
        axisTick: { show: false },
        splitLine: { length: 8, lineStyle: { width: 2, color: '#E9E9E9' } },
        axisLabel: { distance: 20, fontSize: 11, color: '#626262' },
        pointer: { width: 4, itemStyle: { color: 'inherit' } },
        title: { fontSize: 14, fontWeight: 600, color: '#000', offsetCenter: [0, '70%'] },
        detail: {
          fontSize: 28, fontWeight: 600, color: '#000',
          offsetCenter: [0, '40%'],
          formatter: opts.formatter || '{value}%'
        },
        data: [{ value: data.value || 0, name: data.label || '' }],
        itemStyle: { color: data.color || '#2C66DD' },
        animationDuration: 1500,
        animationEasing: 'bounceOut'
      }]
    }));
    autoResize(chart);
    return chart;
  }

  /* ── TREEMAP ── */
  function treemap(domId, data, options) {
    var chart = init(domId); if (!chart) return null;
    chart.setOption(Object.assign({}, ANIM, {
      tooltip: Object.assign({}, TOOLTIP_ITEM, {
        formatter: function (p) { return '<b>' + p.name + '</b><br/>Volume: ' + (p.value || 0).toLocaleString(); }
      }),
      series: [{
        type: 'treemap',
        data: data.items || [],
        roam: false,
        leafDepth: 1,
        label: { show: true, fontSize: 11, fontFamily: "'Zoho Puvi', sans-serif" },
        breadcrumb: { show: false },
        emphasis: { label: { fontSize: 13, fontWeight: 600 }, itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,.2)' } },
        levels: [{
          itemStyle: { borderColor: '#FFFFFF', borderWidth: 2, gapWidth: 2 },
          colorSaturation: [0.3, 0.7],
          upperLabel: { show: false }
        }]
      }]
    }));
    autoResize(chart);
    return chart;
  }

  /* ── SUNBURST ── */
  function sunburst(domId, data, options) {
    var chart = init(domId); if (!chart) return null;
    chart.setOption(Object.assign({}, ANIM, {
      tooltip: Object.assign({}, TOOLTIP_ITEM, {
        formatter: function (p) { return '<b>' + p.name + '</b>' + (p.value ? '<br/>Value: ' + p.value : ''); }
      }),
      series: [{
        type: 'sunburst',
        data: data.items || [],
        radius: ['15%', '85%'],
        label: { fontSize: 11, fontFamily: "'Zoho Puvi', sans-serif", rotate: 'radial' },
        emphasis: { focus: 'ancestor', itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,.2)' } },
        levels: [{}, {
          itemStyle: { borderWidth: 2, borderColor: '#fff' },
          label: { rotate: 'tangential' }
        }, {
          itemStyle: { borderWidth: 1, borderColor: '#fff' }
        }]
      }]
    }));
    autoResize(chart);
    return chart;
  }

  /* ── SANKEY ── */
  function sankey(domId, data, options) {
    var chart = init(domId); if (!chart) return null;
    chart.setOption(Object.assign({}, ANIM, {
      tooltip: Object.assign({}, TOOLTIP_ITEM, {
        trigger: 'item',
        formatter: function (p) {
          if (p.dataType === 'edge') return p.data.source + ' → ' + p.data.target + '<br/>Flow: ' + p.data.value;
          return '<b>' + p.name + '</b>';
        }
      }),
      series: [{
        type: 'sankey',
        layout: 'none',
        data: data.nodes || [],
        links: data.links || [],
        label: { fontSize: 11, fontFamily: "'Zoho Puvi', sans-serif", color: '#000' },
        lineStyle: { color: 'gradient', curveness: 0.5, opacity: 0.35 },
        emphasis: { focus: 'adjacency', lineStyle: { opacity: 0.6 } },
        nodeGap: 12,
        nodeWidth: 16
      }]
    }));
    autoResize(chart);
    return chart;
  }

  /* ── FUNNEL ── */
  function funnel(domId, data, options) {
    var chart = init(domId); if (!chart) return null;
    var opts = options || {};
    chart.setOption(Object.assign({}, ANIM, {
      tooltip: Object.assign({}, TOOLTIP_ITEM, {
        formatter: function (p) { return '<b>' + p.name + '</b><br/>' + p.value.toLocaleString() + ' (' + p.percent + '%)'; }
      }),
      legend: legendBottom(opts.legend !== false),
      series: [{
        type: 'funnel',
        left: '10%', right: '10%', top: 16, bottom: 40,
        sort: 'descending',
        gap: 2,
        label: { show: true, position: 'inside', fontSize: 11, color: '#fff' },
        data: (data.labels || []).map(function (label, i) {
          return {
            name: label,
            value: (data.values || [])[i] || 0,
            itemStyle: { color: (data.colors || PALETTE)[i % PALETTE.length] }
          };
        }),
        emphasis: { label: { fontSize: 13, fontWeight: 600 }, itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,.2)' } }
      }]
    }));
    autoResize(chart);
    return chart;
  }

  /* ── SPARKLINE (tiny, no axes, no tooltip) ── */
  function sparkline(domId, data, options) {
    var chart = init(domId); if (!chart) return null;
    var opts = options || {};
    var c = opts.color || '#DD1616';
    chart.setOption({
      grid: { left: 0, right: 0, top: 0, bottom: 0 },
      xAxis: { type: 'category', show: false, data: (data.values || []).map(function (_, i) { return i; }) },
      yAxis: { type: 'value', show: false },
      tooltip: { show: false },
      animation: true,
      animationDuration: 1000,
      series: [{
        type: 'line',
        data: data.values || [],
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 1.5, color: c },
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: c + '30' },
          { offset: 1, color: c + '05' }
        ])}
      }]
    });
    autoResize(chart);
    return chart;
  }

  /* ── LIQUID FILL (ring progress gauge) ── */
  function liquidFill(domId, data, options) {
    var chart = init(domId); if (!chart) return null;
    var opts = options || {};
    var value = Array.isArray(data.values) ? data.values[0] : (data.value || 0.6);
    var color = data.borderColor || data.color || PALETTE[0];
    var fmt = opts.formatter || function (v) { return (v * 100).toFixed(0) + '%'; };
    chart.setOption({
      series: [{
        type: 'gauge',
        center: ['50%', '50%'],
        radius: opts.radius || '85%',
        startAngle: 90,
        endAngle: -270,
        min: 0, max: 1,
        pointer: { show: false },
        progress: {
          show: true, overlap: false, roundCap: true, clip: false,
          itemStyle: { color: color }
        },
        axisLine: { lineStyle: { width: 14, color: [[1, '#E9E9E9']] } },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        title: { show: false },
        detail: {
          fontSize: opts.fontSize || 24,
          fontWeight: 600,
          fontFamily: "'Zoho Puvi', sans-serif",
          color: color,
          offsetCenter: [0, 0],
          formatter: function () { return fmt(value); }
        },
        data: [{ value: value }],
        animationDuration: 1500,
        animationEasing: 'cubicOut'
      }]
    });
    autoResize(chart);
    return chart;
  }

  /* ── THEME RIVER (stacked stream) ── */
  function themeRiver(domId, data, options) {
    var chart = init(domId); if (!chart) return null;
    chart.setOption(Object.assign({}, ANIM, {
      tooltip: Object.assign({}, TOOLTIP_AXIS, { trigger: 'axis', axisPointer: { type: 'line', lineStyle: { color: '#626262', width: 1, type: 'dashed' } } }),
      singleAxis: { type: 'time', bottom: 32, axisTick: { show: false }, axisLine: { lineStyle: { color: '#E9E9E9' } }, axisLabel: { fontSize: 11, color: '#626262', fontFamily: "'Zoho Puvi', sans-serif" } },
      series: [{
        type: 'themeRiver',
        data: data.values || [],
        label: { show: false },
        emphasis: { itemStyle: { shadowBlur: 12, shadowColor: 'rgba(0,0,0,.15)' } }
      }]
    }));
    autoResize(chart);
    return chart;
  }

  /* ── NIGHTINGALE ROSE (polar area) ── */
  function nightingaleRose(domId, data, options) {
    var chart = init(domId); if (!chart) return null;
    var opts = options || {};
    chart.setOption(Object.assign({}, ANIM, {
      tooltip: Object.assign({}, TOOLTIP_ITEM, {
        formatter: function (p) { return '<b>' + p.name + '</b><br/>' + p.value + ' (' + p.percent + '%)'; }
      }),
      legend: legendBottom(opts.legend !== false),
      series: [{
        type: 'pie',
        roseType: opts.roseType || 'area',
        radius: opts.radius || ['20%', '65%'],
        center: ['50%', '45%'],
        data: (data.labels || []).map(function (label, i) {
          return {
            name: label,
            value: (data.values || [])[i] || 0,
            itemStyle: { color: (data.colors || PALETTE)[i % PALETTE.length] }
          };
        }),
        label: { show: true, fontSize: 11, color: '#626262' },
        labelLine: { show: true, lineStyle: { color: '#DCDCDC' } },
        emphasis: { scale: true, scaleSize: 6, itemStyle: { shadowBlur: 12, shadowColor: 'rgba(0,0,0,.2)' } },
        animationType: 'scale',
        animationEasing: 'elasticOut'
      }]
    }));
    autoResize(chart);
    return chart;
  }

  /* ── PICTORIAL BAR (icon-shaped bars) ── */
  function pictorialBar(domId, data, options) {
    var chart = init(domId); if (!chart) return null;
    var opts = options || {};
    var symbol = opts.symbol || 'roundRect';
    var pSeries = (data.datasets || []);
    chart.setOption(Object.assign({}, ANIM, {
      tooltip: TOOLTIP_AXIS,
      legend: legendBottom(pSeries.length > 1),
      grid: { left: 48, right: 16, top: 24, bottom: pSeries.length > 1 ? 48 : 24, containLabel: false },
      xAxis: { type: 'category', data: data.labels || [], axisTick: { show: false } },
      yAxis: { type: 'value' },
      series: pSeries.map(function (ds, i) {
        return {
          name: ds.label || '',
          type: 'pictorialBar',
          data: ds.values || [],
          symbol: ds.symbol || symbol,
          symbolRepeat: opts.repeat || false,
          symbolSize: opts.symbolSize || ['80%', '60%'],
          symbolClip: true,
          itemStyle: { color: ds.color || colorAt(i) },
          emphasis: { itemStyle: { shadowBlur: 8, shadowColor: 'rgba(0,0,0,.12)' } }
        };
      })
    }));
    autoResize(chart);
    return chart;
  }

  /* ── CALENDAR HEATMAP ── */
  function calendarHeatmap(domId, data, options) {
    var chart = init(domId); if (!chart) return null;
    var opts = options || {};
    var minVal = Infinity, maxVal = -Infinity;
    (data.values || []).forEach(function (v) {
      if (v[1] < minVal) minVal = v[1];
      if (v[1] > maxVal) maxVal = v[1];
    });
    chart.setOption(Object.assign({}, ANIM, {
      tooltip: Object.assign({}, TOOLTIP_ITEM, {
        formatter: function (p) { return '<b>' + p.value[0] + '</b><br/>Events: ' + p.value[1]; }
      }),
      visualMap: {
        min: minVal, max: maxVal, calculable: true,
        orient: 'horizontal', left: 'center', bottom: 16,
        inRange: { color: opts.colorRange || ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'] },
        textStyle: { fontFamily: "'Zoho Puvi', sans-serif", fontSize: 11, color: '#626262' }
      },
      calendar: {
        top: 'center', left: 48, right: 16, bottom: 56,
        range: data.range || '2025',
        cellSize: opts.cellSize || ['auto', 18],
        splitLine: { lineStyle: { color: '#E9E9E9' } },
        itemStyle: { borderColor: '#fff', borderWidth: 2 },
        dayLabel: { fontSize: 11, color: '#626262', fontFamily: "'Zoho Puvi', sans-serif" },
        monthLabel: { fontSize: 11, color: '#626262', fontFamily: "'Zoho Puvi', sans-serif" },
        yearLabel: { show: false }
      },
      series: [{
        type: 'heatmap',
        coordinateSystem: 'calendar',
        data: data.values || [],
        emphasis: { itemStyle: { shadowBlur: 6, shadowColor: 'rgba(0,0,0,.2)' } }
      }]
    }));
    autoResize(chart);
    return chart;
  }

  /* ── WATERFALL (positive/negative delta bar) ── */
  function waterfall(domId, data, options) {
    var chart = init(domId); if (!chart) return null;
    var labels = data.labels || [];
    var values = data.values || [];
    var cumulative = []; var hidden = []; var positive = []; var negative = [];
    var running = 0;
    values.forEach(function (v, i) {
      if (i === 0 || i === values.length - 1) {
        hidden.push(0); positive.push(v > 0 ? v : 0); negative.push(v < 0 ? -v : 0);
        running = v;
      } else {
        if (v >= 0) { hidden.push(running); positive.push(v); negative.push(0); }
        else { hidden.push(running + v); positive.push(0); negative.push(-v); }
        running += v;
      }
      cumulative.push(running);
    });
    chart.setOption(Object.assign({}, ANIM, {
      tooltip: Object.assign({}, TOOLTIP_AXIS, {
        formatter: function (params) {
          var idx = params[0].dataIndex;
          return '<b>' + labels[idx] + '</b><br/>Value: ' + values[idx] + '<br/>Total: ' + cumulative[idx];
        }
      }),
      legend: Object.assign({}, legendBottom(true), { data: ['Increase', 'Decrease'] }),
      grid: { left: 48, right: 16, top: 24, bottom: 48, containLabel: false },
      xAxis: { type: 'category', data: labels },
      yAxis: { type: 'value' },
      series: [
        { name: '_hidden', type: 'bar', stack: 'wf', data: hidden, itemStyle: { color: 'transparent' }, emphasis: { itemStyle: { color: 'transparent' } } },
        { name: 'Increase', type: 'bar', stack: 'wf', data: positive, itemStyle: { color: '#198019', borderRadius: [2,2,0,0] }, emphasis: { itemStyle: { shadowBlur: 8 } } },
        { name: 'Decrease', type: 'bar', stack: 'wf', data: negative, itemStyle: { color: '#DD1616', borderRadius: [2,2,0,0] }, emphasis: { itemStyle: { shadowBlur: 8 } } }
      ]
    }));
    autoResize(chart);
    return chart;
  }

  /* ── GRAPH / NETWORK ── */
  function graph(domId, data, options) {
    var chart = init(domId); if (!chart) return null;
    var opts = options || {};
    chart.setOption(Object.assign({}, ANIM, {
      tooltip: TOOLTIP_ITEM,
      legend: legendBottom(!!(data.categories && data.categories.length)),
      series: [{
        type: 'graph',
        layout: opts.layout || 'force',
        data: (data.nodes || []).map(function (n, i) {
          return Object.assign({}, n, {
            symbolSize: n.size || 20,
            itemStyle: { color: n.color || colorAt(n.category || i) },
            label: { show: true, fontSize: 11, fontFamily: "'Zoho Puvi', sans-serif", color: '#000' }
          });
        }),
        links: data.links || [],
        categories: (data.categories || []).map(function (c, i) { return { name: c, itemStyle: { color: colorAt(i) } }; }),
        roam: true,
        force: { repulsion: opts.repulsion || 200, edgeLength: opts.edgeLength || [80, 160] },
        lineStyle: { color: '#DCDCDC', curveness: 0.1, opacity: 0.6 },
        emphasis: { focus: 'adjacency', lineStyle: { width: 3, opacity: 1 } },
        animationDuration: 1500,
        animationEasingUpdate: 'quinticInOut'
      }]
    }));
    autoResize(chart);
    return chart;
  }

  /* ── TEAM BOARD (responder cards — HTML widget) ── */
  function teamBoard(domId, data, options) {
    var dom = document.getElementById(domId);
    if (!dom) { console.warn('ElegantEChart.teamBoard: #' + domId + ' not found'); return null; }
    var opts = options || {};
    var members = data.members || [];
    var pageSize = opts.pageSize || 6;
    var page = 0;
    var totalPages = Math.ceil(members.length / pageSize);
    var iconBase = opts.iconBase || './assets/icons/';
    var unassignedAvatar = opts.unassignedAvatar || (iconBase + 'icon-avatar-unassigned.svg');
    var personAvatar = opts.personAvatar || (iconBase + 'icon-avatar-person.svg');

    function avatarImg(src, name) {
      return '<img src="' + src + '" alt="' + (name || '') + '" style="width:40px;height:40px;border-radius:50%;object-fit:cover;"/>';
    }

    function renderPage() {
      var start = page * pageSize;
      var visible = members.slice(start, start + pageSize);
      var cardsHtml = '';
      visible.forEach(function (m) {
        var isUnassigned = m.unassigned;
        var avatar = m.avatar
          ? avatarImg(m.avatar, m.name)
          : avatarImg(isUnassigned ? unassignedAvatar : personAvatar, m.name);
        var metricsHtml = '';
        if (!isUnassigned && m.mttr) {
          var slaColor = (m.slaViolations || 0) > 0 ? '#DD1616' : '#198019';
          metricsHtml =
            '<div class="tb-metrics">' +
              '<div class="tb-metric"><span class="tb-metric-label">MTTR</span><span class="tb-metric-val">' + m.mttr + '</span></div>' +
              '<div class="tb-metric"><span class="tb-metric-label">SLA Violations</span><span class="tb-metric-val" style="color:' + slaColor + '">' + (m.slaViolations || 0) + '</span></div>' +
            '</div>';
          var pct = m.slaPercent || 0;
          var barColor = pct > 50 ? '#DD1616' : pct > 25 ? '#FABB34' : '#198019';
          metricsHtml += '<div class="tb-bar"><div class="tb-bar-fill" style="width:' + pct + '%;background:linear-gradient(90deg,' + barColor + ',' + barColor + 'AA);"></div></div>';
        }
        cardsHtml +=
          '<div class="tb-card' + (isUnassigned ? ' tb-card--unassigned' : '') + '">' +
            '<div class="tb-card-top">' +
              '<div class="tb-avatar">' + avatar + '</div>' +
              (isUnassigned ? '' : '<div class="tb-right">' + metricsHtml + '</div>') +
            '</div>' +
            '<div class="tb-name">' + (m.name || 'Unknown') + '</div>' +
            '<div class="tb-count">' + (m.count || 0) + '</div>' +
          '</div>';
      });

      var pageInfo = (start + 1) + '-' + Math.min(start + pageSize, members.length) + ' of ' + members.length;
      dom.innerHTML =
        '<div class="tb-scroll">' + cardsHtml + '</div>' +
        '<div class="tb-pagination">' +
          '<span class="tb-page-info">' + pageInfo + '</span>' +
          '<button class="tb-page-btn tb-prev" ' + (page <= 0 ? 'disabled' : '') + '>‹</button>' +
          '<button class="tb-page-btn tb-next" ' + (page >= totalPages - 1 ? 'disabled' : '') + '>›</button>' +
        '</div>';

      dom.querySelector('.tb-prev').addEventListener('click', function () {
        if (page > 0) { page--; renderPage(); }
      });
      dom.querySelector('.tb-next').addEventListener('click', function () {
        if (page < totalPages - 1) { page++; renderPage(); }
      });
    }

    renderPage();
    return { refresh: renderPage, dom: dom };
  }

  /* ── ALERT LIST (scrollable recent alerts feed) ── */
  function alertList(domId, data, options) {
    var dom = document.getElementById(domId);
    if (!dom) return null;
    var opts = options || {};
    var iconBase = opts.iconBase || './assets/icons/';
    var alerts = data.alerts || [];

    var severityConfig = {
      critical: { icon: iconBase + 'icon-alert-critical.svg', badgeBg: '#FCE8E8', scoreColor: '#DD1616' },
      high:     { icon: iconBase + 'icon-alert-critical.svg', badgeBg: '#FCE8E8', scoreColor: '#DD1616' },
      medium:   { icon: iconBase + 'icon-alert-warning.svg',  badgeBg: '#FFDECC', scoreColor: '#FF5900' },
      low:      { icon: iconBase + 'icon-alert-warning.svg',  badgeBg: '#F7F0E6', scoreColor: '#FABB34' },
      verylow:  { icon: iconBase + 'icon-alert-warning.svg',  badgeBg: '#E8F2E8', scoreColor: '#198019' }
    };

    function sevKey(s) { return (s || '').toLowerCase().replace(/\s+/g, ''); }

    function renderAlerts() {
      var html = '<div class="al-scroll">';
      alerts.forEach(function (a) {
        var sk = sevKey(a.severity);
        var cfg = severityConfig[sk] || severityConfig.medium;
        var sevLabel = a.severity || 'Medium';
        var score = a.score != null ? a.score : '';

        html += '<div class="al-row">';
        html += '  <div class="al-head">';
        html += '    <div class="al-head-left">';
        html += '      <img class="al-sev-icon" src="' + cfg.icon + '" alt="' + sevLabel + '" />';
        html += '      <span class="al-title">' + (a.title || '') + '</span>';
        html += '      <span class="al-badge" style="background:' + cfg.badgeBg + ';">';
        html += '        <span class="al-badge-label">' + sevLabel + '</span>';
        if (score !== '') {
          html += '      <span class="al-badge-score" style="color:' + cfg.scoreColor + ';">' + score + '</span>';
        }
        html += '      </span>';
        html += '    </div>';

        if (a.tags && a.tags.length) {
          html += '  <div class="al-tags">';
          a.tags.forEach(function (t) {
            html += '<span class="al-tag" style="background:' + (t.bg || '#E8F0FE') + ';color:' + (t.color || '#2C66DD') + ';">' + t.label + '</span>';
          });
          html += '  </div>';
        }
        html += '  </div>';

        html += '  <div class="al-desc">' + (a.description || '') + '</div>';
        html += '  <div class="al-time"><img src="' + iconBase + 'icon-alert-clock.svg" alt="" class="al-clock-icon"/>' + (a.time || '') + '</div>';
        html += '</div>';
      });
      html += '</div>';
      dom.innerHTML = html;
    }

    renderAlerts();
    return { refresh: renderAlerts, dom: dom };
  }

  /* ── ANALYSIS WIDGET (KPI summary + top alert profiles) ── */
  function analysisWidget(domId, data, options) {
    var dom = document.getElementById(domId);
    if (!dom) return null;
    var opts = options || {};
    var iconBase = opts.iconBase || './assets/icons/';
    var summary = data.summary || {};
    var profiles = data.profiles || [];
    var subtitle = data.subtitle || 'Top 5 Alert Profiles';

    function render() {
      var html = '';
      /* ── top: summary KPIs + bell icon ── */
      html += '<div class="aw-top">';
      html += '<div class="aw-kpis">';
      (summary.kpis || []).forEach(function (k) {
        html += '<div class="aw-kpi">';
        if (k.type === 'duration') {
          html += '<div class="aw-kpi-val">';
          if (k.days != null) html += '<span class="aw-big">' + k.days + '</span><span class="aw-unit">Days</span>';
          if (k.hrs != null) html += '<span class="aw-big">' + k.hrs + '</span><span class="aw-unit">Hrs</span>';
          if (k.mins != null) html += '<span class="aw-big">' + k.mins + '</span><span class="aw-unit">Mins</span>';
          html += '</div>';
        } else {
          html += '<div class="aw-kpi-val"><span class="aw-big">' + (k.value || '') + '</span></div>';
        }
        html += '<div class="aw-kpi-label">' + (k.label || '') + '</div>';
        html += '</div>';
      });
      html += '</div>';
      if (summary.bellIcon !== false) {
        html += '<div class="aw-bell"><img src="' + iconBase + 'icon-analysis-bell.svg" alt=""/></div>';
      }
      html += '</div>';

      /* ── divider ── */
      html += '<div class="aw-divider"></div>';

      /* ── bottom: subtitle + profile cards ── */
      html += '<div class="aw-bottom">';
      html += '<div class="aw-subtitle">';
      html += '<span>' + subtitle + '</span>';
      html += '<img src="' + iconBase + 'icon-analysis-sort.svg" class="aw-sort-icon" alt=""/>';
      html += '</div>';
      html += '<div class="aw-profiles">';
      profiles.forEach(function (p) {
        var sevIcon = p.severity === 'orange' ? 'icon-analysis-sev-orange.svg' : 'icon-analysis-sev-yellow.svg';
        html += '<div class="aw-profile">';
        html += '<div class="aw-profile-head">';
        html += '<img src="' + iconBase + sevIcon + '" class="aw-profile-sev" alt=""/>';
        html += '<span class="aw-profile-name">' + (p.name || '') + '</span>';
        html += '</div>';
        html += '<div class="aw-profile-stats">';
        html += '<span class="aw-profile-count">' + (p.count || 0) + '</span>';
        html += '<span class="aw-profile-total">/' + (p.total || 0) + '</span>';
        html += '<span class="aw-profile-sep"></span>';
        html += '<span class="aw-profile-pct">' + (p.pct || '0%') + '</span>';
        html += '</div>';
        html += '</div>';
      });
      html += '</div>';
      html += '</div>';

      dom.innerHTML = html;
    }
    render();
    return { refresh: render, dom: dom };
  }

  /* ── METRICS WIDGET (KPI tiles with ring gauges) ── */
  function metricsDonutSVG(segments, size) {
    var r = (size || 60) / 2;
    var cx = r, cy = r, sw = 4;
    var ri = r - sw / 2;
    var total = 0;
    segments.forEach(function (s) { total += s.value; });
    if (total === 0) total = 1;
    var startAngle = -Math.PI / 2;
    var arcs = '';
    segments.forEach(function (s) {
      var sweep = (s.value / total) * 2 * Math.PI;
      var endAngle = startAngle + sweep;
      var x1 = cx + ri * Math.cos(startAngle);
      var y1 = cy + ri * Math.sin(startAngle);
      var x2 = cx + ri * Math.cos(endAngle);
      var y2 = cy + ri * Math.sin(endAngle);
      var largeArc = sweep > Math.PI ? 1 : 0;
      arcs += '<path d="M' + x1.toFixed(2) + ' ' + y1.toFixed(2) +
        ' A' + ri + ' ' + ri + ' 0 ' + largeArc + ' 1 ' +
        x2.toFixed(2) + ' ' + y2.toFixed(2) +
        '" stroke="' + s.color + '" stroke-width="' + sw +
        '" fill="none" stroke-linecap="round"/>';
      startAngle = endAngle + 0.03;
    });
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">' + arcs + '</svg>';
  }

  function metricsWidget(domId, data, options) {
    var dom = document.getElementById(domId);
    if (!dom) return null;
    var opts = options || {};
    var iconBase = opts.iconBase || './assets/icons/';
    var tiles = data.tiles || [];

    function render() {
      var html = '<div class="mw-row">';
      tiles.forEach(function (t, idx) {
        var isHighlight = t.highlight;
        var tileClass = 'mw-tile' + (isHighlight ? ' mw-tile--hl' : '');
        var hasSep = idx > 0 && idx % 2 === 0;
        if (hasSep) html += '<div class="mw-sep"></div>';

        html += '<div class="' + tileClass + '">';
        html += '<div class="mw-tile-left">';

        if (t.type === 'duration') {
          html += '<div class="mw-val-dur">';
          if (t.days != null) html += '<span class="mw-big">' + t.days + '</span><span class="mw-unit">Days</span>';
          if (t.hrs != null) html += '<span class="mw-big">' + t.hrs + '</span><span class="mw-unit">Hrs</span>';
          if (t.mins != null) html += '<span class="mw-big">' + t.mins + '</span><span class="mw-unit">Mins</span>';
          html += '</div>';
        } else {
          html += '<div class="mw-val-count">';
          html += '<span class="mw-big">' + (t.value || 0) + '</span>';
          if (t.trend) {
            var trendUp = t.trend > 0;
            var trendColor = trendUp ? '#DD1616' : '#198019';
            html += '<span class="mw-trend" style="background:' + trendColor + '1a;">';
            html += '<img src="' + iconBase + 'icon-metric-trend-up.svg" class="mw-trend-icon"';
            if (!trendUp) html += ' style="transform:scaleY(-1);filter:hue-rotate(120deg);"';
            html += '/>';
            html += '<span style="color:' + trendColor + ';">' + Math.abs(t.trend) + '%</span>';
            html += '</span>';
          }
          html += '</div>';
        }
        html += '<div class="mw-label">' + (t.label || '') + '</div>';
        html += '</div>';

        html += '<div class="mw-tile-right">';
        if (t.type === 'duration') {
          html += '<img src="' + iconBase + 'icon-metric-clock.svg" class="mw-ring" alt=""/>';
        } else if (t.ring) {
          html += metricsDonutSVG(t.ring, 60);
        }
        html += '</div>';
        html += '</div>';
      });
      html += '</div>';
      dom.innerHTML = html;
    }
    render();
    return { refresh: render, dom: dom };
  }

  /* ── ALERT CARD VARIANTS (Type 1 / 2 / 3) ── */
  var ALERT_SEV_CFG = {
    critical: { icon: 'icon-alert-critical.svg', badgeBg: '#EFDFDD', scoreColor: '#95291D' },
    high:     { icon: 'icon-alert-critical.svg', badgeBg: '#FCE8E8', scoreColor: '#DD1616' },
    medium:   { icon: 'icon-alert-warning.svg',  badgeBg: '#FFDECC', scoreColor: '#FF5900' },
    low:      { icon: 'icon-alert-warning.svg',  badgeBg: '#F7F0E6', scoreColor: '#FABB34' },
    verylow:  { icon: 'icon-alert-warning.svg',  badgeBg: '#E8F2E8', scoreColor: '#198019' }
  };

  function alertCardHead(a, iconBase) {
    var sk = (a.severity || '').toLowerCase().replace(/\s+/g, '');
    var cfg = ALERT_SEV_CFG[sk] || ALERT_SEV_CFG.medium;
    var h = '';
    h += '<div class="ac-head">';
    h += '  <img class="ac-sev-icon" src="' + iconBase + cfg.icon + '" alt=""/>';
    h += '  <span class="ac-title">' + (a.title || '') + '</span>';
    h += '  <span class="ac-badge" style="background:' + cfg.badgeBg + ';">';
    h += '    <span class="ac-badge-label">' + (a.severity || '') + '</span>';
    if (a.score != null) h += ' <span class="ac-badge-score" style="color:' + cfg.scoreColor + ';">' + a.score + '</span>';
    h += '  </span>';
    h += '</div>';
    h += '<div class="ac-desc">' + (a.description || '') + '</div>';
    return h;
  }

  function alertType1(domId, data, options) {
    var dom = document.getElementById(domId);
    if (!dom) return null;
    var opts = options || {};
    var iconBase = opts.iconBase || './assets/icons/';
    var alerts = data.alerts || [];

    function render() {
      var html = '<div class="ac-scroll">';
      alerts.forEach(function (a) {
        html += '<div class="ac-row">';
        html += alertCardHead(a, iconBase);
        html += '<div class="ac-footer">';
        html += '  <div class="ac-time"><img src="' + iconBase + 'icon-alert-clock.svg" class="ac-icon-sm"/>' + (a.time || '') + '</div>';
        if (a.age) {
          html += '  <div class="ac-age"><img src="' + iconBase + 'icon-alert-calendar.svg" class="ac-icon-md"/>';
          if (a.age.days != null) html += '<span class="ac-age-val">' + a.age.days + '</span><span class="ac-age-unit">Days</span>';
          if (a.age.hrs != null) html += '<span class="ac-age-val">' + a.age.hrs + '</span><span class="ac-age-unit">Hrs</span>';
          if (a.age.mins != null) html += '<span class="ac-age-val">' + a.age.mins + '</span><span class="ac-age-unit">Mins</span>';
          html += '  </div>';
        }
        html += '</div>';
        html += '<div class="ac-footer">';
        if (a.assignee) {
          html += '  <div class="ac-assignee"><img src="' + iconBase + 'icon-alert-avatar-small.svg" class="ac-avatar"/>' + a.assignee + '</div>';
        }
        html += '  <div class="ac-status-btn"><span>Open</span><svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2.35547 3.92773L5.49833 7.07059L8.64118 3.92773" stroke="#2C66DD" stroke-linecap="round" stroke-linejoin="round"/></svg></div>';
        html += '</div>';
        html += '</div>';
      });
      html += '</div>';
      dom.innerHTML = html;
    }
    render();
    return { refresh: render, dom: dom };
  }

  function alertType2(domId, data, options) {
    var dom = document.getElementById(domId);
    if (!dom) return null;
    var opts = options || {};
    var iconBase = opts.iconBase || './assets/icons/';
    var alerts = data.alerts || [];

    function render() {
      var html = '<div class="ac-scroll">';
      alerts.forEach(function (a) {
        html += '<div class="ac-row">';
        html += alertCardHead(a, iconBase);
        html += '<div class="ac-time"><img src="' + iconBase + 'icon-alert-clock.svg" class="ac-icon-sm"/>' + (a.time || '') + '</div>';
        html += '<div class="ac-footer">';
        html += '  <div class="ac-status-btn"><span>Open</span><svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2.35547 3.92773L5.49833 7.07059L8.64118 3.92773" stroke="#2C66DD" stroke-linecap="round" stroke-linejoin="round"/></svg></div>';
        if (a.sla) {
          html += '  <div class="ac-sla"><img src="' + iconBase + 'icon-alert-hourglass.svg" class="ac-icon-md"/><span class="ac-sla-text">' + a.sla + '</span></div>';
        }
        html += '</div>';
        html += '</div>';
      });
      html += '</div>';
      dom.innerHTML = html;
    }
    render();
    return { refresh: render, dom: dom };
  }

  function alertType3(domId, data, options) {
    var dom = document.getElementById(domId);
    if (!dom) return null;
    var opts = options || {};
    var iconBase = opts.iconBase || './assets/icons/';
    var alerts = data.alerts || [];

    function render() {
      var html = '<div class="ac-scroll">';
      alerts.forEach(function (a) {
        html += '<div class="ac-row">';
        html += alertCardHead(a, iconBase);
        html += '<div class="ac-time"><img src="' + iconBase + 'icon-alert-clock.svg" class="ac-icon-sm"/>' + (a.time || '') + '</div>';
        html += '<div class="ac-footer">';
        html += '  <div class="ac-status-btn"><span>Open</span><svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2.35547 3.92773L5.49833 7.07059L8.64118 3.92773" stroke="#2C66DD" stroke-linecap="round" stroke-linejoin="round"/></svg></div>';
        if (a.sla) {
          var isViolated = a.sla.indexOf('Violated') >= 0;
          html += '  <div class="ac-sla"><img src="' + iconBase + 'icon-alert-hourglass.svg" class="ac-icon-md"/>';
          html += '    <span class="ac-sla-text' + (isViolated ? '' : ' ac-sla-text--info') + '">' + a.sla + '</span>';
          html += '  </div>';
        }
        html += '</div>';
        html += '</div>';
      });
      html += '</div>';
      dom.innerHTML = html;
    }
    render();
    return { refresh: render, dom: dom };
  }

  /* ── SUSPECT LIST (Top N suspects with segmented risk bar) ── */
  function suspectList(domId, data, options) {
    var dom = document.getElementById(domId);
    if (!dom) return null;
    var suspects = data.suspects || [];
    var segColors = (data.segmentColors || ['#C1181B', '#FF5900', '#FABB34']);
    var trackColor = data.trackColor || '#EAF0FC';

    function scoreColor(score) {
      if (score >= 80) return '#DD1616';
      if (score >= 60) return '#AC2001';
      if (score >= 40) return '#FF5900';
      if (score >= 20) return '#F4B835';
      return '#FABB34';
    }

    function render() {
      var html = '<div class="sp-list">';
      suspects.forEach(function (s, idx) {
        var sc = s.score != null ? s.score : 0;
        var sColor = scoreColor(sc);
        var segs = s.segments || [];
        var total = segs.reduce(function (a, b) { return a + b; }, 0);
        var barPercent = total > 0 ? Math.min(100, (total / (s.count || total)) * 100) : sc;

        html += '<div class="sp-row">';
        html += '  <div class="sp-top">';
        html += '    <span class="sp-name">' + (s.name || '') + '</span>';
        html += '    <span class="sp-count">' + (s.count != null ? s.count : '') + '</span>';
        html += '  </div>';
        html += '  <div class="sp-bottom">';
        html += '    <div class="sp-bar-wrap">';
        html += '      <div class="sp-bar-track" style="background:' + trackColor + ';">';

        if (segs.length && total > 0) {
          var filled = 0;
          segs.forEach(function (seg, si) {
            var pct = (seg / (s.count || total)) * 100;
            html += '<div class="sp-bar-seg" style="width:' + pct + '%;background:' + segColors[si % segColors.length] + ';"></div>';
            filled += pct;
          });
        } else {
          html += '<div class="sp-bar-seg" style="width:' + barPercent + '%;background:' + sColor + ';"></div>';
        }

        html += '      </div>';
        html += '    </div>';
        html += '    <div class="sp-score">';
        html += '      <div class="sp-score-bar" style="background:' + sColor + ';"></div>';
        html += '      <span class="sp-score-num" style="color:' + sColor + ';">' + sc + '</span>';
        html += '    </div>';
        html += '  </div>';
        html += '</div>';

        if (idx < suspects.length - 1) {
          html += '<div class="sp-divider"></div>';
        }
      });
      html += '</div>';
      dom.innerHTML = html;
    }

    render();
    return { refresh: render, dom: dom };
  }

  /* ── SUMMARY WITH CHART WIDGET (KPI tiles + stacked area) ── */
  function summaryChartWidget(domId, data, options) {
    var dom = document.getElementById(domId);
    if (!dom) return null;
    var opts = options || {};
    var iconBase = opts.iconBase || './assets/icons/';
    var tiles = data.tiles || [];
    var chartData = data.chart || {};
    var chartId = domId + '-chart';

    var html = '';

    /* ── KPI tiles row ── */
    html += '<div class="sw-top">';
    html += '<div class="sw-tiles">';
    tiles.forEach(function (t, i) {
      var hl = i === 0 ? ' sw-tile--hl' : '';
      html += '<div class="sw-tile' + hl + '">';
      html += '<div class="sw-tile-row">';
      html += '<span class="sw-val">' + (t.value || '') + '</span>';
      if (t.trend != null) {
        html += '<span class="sw-trend">';
        html += '<img src="' + iconBase + 'icon-metric-trend-up.svg" class="sw-trend-icon" alt=""/>';
        html += '<span class="sw-trend-text">' + t.trend + '</span>';
        html += '</span>';
      }
      html += '</div>';
      html += '<div class="sw-label">' + (t.label || '');
      if (t.icon) html += ' <img src="' + iconBase + t.icon + '" class="sw-label-icon" alt=""/>';
      html += '</div>';
      html += '</div>';
    });
    html += '</div>';
    if (opts.bellIcon !== false) {
      html += '<div class="sw-bell"><img src="' + iconBase + 'icon-summary-bell.svg" alt=""/></div>';
    }
    html += '</div>';

    /* ── Chart container ── */
    html += '<div class="sw-chart" id="' + chartId + '"></div>';

    dom.innerHTML = html;

    /* ── Render ECharts stacked area inside ── */
    var chartDom = document.getElementById(chartId);
    if (!chartDom || !chartData.labels) return { refresh: render, dom: dom };

    var chart = echarts.init(chartDom);
    var seriesColors = chartData.colors || ['#E91F1F', '#FF8E36', '#FFC600'];

    var series = (chartData.datasets || []).map(function (ds, i) {
      var c = ds.color || seriesColors[i] || colorAt(i);
      return {
        name: ds.label || '',
        type: 'line',
        data: ds.values || [],
        smooth: true,
        stack: 'total',
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: hexToRgba(c, 0.45) },
            { offset: 1, color: hexToRgba(c, 0.03) }
          ])
        },
        lineStyle: { width: 2, color: c },
        itemStyle: { color: c },
        showSymbol: false,
        emphasis: { focus: 'series', lineStyle: { width: 3 } }
      };
    });

    chart.setOption(Object.assign({}, ANIM, {
      tooltip: Object.assign({}, TOOLTIP_AXIS, {
        axisPointer: { type: 'cross', crossStyle: { color: '#E9E9E9' } }
      }),
      legend: {
        show: true, bottom: 4, left: 'center',
        icon: 'circle', itemWidth: 8, itemHeight: 8, itemGap: 24,
        textStyle: { fontSize: 11, color: '#000' }
      },
      grid: { left: 48, right: 16, top: 16, bottom: 40, containLabel: false },
      xAxis: {
        type: 'category', data: chartData.labels || [], boundaryGap: false,
        axisLabel: { fontSize: 11, color: '#626262' },
        axisLine: { lineStyle: { color: '#DCDCDC' } }
      },
      yAxis: {
        type: 'value',
        name: chartData.yAxisName || 'Alerts Count',
        nameLocation: 'middle', nameGap: 36,
        nameTextStyle: { fontSize: 11, color: '#626262' },
        axisLabel: { fontSize: 11, color: '#626262' },
        splitLine: { lineStyle: { color: '#F0F0F0' } }
      },
      series: series
    }));

    instances[chartId] = chart;
    autoResize(chart);

    function render() {
      dom.innerHTML = '';
      summaryChartWidget(domId, data, options);
    }

    return { refresh: render, dom: dom, chart: chart };
  }

  /* ── SUMMARY TEXT-ONLY WIDGET (bullet-point executive summary) ── */
  function summaryTextWidget(domId, data, options) {
    var dom = document.getElementById(domId);
    if (!dom) return null;
    var items = data.items || [];

    function render() {
      var html = '<div class="st-scroll">';
      items.forEach(function (item) {
        html += '<div class="st-item">';
        html += '<span class="st-bullet"></span>';
        html += '<span class="st-text">' + (item.text || '') + '</span>';
        html += '</div>';
      });
      html += '</div>';
      dom.innerHTML = html;
    }

    render();
    return { refresh: render, dom: dom };
  }

  /* ── TILE WIDGET (dashboard KPI tiles — 10 types) ── */
  function tileWidget(domId, data, options) {
    var dom = document.getElementById(domId);
    if (!dom) return null;
    var opts = options || {};
    var type = opts.type || 1;
    var iconBase = opts.iconBase || './assets/icons/';
    var h = '';

    var SEV_ICONS = {
      critical: 'icon-tile-sev-critical.svg',
      trouble: 'icon-tile-sev-trouble.svg',
      attention: 'icon-tile-sev-attention.svg'
    };

    function trendHtml(val, color) {
      var c = color || '#DD1616';
      var dir = c === '#198019' ? 'down' : 'up';
      var rot = dir === 'down' ? ' style="transform:scaleY(-1)"' : '';
      return '<span class="ti-trend" style="color:' + c + '"><img src="' + iconBase + 'icon-metric-trend-up.svg" class="ti-trend-icon"' + rot + ' alt=""/>' + val + '</span>';
    }

    function sevRow(items) {
      var s = '<div class="ti-sev-row">';
      items.forEach(function (it) {
        s += '<span class="ti-sev"><img src="' + iconBase + SEV_ICONS[it.sev] + '" class="ti-sev-icon" alt=""/><b>' + it.value + '</b></span>';
      });
      s += '</div>';
      return s;
    }

    function sparkSvg(color) {
      var c = color || '#DD1616';
      return '<svg class="ti-spark" viewBox="0 0 120 40" preserveAspectRatio="none"><defs><linearGradient id="sg' + domId + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="' + c + '" stop-opacity="0.18"/><stop offset="100%" stop-color="' + c + '" stop-opacity="0.02"/></linearGradient></defs><path d="M0 38 Q10 35 20 30 T40 25 T60 15 T80 8 T100 12 T120 5" fill="none" stroke="' + c + '" stroke-width="1.5"/><path d="M0 38 Q10 35 20 30 T40 25 T60 15 T80 8 T100 12 T120 5 V40 H0 Z" fill="url(#sg' + domId + ')"/></svg>';
    }

    if (type === 1) {
      h += '<div class="ti ti-wide ti-1">';
      h += '<div class="ti-1-left">';
      h += '<div class="ti-val-row"><span class="ti-big">' + data.value + '</span>' + trendHtml(data.trend) + '</div>';
      h += '</div>';
      h += '<div class="ti-1-spark">' + sparkSvg() + '</div>';
      h += '<div class="ti-1-right">';
      h += '<div class="ti-1-sev-row"><span class="ti-label-sm">Alert Severity</span>' + sevRow(data.severity || []) + '</div>';
      h += '<div class="ti-1-divider"></div>';
      h += '<div class="ti-1-meta-row">';
      if (data.slaViolated != null) h += '<span class="ti-meta"><span class="ti-label-sm">SLA Violated</span> <img src="' + iconBase + 'icon-alert-schedule.svg" class="ti-icon-sm" alt=""/> <img src="' + iconBase + 'icon-alert-hourglass.svg" class="ti-icon-sm" alt=""/> <b>' + data.slaViolated + '</b></span>';
      if (data.mutedAlerts != null) h += '<span class="ti-meta"><span class="ti-label-sm">Muted Alerts</span> <img src="' + iconBase + 'icon-tile-muted.svg" class="ti-icon-sm" alt=""/> <b>' + data.mutedAlerts + '</b></span>';
      h += '</div></div></div>';
    }

    else if (type === 2) {
      h += '<div class="ti ti-wide ti-2">';
      var bars = data.bars || [];
      h += '<div class="ti-bars-track">';
      bars.forEach(function (b) {
        h += '<div class="ti-bars-seg" style="flex:' + b.flex + ';background:' + b.color + '"></div>';
      });
      h += '</div>';
      h += '<div class="ti-bars">';
      bars.forEach(function (b) {
        h += '<div class="ti-bar-col">';
        h += '<div class="ti-bar-val">' + b.value + '</div>';
        h += '<div class="ti-bar-label"><span class="ti-bar-dot" style="background:' + b.dotColor + '"></span> ' + b.label + '  ' + b.range + '</div>';
        h += '</div>';
      });
      h += '</div></div>';
    }

    else if (type === 3) {
      h += '<div class="ti ti-wide ti-3">';
      h += '<div class="ti-left">';
      h += '<div class="ti-val-row"><span class="ti-big">' + data.value + '</span>' + trendHtml(data.trend) + '</div>';
      h += '</div>';
      h += '<div class="ti-mid">' + sparkSvg() + '</div>';
      h += '<div class="ti-right ti-cols">';
      (data.columns || []).forEach(function (col) {
        h += '<div class="ti-col" style="border-left:3px solid ' + col.color + '"><div class="ti-col-label">' + col.label + '</div><div class="ti-col-row"><img src="' + iconBase + SEV_ICONS[col.sev] + '" class="ti-sev-icon" alt=""/><b class="ti-col-val">' + col.value + '</b></div></div>';
      });
      h += '</div></div>';
    }

    else if (type === 4) {
      h += '<div class="ti ti-half ti-4">';
      h += '<div class="ti-dur">';
      (data.parts || []).forEach(function (p) {
        h += '<span class="ti-dur-big">' + p.value + '</span><span class="ti-dur-unit">' + p.unit + '</span>';
      });
      h += '</div>';
      h += '<img src="' + iconBase + 'icon-metric-clock.svg" class="ti-icon-lg" alt=""/>';
      h += '</div>';
    }

    else if (type === 5) {
      h += '<div class="ti ti-half ti-5">';
      h += '<div class="ti-5-left"><span class="ti-big">' + data.value + '</span>';
      var segs = data.segments || [];
      h += '<div class="ti-seg-bar">';
      segs.forEach(function (s) { h += '<div class="ti-seg" style="flex:' + s.flex + ';background:' + s.color + '"></div>'; });
      h += '</div></div>';
      h += '<img src="' + iconBase + 'icon-alert-hourglass.svg" class="ti-icon-lg ti-icon-hg" alt=""/>';
      h += '</div>';
    }

    else if (type === 6) {
      var sparkColor = data.sparkColor || '#DD1616';
      h += '<div class="ti ti-half ti-6">';
      h += '<div class="ti-val-row"><span class="ti-big">' + data.value + '</span>' + trendHtml(data.trend, data.trendColor) + '</div>';
      h += '<img src="' + iconBase + 'icon-summary-bell.svg" class="ti-icon-bell" alt=""/>';
      h += '<div class="ti-spark-full">' + sparkSvg(sparkColor) + '</div>';
      h += '</div>';
    }

    else if (type === 7) {
      var sc7 = data.sparkColor || '#198019';
      h += '<div class="ti ti-half ti-7">';
      h += '<div class="ti-val-row">';
      (data.parts || []).forEach(function (p) {
        h += '<span class="ti-dur-big" style="color:' + (data.trendColor || '#198019') + '">' + p.value + '</span><span class="ti-dur-unit">' + p.unit + '</span>';
      });
      h += trendHtml(data.trend, data.trendColor || '#198019');
      h += '</div>';
      if (data.subtitle) h += '<div class="ti-sub">' + data.subtitle + '</div>';
      h += '<div class="ti-spark-full">' + sparkSvg(sc7) + '</div>';
      h += '</div>';
    }

    else if (type === 8) {
      h += '<div class="ti ti-half ti-8">';
      h += '<div class="ti-8-top"><div class="ti-val-row"><span class="ti-big">' + data.value + '</span>' + trendHtml(data.trend, data.trendColor || '#198019') + '</div>';
      if (data.icon) h += '<img src="' + iconBase + data.icon + '" class="ti-8-icon" alt=""/>';
      h += '</div>';
      if (data.progress) {
        h += '<div class="ti-prog-row"><span class="ti-label-sm">' + data.progress.label + '</span><span class="ti-prog-pct">' + data.progress.pct + '</span></div>';
        h += '<div class="ti-prog-bar"><div class="ti-prog-fill" style="width:' + data.progress.pct + ';background:linear-gradient(90deg,#2C66DD 0%,#8B5CF6 60%,#06B6D4 100%)"></div></div>';
      }
      h += '<div class="ti-label-sm" style="margin-top:8px">Alert Severity</div>' + sevRow(data.severity || []);
      h += '</div>';
    }

    else if (type === 9) {
      h += '<div class="ti ti-half ti-9">';
      h += '<div class="ti-9-top">';
      h += '<div><div class="ti-val-row"><span class="ti-big">' + data.value + '</span>' + trendHtml(data.trend, data.trendColor || '#198019') + '</div>';
      if (data.subtitle) h += '<div class="ti-sub">' + data.subtitle + '</div>';
      h += '</div>';
      if (data.ringPct != null) {
        h += '<div class="ti-ring"><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15.9" fill="none" stroke="#E9E9E9" stroke-width="3"/><circle cx="18" cy="18" r="15.9" fill="none" stroke="#2C66DD" stroke-width="3" stroke-dasharray="' + data.ringPct + ' ' + (100 - data.ringPct) + '" stroke-dashoffset="25" stroke-linecap="round"/></svg><span class="ti-ring-val">' + data.ringPct + '%</span></div>';
      }
      h += '</div>';
      h += '<div class="ti-status-cards">';
      (data.cards || []).forEach(function (c) {
        h += '<div class="ti-status-card"><div class="ti-sc-label">' + c.label + '</div><div class="ti-sc-row"><img src="' + iconBase + (c.icon || 'icon-alert-warning.svg') + '" class="ti-sc-icon" alt=""/><b>' + c.value + '</b></div></div>';
      });
      h += '</div></div>';
    }

    else if (type === 10) {
      h += '<div class="ti ti-half ti-10">';
      h += '<div class="ti-10-top">';
      h += '<div><span class="ti-big">' + data.value + '</span>';
      if (data.change) h += '<div class="ti-change"><span class="ti-change-arrow">&#9650;</span> ' + data.change + '</div>';
      h += '</div>';
      if (data.donut) {
        h += '<div class="ti-mini-donut"><svg viewBox="0 0 36 36">';
        var offset = 0;
        data.donut.forEach(function (d) {
          h += '<circle cx="18" cy="18" r="14" fill="none" stroke="' + d.color + '" stroke-width="4" stroke-dasharray="' + d.pct + ' ' + (100 - d.pct) + '" stroke-dashoffset="' + (-offset + 25) + '"/>';
          offset += d.pct;
        });
        h += '</svg></div>';
      }
      h += '</div>';
      h += '<div class="ti-legend-row">';
      (data.legend || []).forEach(function (l) {
        h += '<span class="ti-leg"><span class="ti-leg-dot" style="background:' + l.color + '"></span>' + l.label + ' <b>' + l.value + '</b></span>';
      });
      h += '</div></div>';
    }

    dom.innerHTML = h;
    return { dom: dom, refresh: function () { tileWidget(domId, data, options); } };
  }

  /* ── GEOGRAPHICAL WIDGET (world map with scatter pins) ── */
  var PIN_PATH = 'M14.0664 6.17969C14.0664 11.6395 8 15.8859 8 15.8859C8 15.8859 1.93359 11.6395 1.93359 6.17969C1.93359 4.57078 2.57273 3.02776 3.7104 1.89009C4.84807 0.752419 6.39109 0.113281 8 0.113281C9.60891 0.113281 11.1519 0.752419 12.2896 1.89009C13.4273 3.02776 14.0664 4.57078 14.0664 6.17969Z';

  var GEO_SEV_COLORS = {
    critical: '#E91F1F',
    trouble: '#FF8E36',
    attention: '#FFC600'
  };

  function geoWidget(domId, data, options) {
    var dom = document.getElementById(domId);
    if (!dom) return null;
    var opts = options || {};
    var mapJsonUrl = opts.mapJsonUrl || './predefined-components/lib/world.json';
    var tabs = opts.tabs || ['Overview', 'Alerts Timeline View'];
    var regionLabel = opts.regionLabel || 'World';
    var chartId = domId + '-map';
    var markers = data.markers || [];

    var html = '';
    html += '<div class="gw-controls">';
    html += '<div class="gw-tabs">';
    tabs.forEach(function (t, i) {
      html += '<button class="gw-tab' + (i === 0 ? ' gw-tab--active' : '') + '">' + t + '</button>';
    });
    html += '</div>';
    html += '<div class="gw-region"><span>' + regionLabel + '</span><svg width="10" height="6" viewBox="0 0 10 6"><path d="M1 1L5 5L9 1" stroke="#626262" stroke-width="1.2" fill="none" stroke-linecap="round"/></svg></div>';
    html += '</div>';
    html += '<div class="gw-map" id="' + chartId + '"></div>';
    html += '<div class="gw-legend">';
    html += '<span class="gw-legend-item"><span class="gw-legend-dot" style="background:#E91F1F"></span>Critical</span>';
    html += '<span class="gw-legend-item"><span class="gw-legend-dot" style="background:#FF8E36"></span>Trouble</span>';
    html += '<span class="gw-legend-item"><span class="gw-legend-dot" style="background:#FFC600"></span>Attention</span>';
    html += '</div>';

    dom.innerHTML = html;

    var tabBtns = dom.querySelectorAll('.gw-tab');
    tabBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        tabBtns.forEach(function (b) { b.classList.remove('gw-tab--active'); });
        btn.classList.add('gw-tab--active');
      });
    });

    var chartDom = document.getElementById(chartId);
    if (!chartDom) return { dom: dom };

    function buildChart(geoJson) {
      echarts.registerMap('world', geoJson);
      var chart = echarts.init(chartDom);

      var seriesMap = {};
      markers.forEach(function (m) {
        var sev = m.severity || 'critical';
        if (!seriesMap[sev]) seriesMap[sev] = [];
        seriesMap[sev].push({
          name: m.name || '',
          value: [m.lng, m.lat, m.value || 1]
        });
      });

      var series = Object.keys(GEO_SEV_COLORS).map(function (sev) {
        return {
          name: sev.charAt(0).toUpperCase() + sev.slice(1),
          type: 'scatter',
          coordinateSystem: 'geo',
          data: seriesMap[sev] || [],
          symbol: 'path://' + PIN_PATH,
          symbolSize: 14,
          itemStyle: { color: GEO_SEV_COLORS[sev] },
          emphasis: {
            scale: true, itemStyle: { shadowBlur: 8, shadowColor: 'rgba(0,0,0,.3)' }
          }
        };
      });

      chart.setOption(Object.assign({}, ANIM, {
        tooltip: {
          trigger: 'item',
          formatter: function (p) {
            return '<b>' + p.name + '</b><br/>' + p.seriesName + ': ' + (p.value[2] || 1) + ' alerts';
          }
        },
        geo: {
          map: 'world',
          roam: true,
          silent: false,
          itemStyle: {
            areaColor: '#E0E0E0',
            borderColor: '#FFFFFF',
            borderWidth: 1
          },
          emphasis: {
            itemStyle: { areaColor: '#D0D0D0' },
            label: { show: false }
          },
          label: { show: false },
          zoom: 1.2,
          center: [20, 10]
        },
        series: series
      }));

      instances[chartId] = chart;
      autoResize(chart);
      return chart;
    }

    var preRegistered = (typeof echarts !== 'undefined') && echarts.getMap && echarts.getMap('world');
    if (preRegistered) {
      buildChart(preRegistered.geoJSON || preRegistered.geoJson || preRegistered);
    } else {
      fetch(mapJsonUrl)
        .then(function (r) { return r.json(); })
        .then(function (geoJson) { buildChart(geoJson); })
        .catch(function (err) {
          chartDom.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#626262;font-size:12px;">Map data could not be loaded</div>';
        });
    }

    return { dom: dom };
  }

  /* ── TANGENTIAL POLAR BAR (standard ECharts polar bar — label position middle) ── */
  function tangentialPolarBar(domId, data, options) {
    var chart = init(domId); if (!chart) return null;
    var opts = options || {};
    var categories = data.categories || [];
    var datasets = data.datasets || data.series || [];

    var eSeries = datasets.map(function (ds, i) {
      return {
        name: ds.label || ds.name || '',
        type: 'bar',
        coordinateSystem: 'polar',
        roundCap: opts.roundCap !== false,
        data: ds.values || ds.data || [],
        itemStyle: { color: ds.color || colorAt(i) },
        barWidth: opts.barWidth || 10,
        barGap: opts.barGap || '35%',
        barCategoryGap: opts.barCategoryGap || '50%',
        emphasis: { itemStyle: { shadowBlur: 8, shadowColor: 'rgba(0,0,0,.18)' } },
        label: {
          show: opts.showLabels !== false,
          position: opts.labelPosition || 'middle',
          fontSize: 11,
          fontWeight: 500,
          fontFamily: "'Zoho Puvi', sans-serif",
          color: '#FFFFFF',
          formatter: function (p) { return p.value > 0 ? p.value : ''; }
        }
      };
    });

    var maxVal = opts.max;
    if (!maxVal) {
      datasets.forEach(function (ds) {
        (ds.values || ds.data || []).forEach(function (v) { if (v > maxVal) maxVal = v; });
      });
      maxVal = Math.ceil((maxVal || 100) * 1.25);
    }

    var catLabelElements = [];
    if (opts.showCategoryLabels !== false && categories.length > 0) {
      var positions = opts.categoryLabelPositions || [];
      for (var ci = 0; ci < categories.length; ci++) {
        var pos = positions[ci] || {};
        catLabelElements.push({
          type: 'text',
          left: pos.x != null ? pos.x : '30%',
          top: pos.y != null ? pos.y : (50 - 15 * (categories.length - 1) / 2 + 15 * ci) + '%',
          style: {
            text: categories[ci],
            fontSize: 12,
            fontWeight: 500,
            fontFamily: "'Zoho Puvi', sans-serif",
            fill: '#626262',
            textAlign: pos.align || 'right',
            textVerticalAlign: 'middle'
          },
          zlevel: 10,
          z: 100
        });
      }
    }

    chart.setOption(Object.assign({}, ANIM, {
      tooltip: Object.assign({}, TOOLTIP_ITEM, {
        trigger: 'item',
        formatter: function (p) {
          return '<b>' + p.seriesName + '</b><br/>' +
                 categories[p.dataIndex] + ': ' + p.value;
        }
      }),
      legend: legendBottom(datasets.length > 1),
      graphic: catLabelElements.length > 0 ? { elements: catLabelElements } : undefined,
      polar: {
        radius: opts.radius || [30, '80%'],
        center: opts.center || ['50%', '50%']
      },
      angleAxis: {
        max: maxVal,
        startAngle: opts.startAngle || 90,
        show: false,
        splitLine: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false }
      },
      radiusAxis: {
        type: 'category',
        data: categories,
        z: 10,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false }
      },
      series: eSeries
    }));
    autoResize(chart);
    return chart;
  }

  /* ── DISPOSE ── */
  function dispose(domId) {
    if (instances[domId]) {
      if (instances[domId].__elegantResizeHandler) {
        window.removeEventListener('resize', instances[domId].__elegantResizeHandler);
      }
      instances[domId].dispose();
      delete instances[domId];
    }
  }

  /* ── RISK DISTRIBUTION (polar + sunburst/gauge + radar composite) ── */
  function riskDistribution(domId, data, options) {
    var dom = document.getElementById(domId);
    if (!dom) return null;
    var FONT = "'Zoho Puvi', sans-serif";
    var opts = options || {};
    var d = data || {};

    var polarData = d.polar || {};
    var sunburstData = d.sunburst || {};
    var radarData = d.radar || {};
    var sevColors = d.severityColors || ['#DD1616', '#FB5901', '#FABB34'];

    var sunburstOnly = !!d.sunburstOnly;

    if (sunburstOnly) {
      dom.innerHTML =
        '<div style="width:100%;height:100%;">' +
          '<div id="' + domId + '-sunburst" style="width:100%;height:100%;position:relative;"></div>' +
        '</div>';
    } else {
      dom.innerHTML =
        '<div style="display:flex;gap:0;width:100%;height:100%;align-items:stretch;">' +
          '<div id="' + domId + '-polar" style="flex:0 0 20%;min-width:0;"></div>' +
          '<div id="' + domId + '-sunburst" style="flex:1;min-width:0;position:relative;"></div>' +
          '<div id="' + domId + '-radar" style="flex:0 0 20%;min-width:0;"></div>' +
        '</div>';
    }

    /* ── POLAR (Risk Velocity) ── */
    var polarChart = null;
    if (!sunburstOnly) {
    polarChart = init(domId + '-polar');
    if (polarChart) {
      var pLabels = polarData.labels || ['1Sep','2Sep','3Sep','4Sep','5Sep','6Sep','7Sep','8Sep','9Sep','10Sep'];
      var pDatasets = polarData.datasets || [
        { label: 'Critical', values: [80,60,90,70,50,85,65,75,45,80], color: sevColors[0] },
        { label: 'Trouble', values: [50,40,60,55,35,55,45,50,30,55], color: sevColors[1] },
        { label: 'Attention', values: [30,25,35,30,20,40,30,35,20,35], color: sevColors[2] }
      ];
      var pSeries = pDatasets.map(function(ds) {
        return {
          type: 'bar', name: ds.label, data: ds.values,
          coordinateSystem: 'polar', stack: 'velocity',
          itemStyle: { color: ds.color, borderRadius: 2 },
          emphasis: { itemStyle: { shadowBlur: 8, shadowColor: 'rgba(0,0,0,0.2)' } }
        };
      });
      polarChart.setOption(Object.assign({}, ANIM, {
        title: { text: polarData.title || 'Risk Velocity', left: 'center', top: 0, textStyle: { fontSize: 13, fontWeight: 600, color: '#000', fontFamily: FONT } },
        tooltip: Object.assign({}, TOOLTIP_AXIS),
        legend: { bottom: 0, left: 'center', icon: 'circle', itemWidth: 8, itemHeight: 8, itemGap: 12, textStyle: { fontSize: 11, color: '#626262', fontFamily: FONT } },
        polar: { radius: ['18%', '70%'], center: ['50%', '50%'] },
        angleAxis: { type: 'category', data: pLabels, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { fontSize: 11, color: '#333', fontFamily: FONT } },
        radiusAxis: { show: false },
        animationDuration: 1000, animationEasing: 'cubicOut',
        animationDelay: function(i) { return i * 80; },
        series: pSeries
      }));
      autoResize(polarChart);
    }
    }

    /* ── SUNBURST + GAUGE (semicircular) ── */
    var sunburstChart = init(domId + '-sunburst');
    if (sunburstChart) {
      var categories = sunburstData.categories || [
        {
          name: 'Assets', color: '#002EAC',
          children: [
            { name: 'Misconfiguration', value: 230, color: '#0E38A9', children: [
              { name: 'UEBA Risk', value: 230, color: '#3465EC' },
              { name: 'Other Risk', value: 230, color: '#2253DB' }
            ]},
            { name: 'Vulnerability', value: 240, color: '#1141C6', children: [
              { name: 'Misconfiguration', value: 230, color: '#2253DB' },
              { name: 'UEBA Risk', value: 230, color: '#2253DB' }
            ]},
            { name: 'Other Risk', value: 20, color: '#214FD0' }
          ]
        },
        {
          name: 'Applications', color: '#0087A1',
          children: [
            { name: 'UEBA Risk', value: 230, color: '#009CBB', children: [
              { name: 'DLP Risk', value: 230, color: '#0CADCE' },
              { name: 'Other Risk', value: 230, color: '#14BFE1' }
            ]},
            { name: 'Misconfiguration', value: 230, color: '#0CADCE' }
          ]
        },
        {
          name: 'Users', color: '#9750FB',
          children: [
            { name: 'UEBA Risk', value: 230, color: '#A769FF', children: [
              { name: 'Other Risk', value: 230, color: '#BE90FF' }
            ]},
            { name: 'DLP Risk', value: 300, color: '#B27CFF' },
            { name: 'Other Risk', value: 230, color: '#BE90FF' }
          ]
        }
      ];

      function buildSbData(cats) {
        return cats.map(function(cat) {
          var mid = (cat.children || []).map(function(sub) {
            var outer = (sub.children || []).map(function(leaf) {
              return {
                name: leaf.name + '\n' + leaf.value, value: leaf.value,
                itemStyle: { color: leaf.color || sub.color, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
                label: { color: '#fff', fontSize: 10, fontFamily: FONT }
              };
            });
            var node = {
              name: sub.name + '\n' + sub.value, value: sub.value,
              itemStyle: { color: sub.color || cat.color, borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
              label: { color: '#fff', fontSize: 11, fontWeight: 500, fontFamily: FONT }
            };
            if (outer.length) node.children = outer;
            return node;
          });
          return {
            name: cat.name, value: mid.reduce(function(s, c) { return s + c.value; }, 0),
            itemStyle: { color: cat.color, borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)' },
            label: { color: '#fff', fontSize: 12, fontWeight: 600, fontFamily: FONT },
            children: mid
          };
        });
      }

      var sbData = buildSbData(categories);

      var totalVisible = sbData.reduce(function(s, c) { return s + (c.value || 0); }, 0);
      sbData.push({
        name: '', value: totalVisible,
        itemStyle: { color: 'transparent', borderWidth: 0 },
        label: { show: false },
        children: [
          { name: '', value: totalVisible, itemStyle: { color: 'transparent', borderWidth: 0 }, label: { show: false },
            children: [{ name: '', value: totalVisible, itemStyle: { color: 'transparent', borderWidth: 0 }, label: { show: false } }]
          }
        ]
      });

      var gaugeSvgUrl = (opts.assetPath || './assets/icons/') + 'gauge-center.svg';
      var sbContainer = document.getElementById(domId + '-sunburst');
      if (sbContainer) {
        var gaugeOverlay = document.createElement('div');
        gaugeOverlay.style.cssText = 'position:absolute;pointer-events:none;z-index:10;';
        sbContainer.appendChild(gaugeOverlay);
        fetch(gaugeSvgUrl).then(function(r){
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.text();
        }).then(function(svgText){
          gaugeOverlay.innerHTML = svgText;
          var svg = gaugeOverlay.querySelector('svg');
          if (svg) { svg.style.width = '100%'; svg.style.height = 'auto'; svg.style.display = 'block'; }
        }).catch(function(){
          var img = document.createElement('img');
          img.src = gaugeSvgUrl;
          img.style.width = '100%';
          img.style.height = 'auto';
          img.style.display = 'block';
          gaugeOverlay.appendChild(img);
        });

        function sizeGauge() {
          var cW = sbContainer.clientWidth, cH = sbContainer.clientHeight;
          if (!cW || !cH) return;
          var ref = sunburstOnly ? cH : Math.min(cW, cH);
          var innerRadPx = 0.85 * ref / 2;
          var innerDiamPx = innerRadPx * 2;
          var gaugeSvgRatio = 389.81 / 481;
          var gaugeScale = opts.gaugeScale || 1.12;
          var overlayW = (innerDiamPx / gaugeSvgRatio) * gaugeScale;
          var overlayH = overlayW * (221 / 481);
          var centerX = cW * 0.5;
          var centerY = cH * 0.98;
          gaugeOverlay.style.width = overlayW + 'px';
          gaugeOverlay.style.height = overlayH + 'px';
          gaugeOverlay.style.left = (centerX - overlayW / 2) + 'px';
          gaugeOverlay.style.top = (centerY - overlayH) + 'px';
        }
        setTimeout(sizeGauge, 200);
        window.addEventListener('resize', sizeGauge);
        if (typeof ResizeObserver !== 'undefined') {
          new ResizeObserver(sizeGauge).observe(sbContainer);
        }
      }

      var sbEl = document.getElementById(domId + '-sunburst');
      var sbW = sbEl ? sbEl.clientWidth : 600;
      var sbH = sbEl ? sbEl.clientHeight : 480;
      var sbRad, sbCenter;
      if (sunburstOnly && sbW > sbH * 1.4) {
        var pctBase = (sbH / Math.min(sbW, sbH)) * 100;
        sbRad = [Math.round(pctBase * 0.85) + '%', Math.round(pctBase * 1.85) + '%'];
        sbCenter = ['50%', '98%'];
      } else {
        sbRad = ['85%', '185%'];
        sbCenter = ['50%', '98%'];
      }

      sunburstChart.setOption({
        tooltip: {
          trigger: 'item', backgroundColor: 'rgba(39,45,66,0.95)', borderColor: '#555', borderWidth: 1,
          textStyle: { fontSize: 12, color: '#fff', fontFamily: FONT },
          formatter: function(p) {
            if (!p.data || !p.data.name || p.data.name === '') return '';
            return '<b>' + p.data.name.replace('\n', '</b>: ');
          }
        },
        graphic: [
          {
            type: 'text', left: 'center', top: 0, z: 100,
            style: { text: sunburstData.title || 'Org Risk Distribution', fill: '#000', fontSize: 13, fontWeight: 600, fontFamily: FONT, textAlign: 'center' }
          }
        ],
        series: [
          {
            type: 'sunburst', data: sbData,
            radius: sbRad, center: sbCenter,
            startAngle: 180, sort: null, nodeClick: false,
            label: { show: true, rotate: 'radial', minAngle: 25, fontSize: 10, fontFamily: FONT, color: '#fff' },
            emphasis: {
              focus: 'ancestor',
              itemStyle: { shadowBlur: 15, shadowColor: 'rgba(0,0,0,0.4)' }
            },
            levels: [
              {},
              {
                r0: '85%', r: '108%',
                label: { show: true, fontSize: 12, fontWeight: 600, rotate: 'radial', minAngle: 25, align: 'center' },
                itemStyle: { borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)' }
              },
              {
                r0: '108%', r: '146%',
                label: { show: true, fontSize: 11, fontWeight: 500, rotate: 'radial', minAngle: 20 },
                itemStyle: { borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' }
              },
              {
                r0: '146%', r: '185%',
                label: { show: true, fontSize: 10, rotate: 'radial', minAngle: 18 },
                itemStyle: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' }
              }
            ],
            animationType: 'expansion', animationDuration: 1400, animationEasing: 'cubicOut'
          }
        ]
      });
      autoResize(sunburstChart);
    }

    /* ── RADAR (Risk by Category) ── */
    var radarChart = null;
    if (!sunburstOnly) {
    radarChart = init(domId + '-radar');
    if (radarChart) {
      var rLabels = radarData.labels || ['Identity\nCompromise','Operational\nImpact','Data\nExposure','Lateral\nPropagation','Control\nEvasion','Intrusion\nRisk','Attack\nSurface'];
      var rMax = radarData.max || 30000;
      var rDatasets = radarData.datasets || [
        { label: 'Critical', values: [25000,18000,22000,15000,20000,28000,24000], color: sevColors[0] },
        { label: 'Trouble', values: [15000,12000,16000,10000,14000,18000,16000], color: sevColors[1] },
        { label: 'Attention', values: [8000,6000,10000,5000,8000,12000,9000], color: sevColors[2] }
      ];
      var indicators = rLabels.map(function(l) { return { name: l, max: rMax }; });
      var rSeries = rDatasets.map(function(ds) {
        return {
          value: ds.values, name: ds.label,
          lineStyle: { color: ds.color, width: 2 },
          areaStyle: { color: ds.color, opacity: 0.15 },
          itemStyle: { color: ds.color },
          symbol: 'circle', symbolSize: 5
        };
      });
      radarChart.setOption(Object.assign({}, ANIM, {
        title: { text: radarData.title || 'Risk by Category', left: 'center', top: 0, textStyle: { fontSize: 13, fontWeight: 600, color: '#000', fontFamily: FONT } },
        tooltip: Object.assign({}, TOOLTIP_ITEM),
        legend: { bottom: 0, left: 'center', icon: 'circle', itemWidth: 8, itemHeight: 8, itemGap: 12, textStyle: { fontSize: 11, color: '#626262', fontFamily: FONT } },
        radar: {
          indicator: indicators, radius: '60%', center: ['50%', '52%'],
          axisName: { color: '#333', fontSize: 11, fontFamily: FONT },
          splitArea: { areaStyle: { color: ['rgba(44,102,221,0.02)', 'rgba(44,102,221,0.04)'] } },
          splitLine: { lineStyle: { color: '#E9E9E9' } },
          axisLine: { lineStyle: { color: '#DCDCDC' } }
        },
        animationDuration: 1000, animationEasing: 'cubicOut',
        series: [{ type: 'radar', data: rSeries, emphasis: { lineStyle: { width: 3 } } }]
      }));
      autoResize(radarChart);
    }
    }

    return { polar: polarChart, sunburst: sunburstChart, radar: radarChart };
  }

  /* ── RESIZE ALL ── */
  function resizeAll() {
    Object.keys(instances).forEach(function (id) {
      if (instances[id]) instances[id].resize();
    });
  }

  /* ── PUBLIC API ── */
  window.ElegantEChart = {
    bar: bar,
    hbar: hbar,
    line: line,
    stackedArea: stackedArea,
    pie: pie,
    donut: donut,
    combo: combo,
    radar: radar,
    scatter: scatter,
    heatmap: heatmap,
    gauge: gauge,
    treemap: treemap,
    sunburst: sunburst,
    sankey: sankey,
    funnel: funnel,
    sparkline: sparkline,
    liquidFill: liquidFill,
    themeRiver: themeRiver,
    nightingaleRose: nightingaleRose,
    pictorialBar: pictorialBar,
    calendarHeatmap: calendarHeatmap,
    waterfall: waterfall,
    graph: graph,
    teamBoard: teamBoard,
    alertList: alertList,
    analysisWidget: analysisWidget,
    metricsWidget: metricsWidget,
    alertType1: alertType1,
    alertType2: alertType2,
    alertType3: alertType3,
    suspectList: suspectList,
    summaryChartWidget: summaryChartWidget,
    summaryTextWidget: summaryTextWidget,
    geoWidget: geoWidget,
    tileWidget: tileWidget,
    tangentialPolarBar: tangentialPolarBar,
    riskDistribution: riskDistribution,
    dispose: dispose,
    resize: resizeAll,
    instances: instances,
    PALETTE: PALETTE
  };
})();
