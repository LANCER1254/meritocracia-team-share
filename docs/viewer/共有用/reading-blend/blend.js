/* ============================================================
   LANCER'S READING BLEND — Shared JS
   責務: Night Mode / ストレージ永続化 / fetch utility
   ============================================================ */
'use strict';

/* ── Night Mode ── */
const STORAGE_KEY = 'blend_night';

function applyNightMode(on) {
  document.body.classList.toggle('night-mode', on);
  const btn = document.getElementById('mode-toggle-btn');
  if (btn) btn.textContent = on ? 'Day' : 'Night';
  localStorage.setItem(STORAGE_KEY, on ? '1' : '0');
}

function initNightMode() {
  const saved = localStorage.getItem(STORAGE_KEY);
  // デフォルト: 22時〜6時は自動Night
  const hour = new Date().getHours();
  const autoNight = hour >= 22 || hour < 6;
  const on = saved !== null ? saved === '1' : autoNight;
  applyNightMode(on);

  const btn = document.getElementById('mode-toggle-btn');
  if (btn) {
    btn.addEventListener('click', () => {
      applyNightMode(!document.body.classList.contains('night-mode'));
    });
  }
}

/* ── fetch authors.json ── */
async function fetchAuthors(path = './authors.json') {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('[Reading Blend] authors.json 読み込み失敗:', err);
    return null;
  }
}

/* ── アバター要素生成 ── */
function makeAvatar(author, size = 'sm') {
  const wrap = document.createElement('div');
  wrap.className = size === 'lg' ? 'profile-avatar-lg' : 'author-avatar';

  if (author.avatar) {
    const img = document.createElement('img');
    img.src = author.avatar;
    img.alt = author.name;
    img.onerror = () => {
      img.remove();
      const fb = document.createElement('span');
      fb.className = size === 'lg' ? 'profile-avatar-fallback-lg' : 'author-avatar-fallback';
      fb.textContent = author.avatar_fallback || author.name[0];
      wrap.appendChild(fb);
    };
    wrap.appendChild(img);
  } else {
    const fb = document.createElement('span');
    fb.className = size === 'lg' ? 'profile-avatar-fallback-lg' : 'author-avatar-fallback';
    fb.textContent = author.avatar_fallback || author.name[0];
    wrap.appendChild(fb);
  }
  return wrap;
}

/* ── CTAボタン生成 ── */
function makeCtaBtn(label, href, cls = '') {
  if (!href) return null;
  const a = document.createElement('a');
  a.href = href;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.className = `cta-btn ${cls}`;
  a.textContent = label;
  return a;
}

/* ── タグ要素生成 ── */
function makeTagRow(tags) {
  const row = document.createElement('div');
  row.className = 'tag-row';
  (tags || []).forEach(t => {
    const pill = document.createElement('span');
    pill.className = 'tag-pill';
    pill.textContent = t;
    row.appendChild(pill);
  });
  return row;
}

/* ── permission date フォーマット ── */
function fmtDate(str) {
  if (!str) return '';
  const d = new Date(str);
  return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日 掲載許諾`;
}

/* ── DOMContentLoaded で Night Mode 初期化 ── */
document.addEventListener('DOMContentLoaded', initNightMode);
