// ============================================================
// Merit Knowledge Core - FINAL app.js
// ============================================================

let allData     = [];
let filtered    = [];
let currentType = 'All';
let currentKw   = '';
let activeId    = null;

// ============================================================
// 初期化
// ============================================================
window.addEventListener('DOMContentLoaded', () => {
  init();
});

function init() {
  fetch('db.json')
    .then(res => {
      if (!res.ok) throw new Error('db.json が見つかりません: ' + res.status);
      return res.json();
    })
    .then(data => {
      allData = data;
      updateStats();
      bindUI();
      applyFilter();
    })
    .catch(err => {
      document.getElementById('card-list').innerHTML =
        `<div class="empty">エラー: ${err.message}</div>`;
    });
}

// ============================================================
// UIイベント登録
// ============================================================
function bindUI() {
  // 検索
  document.getElementById('search').addEventListener('input', e => {
    currentKw = e.target.value;
    applyFilter();
  });

  // フィルタ
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentType = btn.dataset.type;
      applyFilter();
    });
  });

  // 詳細閉じる
  document.getElementById('detail-close').addEventListener('click', () => {
    document.getElementById('detail-panel').classList.remove('open');
    document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));
    activeId = null;
  });
}

// ============================================================
// 統計
// ============================================================
function updateStats() {
  document.getElementById('stat-total').textContent = allData.length;
  document.getElementById('stat-kn').textContent =
    allData.filter(d => d.type === 'Knowledge').length;
  document.getElementById('stat-sc').textContent =
    allData.filter(d => d.type === 'Script').length;
  document.getElementById('stat-hs').textContent =
    allData.filter(d => d.type === 'History').length;
}

// ============================================================
// フィルタ＋検索
// ============================================================
function applyFilter() {
  const kw = currentKw.toLowerCase();

  filtered = allData.filter(item => {
    const typeMatch = currentType === 'All' || item.type === currentType;
    if (!typeMatch) return false;

    if (!kw) return true;

    return (
      (item.summary  || '').toLowerCase().includes(kw) ||
      (item.detail   || '').toLowerCase().includes(kw) ||
      (item.id       || '').toLowerCase().includes(kw) ||
      (item.category || '').toLowerCase().includes(kw)
    );
  });

  document.getElementById('search-count').textContent =
    kw || currentType !== 'All' ? `${filtered.length} / ${allData.length}` : '';

  renderCards(filtered);
}

// ============================================================
// カード描画
// ============================================================
function renderCards(list) {
  const container = document.getElementById('card-list');

  if (list.length === 0) {
    container.innerHTML = '<div class="empty">NO RESULTS</div>';
    return;
  }

  container.innerHTML = list.map(item => {
    const relations = (item.relation || [])
      .map(r => `<span class="rel-tag" data-id="${r}">${r}</span>`)
      .join('');

    return `
      <div class="card type-${item.type}" data-id="${item.id}">
        <div class="card-head">
          <span class="card-id">${item.id}</span>
          <span class="card-type">${item.type}</span>
        </div>

        <div class="card-summary">${item.summary || ''}</div>
        <div class="card-category">${item.category || ''}</div>

        ${relations ? `<div class="card-relation">${relations}</div>` : ''}
      </div>
    `;
  }).join('');

  // カードクリック
  container.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.classList.contains('rel-tag')) return;
      openDetail(card.dataset.id);
    });
  });

  // RELATIONクリック
  container.querySelectorAll('.rel-tag').forEach(tag => {
    tag.addEventListener('click', e => {
      e.stopPropagation();
      jumpTo(tag.dataset.id);
    });
  });
}

// ============================================================
// 詳細表示
// ============================================================
function openDetail(id) {
  const item = allData.find(d => d.id === id);
  if (!item) return;

  activeId = id;

  const panel   = document.getElementById('detail-panel');
  const content = document.getElementById('detail-content');

  const relations = (item.relation || []).map(r =>
    `<button class="detail-rel-btn" data-id="${r}">${r}</button>`
  ).join('');

  const source = item.source
    ? `<div class="detail-label">SOURCE</div><div>${item.source}</div>`
    : '';

  content.innerHTML = `
    <div class="detail-id">${item.id}</div>
    <div class="detail-summary">${item.summary || ''}</div>

    <div class="detail-label">DETAIL</div>
    <div>${(item.detail || '').replace(/\n/g, '<br>')}</div>

    ${source}

    ${relations ? `
      <div class="detail-label">RELATION</div>
      <div>${relations}</div>
    ` : ''}
  `;

  panel.classList.add('open');

  content.querySelectorAll('.detail-rel-btn').forEach(btn => {
    btn.addEventListener('click', () => jumpTo(btn.dataset.id));
  });

  document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));

  const activeCard = document.querySelector(`.card[data-id="${id}"]`);
  if (activeCard) {
    activeCard.classList.add('active');
    activeCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// ============================================================
// RELATIONジャンプ
// ============================================================
function jumpTo(id) {
  currentType = 'All';
  currentKw   = '';

  document.getElementById('search').value = '';

  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.filter-btn[data-type="All"]').classList.add('active');

  applyFilter();

  setTimeout(() => {
    const target = document.querySelector(`.card[data-id="${id}"]`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      openDetail(id);
    }
  }, 50);
}