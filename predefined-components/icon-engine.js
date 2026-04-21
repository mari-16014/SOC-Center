/**
 * ICON ENGINE — On-Demand Lucide Icon System for Elegant Theme Conversion
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * This engine does NOT pre-download icons. Instead, the agent downloads
 * ONLY the icons needed for each specific conversion, at conversion time.
 *
 * ─── HOW IT WORKS (Agent Workflow) ───
 *
 *   1. SCAN    — Agent reads source HTML, finds all icons/emojis/icon-classes
 *   2. PLAN    — Agent resolves each to a Lucide name via ICON_CATALOG below
 *   3. FETCH   — Agent downloads ONLY needed icons from CDN at required sizes
 *   4. SAVE    — Agent writes them to assets/lucide-icons/{name}-{size}.svg
 *   5. USE     — Agent writes <img src="./assets/lucide-icons/..."> in output
 *
 *   If an icon is already in the folder (from a previous conversion), skip it.
 *
 * ─── CDN ───
 *   https://cdn.jsdelivr.net/npm/lucide-static@1.7.0/icons/{name}.svg
 *   License: ISC (open source, free for commercial use)
 *
 * ─── STROKE WEIGHT RULES (consistent per size) ───
 *   ≤14px  → stroke-width: 1      (crisp at small sizes)
 *    16px  → stroke-width: 1.25   (slight boost for medium)
 *   ≥24px  → stroke-width: 1.5    (maintains visual weight at large sizes)
 *
 *   CRITICAL: Every icon at the same size gets the SAME stroke weight.
 *   No more tile A having stroke 0.8 and tile B having stroke 1.5.
 *
 * ─── SIZE GRID (8-point aligned) ───
 *   10px  — plus-in-button (inside Add button)
 *   12px  — compact inline (date pickers, mini chevrons)
 *   14px  — DEFAULT (buttons, dropdowns, tables, inputs, sidebar, tiles)
 *   16px  — tile headers, stat cards, checkbox, topnav icons
 *   24px  — navigation, toolbar, action-bar, table row actions, logo
 *   32px  — empty states, hero sections, feature icons
 *
 * ─── RUNTIME USAGE (optional, in browser) ───
 *   <script src="./predefined-components/icon-engine.js"></script>
 *   <script>ElegantIcons.init();</script>
 *   This auto-replaces <i data-icon="search" data-icon-context="default">
 *   with the correct <img> tag at runtime.
 */
