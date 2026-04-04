'use strict';

/* ============================================================
   CONSTANTS
   ============================================================ */
const STATUS_CONFIG = {
  dead:     { label: '死亡',           dot: '#e05050' },
  captured: { label: '逮捕（影武者）', dot: '#e8c050' },
  escape:   { label: '逃亡・生存',     dot: '#b080f0' },
  civilian: { label: '生存（民間）',   dot: '#60a8e0' },
  unknown:  { label: '生死不明',       dot: '#9090b0' },
  shadow:   { label: '要監視・黒幕候補', dot: '#c9a961' },
};

const PHASE_ORDER = [
  '静寂と予兆',
  '英雄的選択と悲劇',
  '決別と覚醒の兆し',
  'FOによる制圧',
  '残酷な現実の確定',
  '政治的幕引き',
  '誓いへ',
];

const HL_BADGE_LABEL = {
  death:     '★ カーネル死亡',
  pivot:     '◆ 転換点',
  deception: '▲ 国家の欺瞞',
  awakening: '◉ 心音覚醒',
  oath:      '✦ 誓い',
};

const FORESHADOW_DATA = [
  {
    icon: '🔮',
    label: 'ABILITY',
    title: '心音システム初覚醒',
    desc: 'Scene14の異常な心音、Scene25の公開尋問での無自覚発火。「こいつじゃない」という確信がジェイドに生まれる起点。グローリアテストおよび夜化因子判定への直接の伏線。',
    connect: '→ グローリアテスト / 夜化因子 / 能力判定試験',
  },
  {
    icon: '📿',
    label: 'EVIDENCE',
    title: 'ペンダント証拠',
    desc: 'Scene27でカーネルの遺品として発見される七芒星の魔法石ペンダント。触れた瞬間に炎槍の記憶がフラッシュバック。教会バイト編でルカが持っていた物と同一。',
    connect: '→ 教会バイト編回収 / ルカ接点 / 炎翼セル証拠',
  },
  {
    icon: '👦',
    label: 'GUILT',
    title: 'ルカの罪悪感ライン',
    desc: 'Scene28でルカが黒煙を見つめ「ボクは悪くない」と自分に言い聞かせる。ペンダントが消えていることで全てを悟る。クララとは別の「生き残った罪」として作品を厚くする。',
    connect: '→ セラとの再接触 / 証言者候補 / 贖罪ライン',
  },
  {
    icon: '🏛',
    label: 'CONSPIRACY',
    title: '国家による真実隠蔽',
    desc: 'Scene24-26で国家は迅速な「解決」をアピール。D-04《グラム》が実行犯として処刑予定。本当の幹部《アーク》《ヴェル》は逃走、《ノクス》は自害を偽装している可能性がある。',
    connect: '→ グラム公開尋問 / ジェイドの孤独な違和感 / ZERO編エンジン',
  },
  {
    icon: '⛪',
    label: 'CHURCH',
    title: '教会地下黒幕継続',
    desc: 'Scene30の締めで「観測対象、反応あり」「監視継続」が示される。エリオスは神父として平常運用を続けるが、炎翼セル上位セルとの接続役を担う黒幕候補。',
    connect: '→ 炎翼セル上位組織 / エリオス / グローリアテスト編接続',
  },
  {
    icon: '🛡',
    label: 'FO',
    title: 'FOへの憧憬と不信の同居',
    desc: '聖剣で炎槍を止めたガーネットへの憧れ（FOへの憧憬）と、事件を早々に片付けた国家システムへの不信が、ジェイドの中に同時に生まれる。この矛盾がZERO編全体を駆動する。',
    connect: '→ FO入団動機 / 士官学校編 / 国家不信ライン',
  },
];

/* ============================================================
   UTILS
   ============================================================ */
function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

function stagger(elements, base = 0, step = 40) {
  elements.forEach((e, i) => {
    e.style.animationDelay = `${base + i * step}ms`;
  });
}

/* ============================================================
   FETCH BOTH JSON
   ============================================================ */
async function loadAll() {
  const [storyRes, statusRes] = await Promise.all([
    fetch('./terror_story.json'),
    fetch('./terror_status.json'),
  ]);

  if (!storyRes.ok) throw new Error('terror_story.json の読み込みに失敗しました');
  if (!statusRes.ok) throw new Error('terror_status.json の読み込みに失敗しました');

  return {
    story:  await storyRes.json(),
    status: await statusRes.json(),
  };
}

/* ============================================================
   ① INCIDENT HEADER
   ============================================================ */
function renderHeader(story, status) {
  document.getElementById('incident-title').textContent = story.incident;
  document.getElementById('incident-sub').textContent   = story.subtitle;

  const members  = status.members;
  const dead     = members.filter(m => m.status === 'dead').length;
  const escape   = members.filter(m => m.status === 'escape' || m.status === 'unknown').length;
  const captured = members.filter(m => m.status === 'captured').length;

  document.getElementById('stat-dead').textContent     = dead;
  document.getElementById('stat-escape').textContent   = escape;
  document.getElementById('stat-captured').textContent = captured;
}

