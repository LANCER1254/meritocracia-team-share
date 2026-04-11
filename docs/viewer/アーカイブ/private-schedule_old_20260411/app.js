/* ============================================================
   MERITOCRACIA OS — 作業卓 / app.js  v3
   責務: 時計 / 週間スケジュール / ポモドーロ / 年間カレンダー / 初期化
   ============================================================ */
'use strict';

/* ══════════════════════════════════════
   定数・ユーティリティ
══════════════════════════════════════ */
const DAY_KEYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const DAYS_JP = ['日', '月', '火', '水', '木', '金', '土'];
const BLOCKS = [
  { key: 'morning', label: 'MORNING   06:00–12:00', min: [6 * 60, 12 * 60] },
  { key: 'afternoon', label: 'AFTERNOON 12:00–18:00', min: [12 * 60, 18 * 60] },
  { key: 'night', label: 'NIGHT     18:00–06:00', min: [18 * 60, 30 * 60] },
];

const pad = n => String(n).padStart(2, '0');

/** "HH:MM" → 分数（深夜0〜5時は+24h） */
function t2m(t) {
  const [h, m] = t.split(':').map(Number);
  return (h < 6 ? h + 24 : h) * 60 + m;
}

/** 現在分数（深夜補正） */
function nowMin() {
  const d = new Date();
  const h = d.getHours();
  return (h < 6 ? h + 24 : h) * 60 + d.getMinutes();
}

/** 今日の DAY_KEY ("MON"〜"SUN") */
function todayKey() {
  return DAY_KEYS[new Date().getDay()];
}

