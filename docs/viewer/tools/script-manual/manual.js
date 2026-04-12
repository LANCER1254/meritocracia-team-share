/* ============================================================
   MeritCore Script Manual — manual.js
   41,000+ エントリ対応 Virtual Scroll + Filter + Search
   ============================================================ */
'use strict';

/* ══════════════════════════════════════
   定数
══════════════════════════════════════ */
const CARD_H   = 76;   // px (CSS --card-h と一致)
const CARD_GAP = 6;    // px (CSS --card-gap と一致)
const ROW_H    = CARD_H + CARD_GAP;
const OVERSCAN = 8;    // 画面外バッファ行数

// カテゴリ表示順 & ラベル
const CAT_ORDER = [
  '00_core', '10_backup', '20_game', '30_project',
  '40_ops', '40_life', '40_terminal_comedy', '41_terminal_girl',
  '50_ai', '60_rag', 'config',
];
const CAT_LABEL = {
  '00_core':            '00 CORE',
  '10_backup':          '10 BACKUP',
  '20_game':            '20 GAME',
  '30_project':         '30 PROJECT',
  '40_ops':             '40 OPS',
  '40_life':            '40 LIFE',
  '40_terminal_comedy': '40 COMEDY',
  '41_terminal_girl':   '41 TERMINAL GIRL',
  '50_ai':              '50 AI',
  '60_rag':             '60 RAG',
  'config':             'CONFIG',
};

/* ══════════════════════════════════════
   状態
══════════════════════════════════════ */
let _allData    = [];   // 全件
let _filtered   = [];   // フィルタ後
let _activeCat  = 'ALL';
let _activeExt  = 'ALL';
let _searchQ    = '';
let _catCounts  = {};   // { cat: count }

/* ══════════════════════════════════════
   DOM refs
══════════════════════════════════════ */
const $ = id => document.getElementById(id);
const elLoading    = $('sm-loading');
const elEmpty      = $('sm-empty');
const elScrollHost = $('sm-scroll-host');
const elSizer      = $('sm-scroll-sizer');
const elViewport   = $('sm-cards-viewport');
const elCatNav     = $('sm-cat-nav');
const elExtBtns    = $('sm-ext-btns');
const elSearch     = $('sm-search');
const elClear      = $('sm-search-clear');
const elResultLbl  = $('sm-result-label');
const elStatTotal  = $('sm-stat-total');
const elStatFilter = $('sm-stat-filtered');

