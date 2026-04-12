/* ============================================================
   MeritCore Script Guide — guide.js
   責務: サイドバーアクティブ追跡 / ページ内検索ハイライト / スクロール
   ============================================================ */
'use strict';

/* ══════════════════════════════════════
   IntersectionObserver でナビアクティブ追跡
══════════════════════════════════════ */
function initNavTracking() {
  const navLinks = document.querySelectorAll('.sg-nav-link');
  const sections = document.querySelectorAll('.sg-section');

  if (!sections.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        link.classList.toggle('sg-active', href === `#${id}`);
      });
    });
  }, {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0,
  });

  sections.forEach(s => observer.observe(s));
}

/* ══════════════════════════════════════
   ページ内検索ハイライト
══════════════════════════════════════ */
const content = document.getElementById('sg-content');

function escRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// テキストノードだけを対象に highlight/unhighlight する
let _highlighted = [];

function clearHighlights() {
  _highlighted.forEach(span => {
    const parent = span.parentNode;
    if (!parent) return;
    parent.replaceChild(document.createTextNode(span.textContent), span);
    parent.normalize();
  });
  _highlighted = [];
}

function applyHighlight(q) {
  clearHighlights();
  if (!q || q.length < 2) return;

  const re = new RegExp(`(${escRegex(q)})`, 'gi');
  const walker = document.createTreeWalker(
    content,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        // サイドバーと検索フォームは除外
        const p = node.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        if (p.closest('.sg-sidebar')) return NodeFilter.FILTER_REJECT;
        if (p.tagName === 'SCRIPT' || p.tagName === 'STYLE') return NodeFilter.FILTER_REJECT;
        if (p.classList.contains('sg-highlight-search')) return NodeFilter.FILTER_REJECT;
        return node.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      }
    }
  );

  const nodes = [];
  let node;
  while ((node = walker.nextNode())) nodes.push(node);

  nodes.forEach(textNode => {
    if (!re.test(textNode.textContent)) return;
    re.lastIndex = 0;

    const frag = document.createDocumentFragment();
    let last = 0;
    let m;

    while ((m = re.exec(textNode.textContent)) !== null) {
      if (m.index > last) {
        frag.appendChild(document.createTextNode(textNode.textContent.slice(last, m.index)));
      }
      const span = document.createElement('span');
      span.className = 'sg-highlight-search';
      span.textContent = m[0];
      frag.appendChild(span);
      _highlighted.push(span);
      last = re.lastIndex;
    }

    if (last < textNode.textContent.length) {
      frag.appendChild(document.createTextNode(textNode.textContent.slice(last)));
    }

    textNode.parentNode.replaceChild(frag, textNode);
  });

  // 最初のマッチにスクロール
  if (_highlighted.length) {
    _highlighted[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function initSearch() {
  const input = document.getElementById('sg-search');
  if (!input) return;

  let timer = null;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      applyHighlight(input.value.trim());
    }, 200);
  });

  // Esc でクリア
  input.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      input.value = '';
      clearHighlights();
    }
  });
}

/* ══════════════════════════════════════
   キーボードショートカット
══════════════════════════════════════ */
function initKeyboard() {
  const searchInput = document.getElementById('sg-search');

  document.addEventListener('keydown', e => {
    // / でサイドバー検索フォーカス
    if (e.key === '/' && document.activeElement !== searchInput) {
      e.preventDefault();
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    }
  });
}

/* ══════════════════════════════════════
   初期化
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initNavTracking();
  initSearch();
  initKeyboard();
});
