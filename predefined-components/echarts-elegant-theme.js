/**
 * Apache ECharts — Elegant Theme
 * Registers a custom "elegant" theme matching the Figma Elegant Components 1.0 design tokens.
 * 
 * Usage:
 *   <script src="./predefined-components/lib/echarts.min.js"></script>
 *   <script src="./predefined-components/echarts-elegant-theme.js"></script>
 *   var chart = echarts.init(dom, 'elegant');
 */
(function () {
  'use strict';

  var COLORS = {
    blue:      '#2C66DD',
    teal:      '#009CBB',
    purple:    '#A51C50',
    orange:    '#D14900',
    green:     '#198019',
    red:       '#DD1616',
    amber:     '#FABB34',
    lightBlue: '#4A90D9',
  };

  var PALETTE = [
    COLORS.blue, COLORS.teal, COLORS.purple, COLORS.orange,
    COLORS.green, COLORS.red, COLORS.amber, COLORS.lightBlue
  ];

  var fontFamily = "'Zoho Puvi', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

  echarts.registerTheme('elegant', {
    color: PALETTE,

    backgroundColor: 'transparent',

    textStyle: {
      fontFamily: fontFamily,
      fontSize: 12,
      color: '#626262'
    },

    title: {
      textStyle: {
        fontFamily: fontFamily,
        fontSize: 14,
        fontWeight: 600,
        color: '#000000'
      },
      subtextStyle: {
        fontFamily: fontFamily,
        fontSize: 11,
        color: '#626262'
      }
    },

    legend: {
      textStyle: {
        fontFamily: fontFamily,
        fontSize: 11,
        color: '#626262'
      },
      itemWidth: 12,
      itemHeight: 8,
      itemGap: 16
    },

    tooltip: {
      backgroundColor: '#272D42',
      borderColor: '#272D42',
      borderWidth: 0,
      textStyle: {
        fontFamily: fontFamily,
        fontSize: 11,
        color: '#FFFFFF'
      },
      extraCssText: 'border-radius: 4px; padding: 8px 12px; box-shadow: 0 2px 8px rgba(0,0,0,.15);'
    },

    categoryAxis: {
      axisLine: { lineStyle: { color: '#E9E9E9' } },
      axisTick: { show: false },
      axisLabel: {
        fontFamily: fontFamily,
        fontSize: 11,
        color: '#626262'
      },
      splitLine: { lineStyle: { color: '#E9E9E9', type: 'dashed' } }
    },

    valueAxis: {
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        fontFamily: fontFamily,
        fontSize: 11,
        color: '#626262'
      },
      splitLine: { lineStyle: { color: '#E9E9E9', type: 'dashed' } }
    },

    line: {
      smooth: true,
      symbolSize: 6,
      lineStyle: { width: 2 }
    },

    bar: {
      barMaxWidth: 40,
      itemStyle: { borderRadius: [2, 2, 0, 0] }
    },

    pie: {
      itemStyle: { borderWidth: 0 },
      label: {
        fontFamily: fontFamily,
        fontSize: 11,
        color: '#626262'
      }
    },

    radar: {
      axisName: {
        fontFamily: fontFamily,
        fontSize: 11,
        color: '#626262'
      },
      splitLine: { lineStyle: { color: '#E9E9E9' } },
      splitArea: { areaStyle: { color: ['transparent', 'rgba(220,220,220,0.1)'] } },
      axisLine: { lineStyle: { color: '#E9E9E9' } }
    },

    gauge: {
      axisLine: { lineStyle: { color: [[0.3, COLORS.green], [0.7, COLORS.amber], [1, COLORS.red]] } },
      axisTick: { lineStyle: { color: '#626262' } },
      axisLabel: { fontFamily: fontFamily, fontSize: 11, color: '#626262' },
      title: { fontFamily: fontFamily, fontSize: 14, fontWeight: 600, color: '#000000' },
      detail: { fontFamily: fontFamily, fontSize: 28, fontWeight: 600, color: '#000000' }
    },

    graph: {
      color: PALETTE
    },

    grid: {
      left: 40,
      right: 16,
      top: 24,
      bottom: 32,
      containLabel: true
    }
  });

  window.ElegantThemeColors = COLORS;
  window.ElegantThemePalette = PALETTE;
})();
