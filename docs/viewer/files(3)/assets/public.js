/* ============================================================
   MERITOCRACIA — 公開用JavaScript
   ファイル: assets/public.js
   用途: index.html（一般公開）専用

   動作概要:
   1. data/data_public.json を fetch
   2. "public": true のエントリのみ抽出
   3. セクション別にカードを生成
   4. カードナビゲーションを生成
   ============================================================ */

// ============================================================
// セクション定義
// JSONのcategoryとHTMLセクションIDの対応表
// 追加する場合はここに追記するだけでOK
// ============================================================
const SECTIONS = [
  { id: 'world',     label: '世界観',   en: 'WORLD',     icon: '🌍', category: '世界観' },
  { id: 'character', label: 'キャラ',   en: 'CHARACTER', icon: '👤', category: 'キャラクター' },
  { id: 'story',     label: 'ストーリー', en: 'STORY',   icon: '📖', category: 'ストーリー' },
  { id: 'news',      label: 'NEWS',     en: 'NEWS',      icon: '📢', category: 'NEWS' },
];

// ============================================================
// メイン処理
// ============================================================
document.addEventListener('DOMContentLoaded', () => {

  fetch('./data/data_public.json')
    .then(res => {
      if (!res.ok) throw new Error(`data_public.json の読み込みに失敗: ${res.status}`);
      return res.json();
    })
    .then(data => {
      // public: true のエントリのみ抽出
      const publicData = data.filter(item => item.public === true);

      buildCardNav(publicData);
      buildSections(publicData);
    })
    .catch(err => {
      console.error('[MERITOCRACIA]', err.message);
      // JSONが未作成の場合でもサイト自体は表示される（エラー非表示）
    });

});

// ============================================================
// カードナビゲーション生成
// ============================================================
function buildCardNav(data) {
  const nav = document.getElementById('card-nav');
  if (!nav) return;

  SECTIONS.forEach(sec => {
    // そのセクションにデータが1件以上あるか確認
    const hasItems = data.some(item => item.category === sec.category);
    if (!hasItems) return; // データがないセクションはナビにも表示しない

    const a = document.createElement('a');
    a.className = 'nav-card';
    a.href = `#${sec.id}`;
    a.innerHTML = `
      <span class="nav-card-icon">${sec.icon}</span>
      <div class="nav-card-name">${sec.en}</div>
      <div class="nav-card-ja">${sec.label}</div>
    `;
    nav.appendChild(a);
  });
}

// ============================================================
// セクション生成
// ============================================================
function buildSections(data) {
  const container = document.getElementById('sections');
  if (!container) return;

  SECTIONS.forEach((sec, index) => {
    // そのカテゴリのアイテムを抽出
    const items = data.filter(item => item.category === sec.category);
    if (items.length === 0) return; // データがないセクションはスキップ

    const section = document.createElement('section');
    section.className = 'section-block';
    section.id = sec.id;

    // セクションヘッダー
    const header = `
      <div class="section-header">
        <span class="section-num">${String(index + 1).padStart(2, '0')} / ${sec.en}</span>
        <h2 class="section-title">${sec.label}</h2>
      </div>
    `;

    // コンテンツカード生成
    const cards = items.map(item => buildContentCard(item)).join('');

    section.innerHTML = `
      <div class="section-inner">
        ${header}
        <div class="content-grid">${cards}</div>
      </div>
    `;

    container.appendChild(section);
  });
}

// ============================================================
// コンテンツカード生成
// item の構造:
// {
//   "id": "...",
//   "category": "世界観",
//   "tag": "WORLD",
//   "title": "...",
//   "desc": "...",
//   "link": "./viewer/story/index.html",  // 省略可
//   "link_label": "詳しく見る",            // 省略可
//   "public": true
// }
// ============================================================
function buildContentCard(item) {
  // リンクが設定されている場合のみリンク要素を追加
  const linkHTML = item.link
    ? `<a href="${item.link}">${item.link_label || '詳しく見る →'}</a>`
    : '';

  return `
    <div class="content-card">
      <div class="content-card-tag">${item.tag || item.category.toUpperCase()}</div>
      <div class="content-card-title">${item.title}</div>
      <div class="content-card-desc">${item.desc || ''}</div>
      ${linkHTML}
    </div>
  `;
}