/* ══════════════════════════════════════
   fetch & 初期化
══════════════════════════════════════ */
async function init() {
  try {
    const res = await fetch('./scripts_inventory.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    _allData = await res.json();

    // 空・不正エントリを除去
    _allData = _allData.filter(d => d && d.filename);

    buildCatCounts();
    buildCatNav();
    elStatTotal.textContent = `${_allData.length.toLocaleString()} scripts`;

    applyFilter();
    elLoading.classList.add('sm-hidden');

    setupVirtualScroll();
    setupEvents();

  } catch (err) {
    console.error('[ScriptManual] fetch失敗:', err);
    elLoading.innerHTML = `<div style="color:#e74c3c;letter-spacing:2px;font-size:11px;">
      ❌ scripts_inventory.json の読み込みに失敗しました<br>
      <span style="color:#7a6e5e;font-size:9px;margin-top:8px;display:block">${err.message}</span>
    </div>`;
  }
}

/* ══════════════════════════════════════
   カテゴリ集計
══════════════════════════════════════ */
function buildCatCounts() {
  _catCounts = { ALL: _allData.length };
  for (const d of _allData) {
    const c = d.category || '';
    _catCounts[c] = (_catCounts[c] || 0) + 1;
  }
}

/* ══════════════════════════════════════
   サイドバー: カテゴリ nav 生成
══════════════════════════════════════ */
function buildCatNav() {
  elCatNav.innerHTML = '';

  // ALL ボタン
  elCatNav.appendChild(makeCatBtn('ALL', 'ALL', _allData.length));

  // 定義順で並べ、残りは末尾に追加
  const known = new Set(CAT_ORDER);
  const extra = Object.keys(_catCounts).filter(c => c !== 'ALL' && !known.has(c));
  const order = [...CAT_ORDER, ...extra].filter(c => _catCounts[c] > 0);

  for (const cat of order) {
    if (!_catCounts[cat]) continue;
    elCatNav.appendChild(makeCatBtn(cat, CAT_LABEL[cat] || cat.toUpperCase(), _catCounts[cat]));
  }
}

function makeCatBtn(cat, label, count) {
  const btn = document.createElement('button');
  btn.className = 'sm-cat-btn' + (cat === _activeCat ? ' sm-active' : '');
  btn.dataset.cat = cat;
  btn.innerHTML = `<span class="sm-cat-name">${label}</span><span class="sm-cat-count">${count.toLocaleString()}</span>`;
  btn.addEventListener('click', () => {
    _activeCat = cat;
    updateCatActive();
    applyFilter();
  });
  return btn;
}

function updateCatActive() {
  document.querySelectorAll('.sm-cat-btn').forEach(b => {
    b.classList.toggle('sm-active', b.dataset.cat === _activeCat);
  });
}

/* ══════════════════════════════════════
   フィルタ適用
══════════════════════════════════════ */
function applyFilter() {
  const q = _searchQ.toLowerCase();

  _filtered = _allData.filter(d => {
    if (_activeCat !== 'ALL' && d.category !== _activeCat) return false;
    if (_activeExt !== 'ALL' && d.ext !== _activeExt) return false;
    if (q && !d.filename.toLowerCase().includes(q)) return false;
    return true;
  });

  updateResultLabel();
  renderVirtual();
}

function updateResultLabel() {
  const n = _filtered.length;
  elResultLbl.textContent = `${n.toLocaleString()} 件`;
  if (_activeCat !== 'ALL' || _activeExt !== 'ALL' || _searchQ) {
    elStatFilter.textContent = `表示中: ${n.toLocaleString()}`;
  } else {
    elStatFilter.textContent = '';
  }

  elEmpty.classList.toggle('sm-hidden', n > 0);
  elScrollHost.style.visibility = n > 0 ? 'visible' : 'hidden';
}

/* ══════════════════════════════════════
   Virtual Scroll
══════════════════════════════════════ */
let _vsRafId   = null;
let _lastStart = -1;
let _lastEnd   = -1;

function setupVirtualScroll() {
  elScrollHost.addEventListener('scroll', onScroll, { passive: true });
  // ResizeObserver でコンテナサイズ変化にも対応
  if (window.ResizeObserver) {
    new ResizeObserver(() => renderVirtual()).observe(elScrollHost);
  }
}

function onScroll() {
  if (_vsRafId) return;
  _vsRafId = requestAnimationFrame(() => {
    _vsRafId = null;
    renderVirtual();
  });
}

function renderVirtual() {
  const total = _filtered.length;
  const totalH = total * ROW_H;
  elSizer.style.height = totalH + 'px';

  if (total === 0) {
    elViewport.innerHTML = '';
    _lastStart = _lastEnd = -1;
    return;
  }

  const hostH    = elScrollHost.clientHeight;
  const scrollY  = elScrollHost.scrollTop;
  const startIdx = Math.max(0, Math.floor(scrollY / ROW_H) - OVERSCAN);
  const endIdx   = Math.min(total - 1, Math.ceil((scrollY + hostH) / ROW_H) + OVERSCAN);

  // 範囲変化がなければ再描画しない
  if (startIdx === _lastStart && endIdx === _lastEnd) return;
  _lastStart = startIdx;
  _lastEnd   = endIdx;

  const frag = document.createDocumentFragment();
  for (let i = startIdx; i <= endIdx; i++) {
    frag.appendChild(makeCard(_filtered[i], i));
  }

  elViewport.innerHTML = '';
  elViewport.style.transform = `translateY(${startIdx * ROW_H}px)`;
  elViewport.appendChild(frag);
}

/* ══════════════════════════════════════
   カード生成
══════════════════════════════════════ */
function makeCard(d, _idx) {
  const div = document.createElement('div');
  div.className = 'sm-card';

  const extClass = { sh: 'sm-ext-sh', py: 'sm-ext-py', js: 'sm-ext-js' }[d.ext] || 'sm-ext-other';
  const extLabel = d.ext ? `.${d.ext}` : '?';
  const filename = _searchQ ? highlight(d.filename, _searchQ) : escHtml(d.filename);
  const summary  = d.summary ? escHtml(d.summary) : '';
  const path     = escHtml(d.path || '');
  const cat      = escHtml(CAT_LABEL[d.category] || d.category || '—');

  div.innerHTML = `
    <div class="sm-card-ext ${extClass}">${extLabel}</div>
    <div class="sm-card-body">
      <div class="sm-card-filename">${filename}</div>
      <div class="sm-card-meta">
        <span class="sm-card-cat">${cat}</span>
        <span class="sm-card-path">${path}</span>
      </div>
      ${summary ? `<div class="sm-card-summary">${summary}</div>` : ''}
    </div>
  `;
  return div;
}

/* ══════════════════════════════════════
   ハイライト
══════════════════════════════════════ */
function highlight(text, q) {
  const safe = escHtml(text);
  const safeQ = escHtml(q);
  const re = new RegExp(`(${escRegex(safeQ)})`, 'gi');
  return safe.replace(re, '<span class="sm-hl">$1</span>');
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/* ══════════════════════════════════════
   イベント
══════════════════════════════════════ */
function setupEvents() {
  // 検索
  let searchTimer = null;
  elSearch.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      _searchQ = elSearch.value.trim();
      elClear.classList.toggle('sm-visible', _searchQ.length > 0);
      // フィルタ再適用時はスクロール位置をリセット
      elScrollHost.scrollTop = 0;
      _lastStart = _lastEnd = -1;
      applyFilter();
    }, 120);
  });

  // 検索クリア
  elClear.addEventListener('click', () => {
    elSearch.value = '';
    _searchQ = '';
    elClear.classList.remove('sm-visible');
    elScrollHost.scrollTop = 0;
    _lastStart = _lastEnd = -1;
    applyFilter();
    elSearch.focus();
  });

  // ext フィルタ
  elExtBtns.addEventListener('click', e => {
    const btn = e.target.closest('.sm-ext-btn');
    if (!btn) return;
    _activeExt = btn.dataset.ext;
    document.querySelectorAll('.sm-ext-btn').forEach(b => {
      b.classList.toggle('sm-active', b.dataset.ext === _activeExt);
    });
    elScrollHost.scrollTop = 0;
    _lastStart = _lastEnd = -1;
    applyFilter();
  });

  // キーボードショートカット
  document.addEventListener('keydown', e => {
    // / or Ctrl+F → フォーカス
    if ((e.key === '/' || (e.ctrlKey && e.key === 'f')) && document.activeElement !== elSearch) {
      e.preventDefault();
      elSearch.focus();
      elSearch.select();
    }
    // Esc → クリア
    if (e.key === 'Escape' && document.activeElement === elSearch) {
      elSearch.blur();
      if (_searchQ) {
        elSearch.value = '';
        _searchQ = '';
        elClear.classList.remove('sm-visible');
        elScrollHost.scrollTop = 0;
        _lastStart = _lastEnd = -1;
        applyFilter();
      }
    }
  });
}

/* ══════════════════════════════════════
   起動
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', init);