(function () {
  'use strict';

  var CDN_BASE = 'https://cdn.jsdelivr.net/npm/lucide-static@1.7.0/icons/';
  var LOCAL_BASE = './assets/lucide-icons/';

  /* ═══════════════════════════════════════════════════════════════
     STROKE WEIGHT BY RENDERED SIZE
     Every icon at a given size uses the exact same stroke weight.
     ═══════════════════════════════════════════════════════════════ */
  var STROKE_MAP = {
    8:  1,
    10: 1,
    12: 1,
    14: 1,
    16: 1.25,
    20: 1.5,
    24: 1.5,
    32: 1.5,
  };

  function getStroke(size) {
    return STROKE_MAP[size] || (size <= 14 ? 1 : 1.5);
  }

  /* ═══════════════════════════════════════════════════════════════
     SIZE PRESETS BY COMPONENT CONTEXT
     The agent reads context from the source HTML structure and
     picks the correct size automatically.
     ═══════════════════════════════════════════════════════════════ */
  var SIZE_CONTEXT = {
    'plus-in-button':      10,
    'date-picker':         12,
    'mini-chevron':        12,
    'compact-inline':      12,
    'subnav-date':         12,

    'default':             14,
    'button':              14,
    'button-icon':         14,
    'dropdown':            14,
    'input':               14,
    'sidebar':             14,
    'sidebar-chevron':     14,
    'table-cell':          14,
    'table-cell-status':   14,
    'status':              14,
    'chevron':             14,
    'help':                14,
    'tile':                14,
    'tile-icon':           14,
    'widget-header':       14,
    'card-inline':         14,
    'breadcrumb':          14,
    'tab-icon':            14,
    'toast-icon':          14,
    'badge-icon':          14,

    'tile-header':         16,
    'stat-card-icon':      16,
    'checkbox':            16,
    'topnav':              16,

    'navigation':          24,
    'toolbar':             24,
    'action-bar':          24,
    'action-bar-icon':     24,
    'table-action':        24,
    'logo':                24,
    'drawer-close':        24,
    'modal-close':         24,
    'sc-icon-circle':      24,

    'hero':                32,
    'empty-state':         32,
    'feature-icon':        32,
    'illustration':        32,
  };

  function getSizeForContext(context) {
    return SIZE_CONTEXT[context] || SIZE_CONTEXT['default'];
  }

  /* ═══════════════════════════════════════════════════════════════
     ICON CATALOG — Semantic concept → Lucide icon name
     with synonyms for intelligent matching.

     The agent uses this to:
       1. Detect what icon is needed (by concept, emoji, or class name)
       2. Find the best Lucide match (even if not exact name)
       3. Resolve to the correct Lucide file name for CDN fetch

     INTELLIGENCE: If "notification" is searched, it finds "bell".
     If "🔒" is in the HTML, it resolves to "lock".
     If "fa-pencil" is detected, it resolves to "pencil".
     ═══════════════════════════════════════════════════════════════ */
  var ICON_CATALOG = {

    /* ── NAVIGATION & CHROME ── */
    'search':            { lucide: 'search',           synonyms: ['magnify', 'find', 'lookup', 'magnifying-glass'] },
    'menu':              { lucide: 'menu',             synonyms: ['hamburger', 'nav-toggle', 'bars', 'three-lines'] },
    'close':             { lucide: 'x',                synonyms: ['dismiss', 'cancel-icon', 'cross', 'clear'] },
    'chevron-down':      { lucide: 'chevron-down',     synonyms: ['dropdown', 'caret-down', 'arrow-down-sm', 'expand-down'] },
    'chevron-up':        { lucide: 'chevron-up',       synonyms: ['caret-up', 'collapse-up', 'arrow-up-sm'] },
    'chevron-right':     { lucide: 'chevron-right',    synonyms: ['caret-right', 'arrow-right-sm', 'expand-right', 'next'] },
    'chevron-left':      { lucide: 'chevron-left',     synonyms: ['caret-left', 'arrow-left-sm', 'back', 'previous'] },
    'chevrons-left':     { lucide: 'chevrons-left',    synonyms: ['double-back', 'first-page'] },
    'chevrons-right':    { lucide: 'chevrons-right',   synonyms: ['double-next', 'last-page'] },
    'arrow-left':        { lucide: 'arrow-left',       synonyms: ['back-arrow', 'navigate-back'] },
    'arrow-right':       { lucide: 'arrow-right',      synonyms: ['forward-arrow', 'navigate-forward'] },
    'arrow-up':          { lucide: 'arrow-up',         synonyms: ['up', 'sort-asc'] },
    'arrow-down':        { lucide: 'arrow-down',       synonyms: ['down', 'sort-desc'] },
    'arrow-up-right':    { lucide: 'arrow-up-right',   synonyms: ['external-link', 'open-new', 'external'] },
    'home':              { lucide: 'house',             synonyms: ['home', 'dashboard-home', 'main'] },
    'sidebar-collapse':  { lucide: 'panel-left-close',  synonyms: ['collapse-sidebar', 'sidebar-hide'] },
    'sidebar-expand':    { lucide: 'panel-left-open',   synonyms: ['expand-sidebar', 'sidebar-show'] },

    /* ── ACTIONS ── */
    'edit':              { lucide: 'pencil',           synonyms: ['modify', 'pencil', 'write', 'update', 'change'] },
    'delete':            { lucide: 'trash-2',          synonyms: ['remove', 'trash', 'destroy', 'bin', 'discard'] },
    'add':               { lucide: 'plus',             synonyms: ['create', 'new', 'plus', 'insert'] },
    'add-circle':        { lucide: 'circle-plus',      synonyms: ['add-round', 'plus-circle'] },
    'minus':             { lucide: 'minus',            synonyms: ['subtract', 'remove-line'] },
    'check':             { lucide: 'check',            synonyms: ['approve', 'confirm', 'accept', 'done', 'tick', 'ok'] },
    'check-circle':      { lucide: 'circle-check',     synonyms: ['success', 'verified', 'approved'] },
    'x-circle':          { lucide: 'circle-x',         synonyms: ['error-circle', 'failed', 'rejected'] },
    'copy':              { lucide: 'copy',             synonyms: ['duplicate', 'clipboard'] },
    'save':              { lucide: 'save',             synonyms: ['floppy', 'persist', 'store'] },
    'download':          { lucide: 'download',         synonyms: ['export', 'save-file', 'pull-down'] },
    'upload':            { lucide: 'upload',           synonyms: ['import', 'push-up'] },
    'share':             { lucide: 'share-2',          synonyms: ['share', 'forward', 'send-to'] },
    'link':              { lucide: 'link',             synonyms: ['chain', 'url', 'hyperlink'] },
    'unlink':            { lucide: 'unlink',           synonyms: ['break-link', 'disconnect'] },
    'move':              { lucide: 'move',             synonyms: ['drag', 'reorder', 'grip'] },
    'grip-vertical':     { lucide: 'grip-vertical',    synonyms: ['drag-handle', 'reorder-handle'] },
    'maximize':          { lucide: 'maximize-2',       synonyms: ['fullscreen', 'expand', 'enlarge'] },
    'minimize':          { lucide: 'minimize-2',       synonyms: ['exit-fullscreen', 'shrink'] },
    'more-horizontal':   { lucide: 'ellipsis',         synonyms: ['more', 'three-dots', 'overflow', 'kebab-h', 'options'] },
    'more-vertical':     { lucide: 'ellipsis-vertical', synonyms: ['kebab', 'three-dots-v', 'context-menu', 'vertical-dots'] },
    'refresh':           { lucide: 'refresh-cw',       synonyms: ['reload', 'sync', 'retry', 'update-data'] },
    'rotate':            { lucide: 'rotate-cw',        synonyms: ['rotate-right', 'redo'] },
    'undo':              { lucide: 'undo-2',           synonyms: ['revert', 'go-back'] },
    'redo':              { lucide: 'redo-2',           synonyms: ['redo-action'] },
    'play':              { lucide: 'play',             synonyms: ['start', 'run', 'execute', 'begin'] },
    'pause':             { lucide: 'pause',            synonyms: ['hold', 'suspend'] },
    'stop':              { lucide: 'square',           synonyms: ['halt', 'end'] },
    'power':             { lucide: 'power',            synonyms: ['on-off', 'toggle-power', 'shutdown'] },
    'log-in':            { lucide: 'log-in',           synonyms: ['sign-in', 'login'] },
    'log-out':           { lucide: 'log-out',          synonyms: ['sign-out', 'logout', 'exit'] },
    'send':              { lucide: 'send',             synonyms: ['submit', 'dispatch'] },
    'print':             { lucide: 'printer',          synonyms: ['print-page'] },
    'scan':              { lucide: 'scan',             synonyms: ['barcode', 'qr-scan'] },
    'zap':               { lucide: 'zap',              synonyms: ['lightning', 'bolt', 'flash', 'instant', 'quick-action'] },
    'convert':           { lucide: 'repeat-2',         synonyms: ['transform', 'exchange', 'swap'] },

    /* ── FILTER & SORT ── */
    'filter':            { lucide: 'filter',           synonyms: ['funnel', 'narrow', 'sieve'] },
    'filter-x':          { lucide: 'filter-x',         synonyms: ['clear-filter', 'remove-filter'] },
    'sort':              { lucide: 'arrow-up-down',    synonyms: ['sort-toggle', 'order', 'reorder'] },
    'sort-asc':          { lucide: 'arrow-up-narrow-wide', synonyms: ['sort-ascending', 'a-z'] },
    'sort-desc':         { lucide: 'arrow-down-wide-narrow', synonyms: ['sort-descending', 'z-a'] },
    'list-filter':       { lucide: 'list-filter',      synonyms: ['filter-list'] },
    'columns':           { lucide: 'columns-3',        synonyms: ['column-select', 'column-manage'] },

    /* ── VIEW TYPES ── */
    'grid-view':         { lucide: 'layout-grid',      synonyms: ['grid', 'card-view', 'tile-view', 'gallery'] },
    'list-view':         { lucide: 'list',             synonyms: ['list', 'table-view', 'rows'] },
    'kanban-view':       { lucide: 'kanban',           synonyms: ['board-view', 'columns-view'] },
    'calendar-view':     { lucide: 'calendar',         synonyms: ['date-view', 'schedule-view'] },
    'layout-dashboard':  { lucide: 'layout-dashboard',  synonyms: ['dashboard', 'widgets-view'] },

    /* ── NOTIFICATIONS & ALERTS ── */
    'bell':              { lucide: 'bell',             synonyms: ['notification', 'alert-bell', 'reminder', 'alarm'] },
    'bell-ring':         { lucide: 'bell-ring',        synonyms: ['active-notification', 'ringing'] },
    'bell-off':          { lucide: 'bell-off',         synonyms: ['mute-notification', 'silent'] },
    'alert-triangle':    { lucide: 'triangle-alert',   synonyms: ['warning', 'caution', 'danger-triangle', 'exclamation'] },
    'alert-circle':      { lucide: 'circle-alert',     synonyms: ['error', 'danger', 'problem'] },
    'info':              { lucide: 'info',             synonyms: ['information', 'about', 'details'] },
    'help-circle':       { lucide: 'circle-help',      synonyms: ['help', 'question', 'question-mark', 'faq', 'support'] },
    'message-circle':    { lucide: 'message-circle',   synonyms: ['chat', 'comment', 'conversation'] },
    'message-square':    { lucide: 'message-square',   synonyms: ['message', 'chat-box'] },
    'megaphone':         { lucide: 'megaphone',        synonyms: ['announcement', 'broadcast'] },
    'siren':             { lucide: 'siren',            synonyms: ['emergency', 'urgent'] },

    /* ── SECURITY & THREAT (SOC/SIEM) ── */
    'shield':            { lucide: 'shield',           synonyms: ['security', 'protection', 'guard', 'defend'] },
    'shield-check':      { lucide: 'shield-check',     synonyms: ['secure', 'protected', 'verified-shield'] },
    'shield-alert':      { lucide: 'shield-alert',     synonyms: ['security-warning', 'threat-detected'] },
    'shield-off':        { lucide: 'shield-off',       synonyms: ['unprotected', 'vulnerable'] },
    'lock':              { lucide: 'lock',             synonyms: ['locked', 'secure', 'encrypted', 'private'] },
    'unlock':            { lucide: 'lock-open',        synonyms: ['unlocked', 'unsecured'] },
    'key':               { lucide: 'key',              synonyms: ['password', 'credential', 'auth-key', 'api-key'] },
    'fingerprint':       { lucide: 'fingerprint',      synonyms: ['biometric', 'identity-verify'] },
    'scan-eye':          { lucide: 'scan-eye',         synonyms: ['surveillance', 'monitor-threat'] },
    'bug':               { lucide: 'bug',              synonyms: ['vulnerability', 'exploit', 'malware'] },
    'skull':             { lucide: 'skull',            synonyms: ['threat', 'kill', 'critical-threat', 'dead'] },
    'radar':             { lucide: 'radar',            synonyms: ['detect', 'scan-threat', 'reconnaissance'] },
    'flame':             { lucide: 'flame',            synonyms: ['firewall', 'fire', 'hot', 'burning'] },
    'ban':               { lucide: 'ban',              synonyms: ['block', 'deny', 'forbidden', 'blacklist'] },
    'eye':               { lucide: 'eye',              synonyms: ['view', 'visible', 'watch', 'observe', 'show'] },
    'eye-off':           { lucide: 'eye-off',          synonyms: ['hidden', 'invisible', 'hide', 'blind'] },

    /* ── USERS & IDENTITY ── */
    'user':              { lucide: 'user',             synonyms: ['person', 'profile', 'account', 'individual'] },
    'user-circle':       { lucide: 'circle-user-round', synonyms: ['avatar', 'user-avatar', 'profile-pic'] },
    'users':             { lucide: 'users',            synonyms: ['team', 'group', 'people', 'members'] },
    'user-plus':         { lucide: 'user-plus',        synonyms: ['add-user', 'invite', 'create-account', 'new-member'] },
    'user-minus':        { lucide: 'user-minus',       synonyms: ['remove-user', 'revoke'] },
    'user-check':        { lucide: 'user-check',       synonyms: ['verified-user', 'approved-user'] },
    'user-x':            { lucide: 'user-x',           synonyms: ['blocked-user', 'banned', 'impacted-user', 'victim'] },
    'contact':           { lucide: 'contact',          synonyms: ['address-book', 'vcard'] },

    /* ── DEVICES & INFRASTRUCTURE ── */
    'monitor':           { lucide: 'monitor',          synonyms: ['desktop', 'screen', 'display', 'endpoint', 'workstation'] },
    'laptop':            { lucide: 'laptop',           synonyms: ['notebook', 'portable'] },
    'smartphone':        { lucide: 'smartphone',       synonyms: ['mobile', 'phone', 'device'] },
    'tablet':            { lucide: 'tablet',           synonyms: ['ipad'] },
    'server':            { lucide: 'server',           synonyms: ['host', 'machine', 'backend', 'datacenter'] },
    'database':          { lucide: 'database',         synonyms: ['db', 'datastore', 'storage'] },
    'hard-drive':        { lucide: 'hard-drive',       synonyms: ['disk', 'storage-device'] },
    'cloud':             { lucide: 'cloud',            synonyms: ['cloud-service', 'saas'] },
    'wifi':              { lucide: 'wifi',             synonyms: ['wireless', 'network', 'connected'] },
    'wifi-off':          { lucide: 'wifi-off',         synonyms: ['no-connection', 'offline', 'disconnected'] },
    'globe':             { lucide: 'globe',            synonyms: ['world', 'internet', 'web', 'global', 'domain'] },
    'network':           { lucide: 'network',          synonyms: ['topology', 'nodes', 'connections', 'infra'] },
    'router':            { lucide: 'router',           synonyms: ['gateway', 'access-point'] },
    'cpu':               { lucide: 'cpu',              synonyms: ['processor', 'chip', 'compute'] },
    'memory-stick':      { lucide: 'memory-stick',     synonyms: ['ram', 'memory'] },
    'plug':              { lucide: 'plug',             synonyms: ['connection', 'integrate', 'plugin'] },
    'terminal':          { lucide: 'terminal',         synonyms: ['console', 'cli', 'command-line', 'shell', 'cmd'] },

    /* ── FILES & DOCUMENTS ── */
    'file':              { lucide: 'file',             synonyms: ['document', 'doc', 'page'] },
    'file-text':         { lucide: 'file-text',        synonyms: ['text-doc', 'readme', 'notes'] },
    'file-code':         { lucide: 'file-code',        synonyms: ['source-file', 'script'] },
    'file-check':        { lucide: 'file-check',       synonyms: ['file-approved', 'completed-doc'] },
    'file-warning':      { lucide: 'file-warning',     synonyms: ['file-alert', 'problematic-file'] },
    'file-x':            { lucide: 'file-x',           synonyms: ['file-error', 'invalid-file'] },
    'files':             { lucide: 'files',            synonyms: ['documents', 'multi-file'] },
    'folder':            { lucide: 'folder',           synonyms: ['directory', 'category'] },
    'folder-open':       { lucide: 'folder-open',      synonyms: ['open-folder', 'expanded'] },
    'archive':           { lucide: 'archive',          synonyms: ['compressed', 'zip', 'backup'] },
    'clipboard':         { lucide: 'clipboard',        synonyms: ['paste', 'clipboard-content'] },
    'clipboard-list':    { lucide: 'clipboard-list',   synonyms: ['checklist', 'todo-list', 'tasks'] },
    'book':              { lucide: 'book-open',        synonyms: ['documentation', 'manual', 'guide', 'knowledge-base'] },
    'notebook':          { lucide: 'notebook',         synonyms: ['journal', 'logbook'] },

    /* ── SETTINGS & CONFIGURATION ── */
    'settings':          { lucide: 'settings',         synonyms: ['gear', 'cog', 'config', 'preferences', 'admin'] },
    'sliders':           { lucide: 'sliders-horizontal', synonyms: ['adjustments', 'controls', 'tune', 'configure'] },
    'wrench':            { lucide: 'wrench',           synonyms: ['tool', 'maintenance', 'fix', 'repair'] },
    'toggle-left':       { lucide: 'toggle-left',      synonyms: ['switch-off', 'toggle-off'] },
    'toggle-right':      { lucide: 'toggle-right',     synonyms: ['switch-on', 'toggle-on'] },

    /* ── STATUS & INDICATORS ── */
    'circle':            { lucide: 'circle',           synonyms: ['dot', 'status-dot', 'indicator'] },
    'circle-dot':        { lucide: 'circle-dot',       synonyms: ['radio', 'selected-radio', 'active-dot'] },
    'loader':            { lucide: 'loader',           synonyms: ['spinner', 'loading', 'processing'] },
    'clock':             { lucide: 'clock',            synonyms: ['time', 'schedule', 'pending', 'timer', 'duration'] },
    'calendar':          { lucide: 'calendar',         synonyms: ['date', 'schedule', 'event', 'appointment'] },
    'calendar-days':     { lucide: 'calendar-days',    synonyms: ['date-range', 'period', 'date-picker'] },
    'hourglass':         { lucide: 'hourglass',        synonyms: ['waiting', 'pending-time'] },
    'activity':          { lucide: 'activity',         synonyms: ['pulse', 'health', 'heartbeat', 'live'] },
    'trending-up':       { lucide: 'trending-up',      synonyms: ['increase', 'growth', 'positive-trend', 'up-trend'] },
    'trending-down':     { lucide: 'trending-down',    synonyms: ['decrease', 'decline', 'negative-trend', 'down-trend'] },
    'bar-chart':         { lucide: 'bar-chart-3',      synonyms: ['chart', 'graph', 'analytics', 'stats', 'metrics'] },
    'pie-chart':         { lucide: 'pie-chart',        synonyms: ['donut', 'distribution'] },
    'line-chart':        { lucide: 'chart-line',       synonyms: ['trend-line', 'trend-chart'] },
    'hash':              { lucide: 'hash',             synonyms: ['number', 'count', 'tag'] },
    'percent':           { lucide: 'percent',          synonyms: ['percentage', 'ratio'] },
    'gauge':             { lucide: 'gauge',            synonyms: ['meter', 'speedometer', 'performance'] },

    /* ── DATA & TABLES ── */
    'table':             { lucide: 'table',            synonyms: ['data-grid', 'spreadsheet'] },
    'rows':              { lucide: 'rows-3',           synonyms: ['horizontal-rows', 'list-rows'] },
    'checkbox':          { lucide: 'square',           synonyms: ['unchecked', 'checkbox-empty'] },
    'checkbox-checked':  { lucide: 'square-check',     synonyms: ['checked', 'selected', 'checkbox-on'] },
    'checkbox-minus':    { lucide: 'square-minus',     synonyms: ['indeterminate', 'partial-check'] },

    /* ── LOG & AUDIT (SOC/SIEM) ── */
    'scroll-text':       { lucide: 'scroll-text',      synonyms: ['log', 'audit-log', 'event-log', 'history'] },
    'file-search':       { lucide: 'file-search',      synonyms: ['log-search', 'investigate', 'find-in-file'] },
    'book-open-check':   { lucide: 'book-open-check',  synonyms: ['compliance', 'policy-check', 'audit'] },
    'scale':             { lucide: 'scale',            synonyms: ['compliance-scale', 'balance', 'legal'] },
    'workflow':          { lucide: 'workflow',          synonyms: ['automation', 'process', 'pipeline', 'playbook'] },
    'layers':            { lucide: 'layers',           synonyms: ['stack', 'tiers', 'levels'] },
    'box':               { lucide: 'box',              synonyms: ['package', 'container', 'module'] },

    /* ── COMMUNICATION ── */
    'mail':              { lucide: 'mail',             synonyms: ['email', 'envelope', 'inbox', 'message-email'] },
    'phone':             { lucide: 'phone',            synonyms: ['call', 'telephone'] },
    'video':             { lucide: 'video',            synonyms: ['camera', 'video-call', 'record'] },

    /* ── MAP & LOCATION ── */
    'map-pin':           { lucide: 'map-pin',          synonyms: ['location', 'place', 'pin', 'marker', 'geo'] },
    'globe':             { lucide: 'globe',            synonyms: ['world', 'internet', 'web', 'global', 'domain'] },

    /* ── MISC ── */
    'star':              { lucide: 'star',             synonyms: ['favorite', 'bookmark', 'important', 'priority'] },
    'heart':             { lucide: 'heart',            synonyms: ['like', 'love', 'favorite-alt'] },
    'tag':               { lucide: 'tag',              synonyms: ['label', 'price', 'category-tag'] },
    'flag':              { lucide: 'flag',             synonyms: ['report', 'mark', 'flagged'] },
    'image':             { lucide: 'image',            synonyms: ['photo', 'picture', 'thumbnail'] },
    'code':              { lucide: 'code',             synonyms: ['source', 'developer', 'programming'] },
    'building':          { lucide: 'building-2',       synonyms: ['office', 'company', 'organization', 'enterprise'] },
    'puzzle':            { lucide: 'puzzle',           synonyms: ['integration', 'addon', 'plugin', 'extension'] },
    'lightbulb':         { lucide: 'lightbulb',        synonyms: ['idea', 'tip', 'suggestion', 'insight'] },
    'rocket':            { lucide: 'rocket',           synonyms: ['launch', 'deploy', 'fast', 'boost'] },
    'target':            { lucide: 'target',           synonyms: ['goal', 'aim', 'objective', 'crosshair'] },
    'apps-grid':         { lucide: 'grid-3x3',        synonyms: ['apps', 'app-launcher', 'modules', 'grid-menu'] },
    'external':          { lucide: 'external-link',    synonyms: ['open-external', 'new-window', 'new-tab'] },
  };

  /* ═══════════════════════════════════════════════════════════════
     EMOJI → CONCEPT MAPPING
     When source HTML uses emoji text as icons, this maps them
     to the correct concept key in ICON_CATALOG.
     ═══════════════════════════════════════════════════════════════ */
  var EMOJI_MAP = {
    '⚡': 'zap',       '🔔': 'bell',       '🔒': 'lock',
    '🔓': 'unlock',    '📊': 'bar-chart',   '📈': 'trending-up',
    '📉': 'trending-down', '⚠️': 'alert-triangle', '⚠': 'alert-triangle',
    '✅': 'check-circle', '❌': 'close',      '📋': 'clipboard-list',
    '🔍': 'search',    '👤': 'user',        '👥': 'users',
    '💀': 'skull',     '🛡️': 'shield',     '🛡': 'shield',
    '📁': 'folder',    '📂': 'folder-open', '🔗': 'link',
    '⬆️': 'arrow-up',  '⬆': 'arrow-up',    '⬇️': 'arrow-down',
    '⬇': 'arrow-down', '↗️': 'arrow-up-right', '↗': 'arrow-up-right',
    '◈': 'circle-dot', '◎': 'target',      '●': 'circle',
    '○': 'circle',     '■': 'checkbox',     '□': 'checkbox',
    '▲': 'chevron-up',  '▼': 'chevron-down', '★': 'star', '☆': 'star',
    '🔧': 'wrench',    '⚙️': 'settings',   '⚙': 'settings',
    '📧': 'mail',      '📞': 'phone',       '🌐': 'globe',
    '🏢': 'building',  '📅': 'calendar',    '⏰': 'clock',
    '🔥': 'flame',     '🚀': 'rocket',      '💡': 'lightbulb',
    '🎯': 'target',    '📝': 'file-text',   '🖥️': 'monitor',
    '🖥': 'monitor',   '💻': 'laptop',      '📱': 'smartphone',
    '☁️': 'cloud',     '☁': 'cloud',        '🗑️': 'delete',
    '🗑': 'delete',    '✏️': 'edit',        '✏': 'edit',
    '➕': 'add',       '➖': 'minus',        '🔄': 'refresh',
    '▶️': 'play',      '▶': 'play',         '🔘': 'circle-dot',
    '📌': 'map-pin',   '🏠': 'home',        '🔑': 'key',
    '🎓': 'graduation-cap', '📖': 'book',
  };

  /* ── REVERSE SYNONYM INDEX (built once on first resolve) ── */
  var _synonymIndex = null;
  function buildSynonymIndex() {
    if (_synonymIndex) return _synonymIndex;
    _synonymIndex = {};
    for (var concept in ICON_CATALOG) {
      var entry = ICON_CATALOG[concept];
      _synonymIndex[concept] = concept;
      _synonymIndex[entry.lucide] = concept;
      if (entry.synonyms) {
        for (var i = 0; i < entry.synonyms.length; i++) {
          _synonymIndex[entry.synonyms[i]] = concept;
        }
      }
    }
    return _synonymIndex;
  }

  /**
   * Resolve any keyword/emoji/concept to its Lucide icon name.
   * Search order: emoji → exact concept → exact lucide → synonym → fuzzy partial.
   */
  function resolve(query) {
    if (!query) return null;
    var q = query.trim();

    if (EMOJI_MAP[q]) {
      var emojiConcept = EMOJI_MAP[q];
      return ICON_CATALOG[emojiConcept] ? ICON_CATALOG[emojiConcept].lucide : null;
    }

    var ql = q.toLowerCase();
    if (ICON_CATALOG[ql]) return ICON_CATALOG[ql].lucide;

    var idx = buildSynonymIndex();
    if (idx[ql]) return ICON_CATALOG[idx[ql]].lucide;

    for (var concept in ICON_CATALOG) {
      if (ICON_CATALOG[concept].lucide === ql) return ql;
    }

    for (var c in ICON_CATALOG) {
      if (c.indexOf(ql) !== -1 || ql.indexOf(c) !== -1) return ICON_CATALOG[c].lucide;
      var entry = ICON_CATALOG[c];
      if (entry.synonyms) {
        for (var j = 0; j < entry.synonyms.length; j++) {
          if (entry.synonyms[j].indexOf(ql) !== -1 || ql.indexOf(entry.synonyms[j]) !== -1) {
            return entry.lucide;
          }
        }
      }
    }

    return null;
  }

  /**
   * Build the local SVG file path.
   * Pattern: ./assets/lucide-icons/{lucide-name}-{size}.svg
   */
  function localPath(lucideName, size) {
    return LOCAL_BASE + lucideName + '-' + (size || 14) + '.svg';
  }

  /**
   * Build CDN URL for fetching the raw Lucide SVG.
   */
  function cdnUrl(lucideName) {
    return CDN_BASE + lucideName + '.svg';
  }

  /**
   * Transform a raw Lucide SVG (24x24, stroke-width 2) into Elegant specs.
   */
  function elegantize(svgSource, size) {
    var s = size || 14;
    var sw = getStroke(s);
    return svgSource
      .replace(/width="24"/g, 'width="' + s + '"')
      .replace(/height="24"/g, 'height="' + s + '"')
      .replace(/stroke-width="2"/g, 'stroke-width="' + sw + '"')
      .replace(/class="[^"]*"/g, '')
      .replace(/<!--[^>]*-->\s*/g, '')
      .trim();
  }

  /**
   * Generate an <img> tag for converted HTML output.
   */
  function imgTag(concept, context, altText) {
    var lucideName = resolve(concept);
    if (!lucideName) return '<!-- icon not found: ' + concept + ' -->';
    var size = getSizeForContext(context || 'default');
    var path = localPath(lucideName, size);
    return '<img src="' + path + '" alt="' + (altText || concept) +
           '" width="' + size + '" height="' + size + '" />';
  }

  /**
   * Runtime DOM initializer: replaces <i data-icon="..."> placeholders.
   */
  function init() {
    var els = document.querySelectorAll('[data-icon]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var lucideName = resolve(el.getAttribute('data-icon'));
      if (!lucideName) continue;
      var size = getSizeForContext(el.getAttribute('data-icon-context') || 'default');
      var img = document.createElement('img');
      img.src = localPath(lucideName, size);
      img.alt = el.getAttribute('data-icon');
      img.width = size;
      img.height = size;
      img.style.display = 'inline-block';
      img.style.verticalAlign = 'middle';
      el.replaceWith(img);
    }
  }

  /* ── PUBLIC API ── */
  window.ElegantIcons = {
    resolve: resolve,
    localPath: localPath,
    cdnUrl: cdnUrl,
    elegantize: elegantize,
    imgTag: imgTag,
    init: init,
    getStroke: getStroke,
    getSizeForContext: getSizeForContext,
    ICON_CATALOG: ICON_CATALOG,
    EMOJI_MAP: EMOJI_MAP,
    STROKE_MAP: STROKE_MAP,
    SIZE_CONTEXT: SIZE_CONTEXT,
    CDN_BASE: CDN_BASE,
    LOCAL_BASE: LOCAL_BASE,
  };
})();