/* ══════════════════════════════════════
   時計
══════════════════════════════════════ */
function updateClock() {
  const now = new Date();
  document.getElementById('ps-clock-time').textContent =
    `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  document.getElementById('ps-clock-date').textContent =
    `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} (${DAYS_JP[now.getDay()]})`;
}

/* ══════════════════════════════════════
   週間プログレス
══════════════════════════════════════ */
function renderProgress(pct) {
  const fill = document.getElementById('ps-wp-fill');
  const label = document.getElementById('ps-wp-pct');
  if (!fill || !label) return;
  const v = Math.min(100, Math.max(0, pct));
  fill.style.width = v + '%';
  label.textContent = v + '%';
}

/* ══════════════════════════════════════
   スケジュール描画
══════════════════════════════════════ */
let _scheduleData = null;  // fetch済みデータを保持
let _activeDay = null;  // 現在表示中の day key

/** タブのアクティブ状態を更新 */
function setActiveTab(dayKey) {
  document.querySelectorAll('.ps-day-tab').forEach(btn => {
    const isActive = btn.dataset.day === dayKey;
    // Firefox safe: classList
    btn.classList.toggle('ps-active', isActive);
  });
  _activeDay = dayKey;
}

/** タスクカードを1枚生成して返す */
function makeTaskCard(task, nm) {
  const m = t2m(task.time);
  const end = _scheduleData
    ? (() => {
      const tasks = _scheduleData.days[_activeDay]?.tasks ?? [];
      const idx = tasks.indexOf(task);
      return idx + 1 < tasks.length ? t2m(tasks[idx + 1].time) : m + 24 * 60;
    })()
    : m + 60;

  const isCurrent = nm >= m && nm < end;
  const isPast = nm >= end;

  const card = document.createElement('div');
  card.className = 'ps-task-card';
  // Firefox safe classList
  if (isCurrent) card.classList.add('ps-current');
  else if (isPast) card.classList.add('ps-past');

  const catClass = {
    writing: 'ps-cat-writing',
    dev: 'ps-cat-dev',
    meeting: 'ps-cat-meeting',
    rest: 'ps-cat-rest',
  }[task.cat] || 'ps-cat-rest';

  card.innerHTML = `
    <span class="ps-task-time">${task.time}</span>
    <span class="ps-task-cat ${catClass}">${task.cat?.toUpperCase() ?? ''}</span>
    <span class="ps-task-label">${task.label}</span>
    <span class="ps-task-dot"></span>
  `;
  return card;
}

/**
 * 指定 dayKey のスケジュールを描画する。
 * 当日ならNOWバナーも更新。
 */
function renderDay(dayKey) {
  if (!_scheduleData) return;
  setActiveTab(dayKey);

  const dayData = _scheduleData.days[dayKey];
  const container = document.getElementById('ps-blocks');
  container.innerHTML = '';

  const nm = nowMin();
  const isToday = dayKey === todayKey();

  // NOWバナー
  const banner = document.getElementById('ps-now-banner');
  if (isToday) {
    banner.classList.remove('ps-hidden');
    updateNowBanner(dayData?.tasks ?? []);
  } else {
    banner.classList.add('ps-hidden');
  }

  if (!dayData || !dayData.tasks.length) {
    container.innerHTML = '<div class="ps-no-tasks">— 予定なし —</div>';
    return;
  }

  // time-of-day ブロックに分類
  BLOCKS.forEach(block => {
    const inBlock = dayData.tasks.filter(task => {
      const m = t2m(task.time);
      return m >= block.min[0] && m < block.min[1];
    });
    if (!inBlock.length) return;

    const section = document.createElement('div');
    section.className = 'ps-time-block';

    const label = document.createElement('div');
    label.className = 'ps-block-label';
    label.textContent = block.label;
    section.appendChild(label);

    inBlock.forEach(task => {
      section.appendChild(makeTaskCard(task, isToday ? nm : -1));
    });
    container.appendChild(section);
  });
}

/** NOWバナーの内容を更新（当日のみ） */
function updateNowBanner(tasks) {
  const nm = nowMin();
  let currentIdx = -1;

  for (let i = 0; i < tasks.length; i++) {
    const start = t2m(tasks[i].time);
    const end = i + 1 < tasks.length ? t2m(tasks[i + 1].time) : start + 24 * 60;
    if (nm >= start && nm < end) { currentIdx = i; break; }
  }

  const taskEl = document.getElementById('ps-now-task');
  const remEl = document.getElementById('ps-now-remaining');

  if (currentIdx >= 0) {
    taskEl.textContent = tasks[currentIdx].label;
    if (currentIdx + 1 < tasks.length) {
      const diff = t2m(tasks[currentIdx + 1].time) - nm;
      const h = Math.floor(diff / 60), m = diff % 60;
      const next = tasks[currentIdx + 1].label;
      remEl.textContent = h > 0 ? `${h}時間${m}分後に「${next}」` : `${m}分後に「${next}」`;
    } else {
      remEl.textContent = '本日の予定終了';
    }
  } else {
    taskEl.textContent = '予定時間外';
    remEl.textContent = tasks.length ? `次: ${tasks[0].time} ${tasks[0].label}` : '—';
  }
}

/** 1秒ごとに当日表示を差分更新（再描画コスト最小） */
function tickSchedule() {
  if (!_scheduleData || !_activeDay) return;
  if (_activeDay !== todayKey()) return; // 他曜タブは静的でOK
  const dayData = _scheduleData.days[_activeDay];
  updateNowBanner(dayData?.tasks ?? []);
  // current/past クラスだけ差し替え
  renderDay(_activeDay);
}

/* ══════════════════════════════════════
   ポモドーロ
══════════════════════════════════════ */
const WORK_SEC = 25 * 60;
const BREAK_SEC = 5 * 60;
const CIRCUMF = 2 * Math.PI * 42; // ≒263.9

const pomo = {
  running: false, isBreak: false,
  remain: WORK_SEC, sessions: 1, timer: null,
};

function ringSet(ratio) {
  document.getElementById('ps-ring').style.strokeDashoffset = CIRCUMF * (1 - ratio);
}

function renderPomo() {
  const total = pomo.isBreak ? BREAK_SEC : WORK_SEC;

  document.getElementById('ps-pomo-timer').textContent =
    `${pad(Math.floor(pomo.remain / 60))}:${pad(pomo.remain % 60)}`;

  const modeEl = document.getElementById('ps-pomo-mode');
  modeEl.textContent = pomo.isBreak ? 'BREAK' : 'WORK';
  // Firefox safe classList
  modeEl.classList.toggle('ps-break', pomo.isBreak);

  document.getElementById('ps-pomo-session').textContent = `SESSION ${pomo.sessions}`;

  const ring = document.getElementById('ps-ring');
  ring.classList.toggle('ps-break', pomo.isBreak);

  ringSet(pomo.remain / total);

  const startBtn = document.getElementById('ps-btn-start');
  startBtn.textContent = pomo.running ? 'RUNNING' : 'START';
  startBtn.classList.toggle('ps-primary', !pomo.running);
}

function pomoTick() {
  if (pomo.remain <= 0) {
    pomo.isBreak = !pomo.isBreak;
    if (!pomo.isBreak) pomo.sessions++;
    pomo.remain = pomo.isBreak ? BREAK_SEC : WORK_SEC;
  } else {
    pomo.remain--;
  }
  renderPomo();
}

function pomoStart() {
  if (pomo.running) return;
  pomo.running = true;
  pomo.timer = setInterval(pomoTick, 1000);
  renderPomo();
}

function pomoPause() {
  if (!pomo.running) return;
  pomo.running = false;
  clearInterval(pomo.timer);
  renderPomo();
}

function pomoReset() {
  pomoPause();
  Object.assign(pomo, { isBreak: false, remain: WORK_SEC, sessions: 1 });
  renderPomo();
}

/* ══════════════════════════════════════
   fetch & 初期化
══════════════════════════════════════ */
async function loadSchedule() {
  try {
    const res = await fetch('./schedule.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    _scheduleData = await res.json();

    // 週間プログレス
    if (_scheduleData.weekly_progress != null) {
      renderProgress(_scheduleData.weekly_progress);
    }

    // 当日タブにドット
    const today = todayKey();
    document.querySelectorAll('.ps-day-tab').forEach(btn => {
      if (btn.dataset.day === today) btn.classList.add('ps-today');
    });

    // 当日を初期表示
    renderDay(today);

    // 1秒ごと更新
    setInterval(tickSchedule, 1000);

    // ── 年間カレンダー描画 ──
    renderYearlyCalendar(2026, _scheduleData.publishing || []);

  } catch (err) {
    console.error('[private-schedule] fetch失敗:', err);
    document.getElementById('ps-now-task').textContent = 'スケジュール読込エラー';
    document.getElementById('ps-now-remaining').textContent = 'schedule.json を確認';
  }
}

document.addEventListener('DOMContentLoaded', () => {

  // 時計
  updateClock();
  setInterval(updateClock, 1000);

  // ポモドーロ
  renderPomo();
  document.getElementById('ps-btn-start').addEventListener('click', pomoStart);
  document.getElementById('ps-btn-pause').addEventListener('click', pomoPause);
  document.getElementById('ps-btn-reset').addEventListener('click', pomoReset);

  // タブクリック
  document.getElementById('ps-day-tabs').addEventListener('click', e => {
    const btn = e.target.closest('.ps-day-tab');
    if (!btn) return;
    renderDay(btn.dataset.day);
  });

  // ── カード内切替タブ ──
  document.getElementById('ps-view-tabs').addEventListener('click', e => {
    const btn = e.target.closest('.ps-view-tab');
    if (!btn) return;
    switchView(btn.dataset.view);
  });

  // スケジュール読込
  loadSchedule();
});

/* ══════════════════════════════════════
   表示切替（カード内）
══════════════════════════════════════ */
function switchView(view) {
  // タブ状態
  document.querySelectorAll('.ps-view-tab').forEach(btn => {
    btn.classList.toggle('ps-view-active', btn.dataset.view === view);
  });
  // 右カラム内ビュー切替
  document.getElementById('ps-view-weekly').classList.toggle('ps-hidden', view !== 'weekly');
  document.getElementById('ps-view-yearly').classList.toggle('ps-hidden', view !== 'yearly');
  // 年間カレンダー時はレイアウト幅を広げる
  document.querySelector('.ps-wrap').classList.toggle('ps-wide', view === 'yearly');
}

/* ══════════════════════════════════════
   年間カレンダー
══════════════════════════════════════ */
const MONTH_NAMES = [
  '1月 January',  '2月 February',  '3月 March',
  '4月 April',    '5月 May',       '6月 June',
  '7月 July',     '8月 August',    '9月 September',
  '10月 October', '11月 November', '12月 December',
];
const CAL_DOW = ['月','火','水','木','金','土','日'];

function renderYearlyCalendar(year, events) {
  const grid = document.getElementById('ps-yearly-grid');
  if (!grid) return;
  grid.innerHTML = '';
  const evMap = {};
  events.forEach(ev => {
    if (!evMap[ev.date]) evMap[ev.date] = [];
    evMap[ev.date].push(ev);
  });
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;
  for (let m = 0; m < 12; m++) {
    grid.appendChild(buildMonthCard(year, m, evMap, todayStr));
  }
}

function buildMonthCard(year, month, evMap, todayStr) {
  const card = document.createElement('div');
  card.className = 'ps-month-card';

  const title = document.createElement('div');
  title.className = 'ps-month-title';
  title.textContent = MONTH_NAMES[month];
  card.appendChild(title);

  const table = document.createElement('table');
  table.className = 'ps-cal-table';

  // ヘッダー
  const thead = document.createElement('thead');
  const hRow = document.createElement('tr');
  CAL_DOW.forEach((d, i) => {
    const th = document.createElement('th');
    th.textContent = d;
    if (i === 5) th.className = 'ps-cal-sat';
    if (i === 6) th.className = 'ps-cal-sun';
    hRow.appendChild(th);
  });
  thead.appendChild(hRow);
  table.appendChild(thead);

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  const tbody = document.createElement('tbody');
  let day = 1, cellIdx = 0;

  for (let week = 0; week < 6; week++) {
    if (day > daysInMonth) break;
    const tr = document.createElement('tr');
    for (let col = 0; col < 7; col++) {
      const td = document.createElement('td');
      if (cellIdx < startDow || day > daysInMonth) {
        td.className = 'ps-cal-empty';
        td.innerHTML = '&nbsp;';
      } else {
        if (col === 5) td.classList.add('ps-cal-sat');
        if (col === 6) td.classList.add('ps-cal-sun');
        const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
        if (dateStr === todayStr) td.classList.add('ps-cal-today');
        const numSpan = document.createElement('span');
        numSpan.className = 'ps-cal-day-num';
        numSpan.textContent = day;
        td.appendChild(numSpan);
        if (evMap[dateStr]) {
          const evWrap = document.createElement('div');
          evWrap.className = 'ps-cal-events';
          evMap[dateStr].forEach(ev => {
            const badge = document.createElement('div');
            const typeClass = {
              narou: 'ps-cal-ev-narou', meeting: 'ps-cal-ev-meeting',
              deadline: 'ps-cal-ev-deadline',
            }[ev.type] || 'ps-cal-ev-default';
            badge.className = `ps-cal-ev ${typeClass}`;
            badge.textContent = ev.title.length > 8 ? ev.title.slice(0, 8) + '…' : ev.title;
            badge.setAttribute('data-tooltip', `${ev.time} ${ev.title}`);
            evWrap.appendChild(badge);
          });
          td.appendChild(evWrap);
        }
        day++;
      }
      tr.appendChild(td);
      cellIdx++;
    }
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  card.appendChild(table);
  return card;
}