/* ============================================================
   ② STORY TIMELINE
   ============================================================ */
function renderTimeline(story) {
  const wrap = document.getElementById('timeline-wrap');
  const scenes = story.scenes;

  // フェーズでグループ化
  const phases = {};
  for (const sc of scenes) {
    if (!phases[sc.phase]) phases[sc.phase] = [];
    phases[sc.phase].push(sc);
  }

  const orderedPhases = PHASE_ORDER.filter(p => phases[p]);

  for (const phaseName of orderedPhases) {
    const group = phases[phaseName];

    // フェーズ区切り
    const divider = document.createElement('div');
    divider.className = 'phase-divider';
    divider.innerHTML = `
      <div class="phase-label">
        <span>${group[0].phase_en}</span>
        <span class="phase-label-ja">${phaseName}</span>
      </div>`;
    wrap.appendChild(divider);

    // シーンカード
    const cards = [];
    for (const sc of group) {
      const card = document.createElement('div');
      card.className = 'scene-card' + (sc.highlight ? ` hl-${sc.highlight_type}` : '');

      let inner = `<div class="scene-num">SCENE ${sc.id}</div>`;

      if (sc.highlight) {
        inner += `<div class="hl-badge ${sc.highlight_type}">${HL_BADGE_LABEL[sc.highlight_type]}</div>`;
      }

      inner += `<div class="scene-title">${sc.title}</div>`;
      inner += `<div class="scene-summary">${sc.summary}</div>`;

      if (sc.tags?.length) {
        inner += '<div class="scene-tags">' +
          sc.tags.map(t => `<span class="scene-tag">${t}</span>`).join('') +
          '</div>';
      }

      card.innerHTML = inner;
      wrap.appendChild(card);
      cards.push(card);
    }

    stagger(cards, 0, 50);
  }
}

/* ============================================================
   ③ CELL STATUS DB
   ============================================================ */
function renderStatus(status) {
  const legend = document.getElementById('status-legend');
  const grid   = document.getElementById('status-grid');

  // 凡例
  for (const [key, conf] of Object.entries(STATUS_CONFIG)) {
    const item = el('div', 'legend-item');
    const dot  = el('span', 'legend-dot');
    dot.style.background = conf.dot;
    item.appendChild(dot);
    item.appendChild(el('span', null, conf.label));
    legend.appendChild(item);
  }

  // メンバーカード
  const cards = [];
  for (const m of status.members) {
    const card = el('div', `member-card ${m.status}`);

    const badge = el('div', `status-badge ${m.status}`, m.status_label);
    const idEl  = el('div', 'member-id', m.id);
    const name  = el('div', 'member-name', m.name);
    const role  = el('div', 'member-role', `${m.role}  /  ${m.role_en}`);

    const pub = el('div', 'member-public');
    const pubLabel = el('span', null);
    pubLabel.textContent = 'PUBLIC INFO';
    pub.appendChild(pubLabel);
    pub.appendChild(document.createTextNode(m.public_info));

    const hook = el('div', 'member-hook', m.future_hook);

    card.append(idEl, name, role, badge, pub, hook);
    grid.appendChild(card);
    cards.push(card);
  }

  stagger(cards, 0, 60);

  // FO介入カード
  if (status.fo_involved?.length) {
    const fo = status.fo_involved[0];
    const foCard = el('div', 'fo-card');
    foCard.innerHTML = `
      <div class="fo-label">FO — FRONTORDEN INTERVENTION</div>
      <div class="fo-name">${fo.name}</div>
      <div class="member-role" style="margin-bottom:12px">${fo.role} / ${fo.role_en}</div>
      <div class="fo-action">${fo.action}</div>
      <div style="margin-top:10px;font-size:11px;color:var(--text2);border-top:1px solid var(--border);padding-top:10px">${fo.note}</div>
    `;
    grid.appendChild(foCard);
  }
}

/* ============================================================
   ④ FORESHADOW PANEL
   ============================================================ */
function renderForeshadow() {
  const grid = document.getElementById('foreshadow-grid');
  const cards = [];

  for (const f of FORESHADOW_DATA) {
    const card = el('div', 'foreshadow-card');
    card.innerHTML = `
      <span class="foreshadow-icon">${f.icon}</span>
      <div class="foreshadow-label">${f.label}</div>
      <div class="foreshadow-title">${f.title}</div>
      <div class="foreshadow-desc">${f.desc}</div>
      <div class="foreshadow-connect">${f.connect}</div>
    `;
    grid.appendChild(card);
    cards.push(card);
  }

  stagger(cards, 0, 60);
}

/* ============================================================
   INIT
   ============================================================ */
(async () => {
  try {
    const { story, status } = await loadAll();
    renderHeader(story, status);
    renderTimeline(story);
    renderStatus(status);
    renderForeshadow();
  } catch (err) {
    console.error('[terror.js]', err);
    document.getElementById('error-msg').textContent = err.message;
    document.getElementById('error-msg').style.display = 'block';
  }
})();
