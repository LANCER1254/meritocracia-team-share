'use strict';

/* ============================================================
   DAISIA NOCTURNE — CHARACTER JS
   JSON fetch → DOM render → Night/Dawn toggle
   将来的に character.js として共通化可能な構造
   ============================================================ */

/* ── util ── */
const el = (tag, cls) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  return e;
};

/* ============================================================
   RENDER: HEADER
   ============================================================ */
function renderHeader(data) {
  const h = data.header;
  const f = data.flavor;

  /* ブランドロゴ */
  document.getElementById('char-brand-logo').textContent = h.brand_logo;

  /* キャラ名 */
  document.getElementById('char-name-en').textContent = h.char_name_en;
  document.getElementById('char-name-ja').textContent = h.char_name_ja;

  /* 区切り線 symbol */
  document.querySelectorAll('.char-divider span')
    .forEach(s => s.textContent = h.divider_symbol);

  /* 四隅 symbol */
  document.querySelectorAll('.char-corner-tl, .char-corner-br')
    .forEach(s => s.textContent = h.corner_symbol);

  /* blood-label-header の ::before / ::after 用 */
  const headerEl = document.querySelector('.blood-label-header');
  headerEl.setAttribute('data-corner', h.corner_symbol);

  /* パーティクル生成 */
  const wrap = document.getElementById('char-particle-wrap');
  for (let i = 0; i < h.particle_count; i++) {
    const p = el('div', 'char-particle');
    wrap.appendChild(p);
  }
  /* Dawn ray 生成 */
  for (let i = 0; i < h.dawn_ray_count; i++) {
    const r = el('div', 'char-dawn-ray');
    wrap.appendChild(r);
  }

  /* フレーバーテキスト（Night デフォルト） */
  renderFlavor(f.night);
}

/* ============================================================
   RENDER: FLAVOR TEXT
   ============================================================ */
function renderFlavor(flavor) {
  document.getElementById('char-flavor-text').innerHTML =
    `"${flavor.text}"<br><small style="font-size:10px;letter-spacing:3px;opacity:0.55;">${flavor.sub}</small>`;
}

/* ============================================================
   RENDER: COLOR STRIP
   ============================================================ */
function renderColorStrip(data) {
  const { night, dawn } = data.color_strip;

  const nightStrip = document.getElementById('char-strip-night');
  const dawnStrip  = document.getElementById('char-strip-dawn');

  night.forEach(c => {
    const s = el('span'); s.style.background = c;
    nightStrip.appendChild(s);
  });
  dawn.forEach(c => {
    const s = el('span'); s.style.background = c;
    dawnStrip.appendChild(s);
  });
}

/* ============================================================
   RENDER: PROFILE CARD
   ============================================================ */
function renderProfile(profile) {
  /* タイトル */
  document.getElementById('char-profile-title').textContent = profile.card_title;

  /* フィールド */
  const dl = document.getElementById('char-status-list');
  profile.fields.forEach(f => {
    const dt = el('dt'); dt.textContent = f.label;
    const dd = el('dd'); dd.textContent = f.value;
    dl.appendChild(dt);
    dl.appendChild(dd);
  });

  /* タグ */
  const tagRow = document.getElementById('char-tag-row');
  profile.tags.forEach(t => {
    const span = el('span', 'char-tag');
    span.textContent = t;
    tagRow.appendChild(span);
  });
}

/* ============================================================
   RENDER: CAPABILITY BARS
   ============================================================ */
function renderCapability(cap) {
  document.getElementById('char-cap-title').textContent = cap.card_title;

  const wrap = document.getElementById('char-cap-wrap');
  cap.bars.forEach(b => {
    const row = el('div', 'char-cap-row');

    const label = el('div', 'char-cap-label');
    const lSpan = el('span'); lSpan.textContent = b.label;
    const vSpan = el('span'); vSpan.textContent = b.value;
    label.appendChild(lSpan);
    label.appendChild(vSpan);

    const bar  = el('div', 'char-cap-bar');
    const fill = el('div', 'char-cap-fill');
    fill.style.width = b.value + '%';
    if (b.bar_style) fill.setAttribute('style', `width:${b.value}%;${b.bar_style}`);
    bar.appendChild(fill);

    row.appendChild(label);
    row.appendChild(bar);
    wrap.appendChild(row);
  });
}

/* ============================================================
   RENDER: CONCEPT
   ============================================================ */
function renderConcept(concept) {
  document.getElementById('char-concept-title').textContent = concept.card_title;
  document.getElementById('char-concept-text').innerHTML    = concept.text;
}

/* ============================================================
   RENDER: NOTES（Night / Dawn 共通関数）
   ============================================================ */
function renderNotes(notesData, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const inner = el('div', 'char-notes-inner');

  /* warning label */
  const wl = el('div', 'char-warning-label');
  wl.textContent = notesData.warning_label;
  inner.appendChild(wl);

  /* entries */
  notesData.entries.forEach(entry => {
    const p = el('p');
    p.innerHTML = `<strong>${entry.title}：</strong><br>${entry.body}`;
    inner.appendChild(p);
  });

  /* dossier link */
  if (notesData.dossier) {
    const d    = notesData.dossier;
    const wrap = el('div', 'char-dossier-wrap');
    const link = el('a', 'char-internal-link');
    link.href        = d.href;
    link.textContent = `${d.icon} ${d.label}`;
    wrap.appendChild(link);
    inner.appendChild(wrap);
  }

  container.appendChild(inner);
}

/* ============================================================
   RENDER: FOOTER
   ============================================================ */
function renderFooter(footer) {
  document.getElementById('char-footer-quote').textContent = footer.quote;
  document.getElementById('char-footer-label').textContent = footer.label;
}

/* ============================================================
   TOGGLE: Night / Dawn
   ============================================================ */
function initToggle(data) {
  const btn        = document.getElementById('char-toggle-btn');
  const notesNight = document.getElementById('char-notes-night');
  const notesDawn  = document.getElementById('char-notes-dawn');
  let isDawn = false;

  btn.addEventListener('click', () => {
    isDawn = !isDawn;
    document.body.classList.toggle('dawn-mode', isDawn);

    /* メモ切替 */
    notesNight.style.display = isDawn ? 'none'  : 'block';
    notesDawn.style.display  = isDawn ? 'block' : 'none';

    /* フレーバーテキスト */
    renderFlavor(isDawn ? data.flavor.dawn : data.flavor.night);

    /* ボタンラベル */
    const lbl = btn.querySelector('span');
    if (lbl) lbl.textContent = isDawn ? '☀ Dawn / 🌙 Night' : '🌙 Night / ☀ Dawn';
  });
}

/* ============================================================
   INIT — fetch JSON → render all
   ============================================================ */
(async () => {
  try {
    const res = await fetch('./daisia.json');
    if (!res.ok) throw new Error(`daisia.json の取得に失敗しました (${res.status})`);
    const data = await res.json();

    renderHeader(data);
    renderColorStrip(data);
    renderProfile(data.profile);
    renderCapability(data.capability);
    renderConcept(data.concept);
    renderNotes(data.night_notes, 'char-notes-night');
    renderNotes(data.dawn_notes,  'char-notes-dawn');
    renderFooter(data.footer);
    initToggle(data);

  } catch (err) {
    console.error('[daisia.js]', err);
    const msg = document.getElementById('char-error-msg');
    if (msg) { msg.textContent = err.message; msg.style.display = 'block'; }
  }
})();
