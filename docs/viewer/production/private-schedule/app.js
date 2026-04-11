/* ============================================================
   MERITOCRACIA OS — 作業卓 / app.js  v3
   責務: 時計 / 週間スケジュール / ポモドーロ / 年間カレンダー / 初期化
   ============================================================ */
'use strict';

/* ══════════════════════════════════════
   定数・ユーティリティ
══════════════════════════════════════ */
const DAY_KEYS = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
const DAYS_JP  = ['日','月','火','水','木','金','土'];
const BLOCKS   = [
  { key: 'morning',   label: 'MORNING   06:00–12:00', min: [6*60, 12*60] },
  { key: 'afternoon', label: 'AFTERNOON 12:00–18:00', min: [12*60, 18*60] },
  { key: 'night',     label: 'NIGHT     18:00–06:00', min: [18*60, 30*60] },
];

// publishingイベントのtype定義
const PUB_TYPES = {
  release:  { label: 'RELEASE',  color: 'var(--ps-amber2)',  bg: 'rgba(200,132,26,0.25)' },
  plot:     { label: 'PLOT',     color: 'var(--ps-green2)',  bg: 'rgba(42,138,74,0.25)'  },
  review:   { label: 'REVIEW',   color: 'var(--ps-purple2)', bg: 'rgba(155,89,182,0.25)' },
  infra:    { label: 'INFRA',    color: 'var(--ps-blue2)',   bg: 'rgba(41,128,185,0.25)' },
  work:     { label: 'WORK',     color: '#e8d44d',           bg: 'rgba(232,212,77,0.20)' },
  personal: { label: 'PERSONAL', color: '#e8856a',           bg: 'rgba(232,133,106,0.20)'},
};

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

/** Date → "YYYY-MM-DD" */
function dateKey(d) {
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

/** "YYYY-MM-DD" → Date */
function parseDate(s) {
  const [y,m,d] = s.split('-').map(Number);
  return new Date(y, m-1, d);
}

/* ══════════════════════════════════════
   時計
══════════════════════════════════════ */
function updateClock() {
  const now = new Date();
  document.getElementById('ps-clock-time').textContent =
    `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  document.getElementById('ps-clock-date').textContent =
    `${now.getFullYear()}/${pad(now.getMonth()+1)}/${pad(now.getDate())} (${DAYS_JP[now.getDay()]})`;
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
let _scheduleData  = null;
let _activeDay     = null;

function setActiveTab(dayKey) {
  document.querySelectorAll('.ps-day-tab').forEach(btn => {
    btn.classList.toggle('ps-active', btn.dataset.day === dayKey);
  });
  _activeDay = dayKey;
}

function makeTaskCard(task, nm) {
  const m   = t2m(task.time);
  const end = _scheduleData
    ? (() => {
        const tasks = _scheduleData.days[_activeDay]?.tasks ?? [];
        const idx   = tasks.indexOf(task);
        return idx + 1 < tasks.length ? t2m(tasks[idx+1].time) : m + 24*60;
      })()
    : m + 60;

  const isCurrent = nm >= m && nm < end;
  const isPast    = nm >= end;

  const card = document.createElement('div');
  card.className = 'ps-task-card';
  if (isCurrent) card.classList.add('ps-current');
  else if (isPast) card.classList.add('ps-past');

  const catClass = {
    writing: 'ps-cat-writing',
    dev:     'ps-cat-dev',
    meeting: 'ps-cat-meeting',
    rest:    'ps-cat-rest',
  }[task.cat] || 'ps-cat-rest';

  card.innerHTML = `
    <span class="ps-task-time">${task.time}</span>
    <span class="ps-task-cat ${catClass}">${task.cat?.toUpperCase() ?? ''}</span>
    <span class="ps-task-label">${task.label}</span>
    <span class="ps-task-dot"></span>
  `;
  return card;
}

function renderDay(dayKey) {
  if (!_scheduleData) return;
  setActiveTab(dayKey);

  const dayData = _scheduleData.days[dayKey];
  const container = document.getElementById('ps-blocks');
  container.innerHTML = '';

  const nm      = nowMin();
  const isToday = dayKey === todayKey();

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

function updateNowBanner(tasks) {
  const nm = nowMin();
  let currentIdx = -1;

  for (let i = 0; i < tasks.length; i++) {
    const start = t2m(tasks[i].time);
    const end   = i+1 < tasks.length ? t2m(tasks[i+1].time) : start + 24*60;
    if (nm >= start && nm < end) { currentIdx = i; break; }
  }

  const taskEl = document.getElementById('ps-now-task');
  const remEl  = document.getElementById('ps-now-remaining');

  if (currentIdx >= 0) {
    taskEl.textContent = tasks[currentIdx].label;
    if (currentIdx+1 < tasks.length) {
      const diff = t2m(tasks[currentIdx+1].time) - nm;
      const h = Math.floor(diff / 60), m = diff % 60;
      const next = tasks[currentIdx+1].label;
      remEl.textContent = h > 0 ? `${h}時間${m}分後に「${next}」` : `${m}分後に「${next}」`;
    } else {
      remEl.textContent = '本日の予定終了';
    }
  } else {
    taskEl.textContent = '予定時間外';
    remEl.textContent  = tasks.length ? `次: ${tasks[0].time} ${tasks[0].label}` : '—';
  }
}

function tickSchedule() {
  if (!_scheduleData || !_activeDay) return;
  if (_activeDay !== todayKey()) return;
  const dayData = _scheduleData.days[_activeDay];
  updateNowBanner(dayData?.tasks ?? []);
  renderDay(_activeDay);
}

/* ══════════════════════════════════════
   年間カレンダー
══════════════════════════════════════ */
const MONTHS_JP = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
let _calYear       = 2026;
let _selectedDate  = null;  // "YYYY-MM-DD"
let _pubMap        = {};    // { "YYYY-MM-DD": [event,...] }

/** publishing配列 → 日付マップ化 */
function buildPubMap(publishing) {
  _pubMap = {};
  (publishing || []).forEach(ev => {
    if (!_pubMap[ev.date]) _pubMap[ev.date] = [];
    _pubMap[ev.date].push(ev);
  });
}

/** 年間カレンダー全体を描画 */
function renderYearCalendar() {
  const grid = document.getElementById('ps-cal-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const todayStr = dateKey(new Date());

  for (let mo = 0; mo < 12; mo++) {
    const monthEl = buildMonthBlock(mo, _calYear, todayStr);
    grid.appendChild(monthEl);
  }

  // 選択日の詳細パネル更新
  renderDateDetail(_selectedDate);
}

/** 1ヶ月ブロックを生成 */
function buildMonthBlock(mo, yr, todayStr) {
  const wrap = document.createElement('div');
  wrap.className = 'ps-cal-month';

  const title = document.createElement('div');
  title.className = 'ps-cal-month-title';
  title.textContent = MONTHS_JP[mo];
  wrap.appendChild(title);

  // 曜日ヘッダー
  const header = document.createElement('div');
  header.className = 'ps-cal-week-header';
  ['日','月','火','水','木','金','土'].forEach((d,i) => {
    const c = document.createElement('span');
    c.textContent = d;
    if (i === 0) c.classList.add('ps-cal-sun');
    if (i === 6) c.classList.add('ps-cal-sat');
    header.appendChild(c);
  });
  wrap.appendChild(header);

  // 日セル
  const cells = document.createElement('div');
  cells.className = 'ps-cal-cells';

  const firstDay = new Date(yr, mo, 1).getDay(); // 0=日
  const lastDate = new Date(yr, mo+1, 0).getDate();

  // 空白パディング
  for (let i = 0; i < firstDay; i++) {
    const blank = document.createElement('span');
    blank.className = 'ps-cal-cell ps-cal-blank';
    cells.appendChild(blank);
  }

  for (let d = 1; d <= lastDate; d++) {
    const dk = `${yr}-${pad(mo+1)}-${pad(d)}`;
    const dow = new Date(yr, mo, d).getDay();
    const evs = _pubMap[dk] || [];

    const cell = document.createElement('span');
    cell.className = 'ps-cal-cell';
    cell.dataset.date = dk;

    if (dow === 0) cell.classList.add('ps-cal-sun');
    if (dow === 6) cell.classList.add('ps-cal-sat');
    if (dk === todayStr) cell.classList.add('ps-cal-today');
    if (dk === _selectedDate) cell.classList.add('ps-cal-selected');

    const num = document.createElement('span');
    num.className = 'ps-cal-num';
    num.textContent = d;
    cell.appendChild(num);

    // イベントドット
    if (evs.length) {
      const dots = document.createElement('span');
      dots.className = 'ps-cal-dots';
      // 最大3ドット
      evs.slice(0, 3).forEach(ev => {
        const dot = document.createElement('span');
        dot.className = 'ps-cal-dot';
        const t = PUB_TYPES[ev.type] || PUB_TYPES.release;
        dot.style.background = t.color;
        dots.appendChild(dot);
      });
      cell.appendChild(dots);
    }

    cell.addEventListener('click', () => onDateClick(dk));
    cells.appendChild(cell);
  }

  wrap.appendChild(cells);
  return wrap;
}

/** 日付クリック処理 */
function onDateClick(dk) {
  _selectedDate = (_selectedDate === dk) ? null : dk;
  // 選択クラスを全セルに再適用（再描画なしで差分更新）
  document.querySelectorAll('.ps-cal-cell[data-date]').forEach(el => {
    el.classList.toggle('ps-cal-selected', el.dataset.date === _selectedDate);
  });
  renderDateDetail(_selectedDate);
}

/** 右側詳細パネルに選択日のイベントを表示 */
function renderDateDetail(dk) {
  const panel = document.getElementById('ps-cal-detail');
  if (!panel) return;

  if (!dk) {
    panel.innerHTML = '<div class="ps-cal-detail-empty">— 日付を選択 —</div>';
    return;
  }

  const evs = _pubMap[dk] || [];
  const d   = parseDate(dk);
  const dow = DAYS_JP[d.getDay()];
  const todayStr = dateKey(new Date());
  const isToday  = (dk === todayStr);

  let html = `<div class="ps-cal-detail-date">${d.getMonth()+1}月${d.getDate()}日（${dow}）${isToday ? '<span class="ps-cal-today-badge">TODAY</span>' : ''}</div>`;

  if (!evs.length) {
    html += '<div class="ps-cal-detail-empty">予定なし</div>';
  } else {
    html += '<div class="ps-cal-detail-list">';
    evs.forEach(ev => {
      const t = PUB_TYPES[ev.type] || PUB_TYPES.release;
      const timelineHtml = (ev.timeline && ev.timeline.length)
        ? `<div class="ps-cal-detail-timeline">${
            ev.timeline.map(tl =>
              `<div class="ps-cal-tl-row">
                <span class="ps-cal-tl-time">${tl.time}</span>
                <span class="ps-cal-tl-label">${tl.label}</span>
              </div>`
            ).join('')
          }</div>`
        : '';
      html += `
        <div class="ps-cal-detail-item" style="border-left-color:${t.color}; background:${t.bg}">
          <span class="ps-cal-detail-type" style="color:${t.color}">${t.label}</span>
          <span class="ps-cal-detail-label">${ev.label}</span>
          ${timelineHtml}
        </div>`;
    });
    html += '</div>';
  }

  panel.innerHTML = html;
}

/* ══════════════════════════════════════
   右カード内部タブ切り替え
══════════════════════════════════════ */
let _rightView = 'weekly'; // 'weekly' | 'calendar'

function switchRightView(view) {
  _rightView = view;

  const weeklyPanel   = document.getElementById('ps-weekly-panel');
  const calendarPanel = document.getElementById('ps-calendar-panel');
  const tabWeekly     = document.getElementById('ps-rtab-weekly');
  const tabCalendar   = document.getElementById('ps-rtab-calendar');

  if (view === 'weekly') {
    weeklyPanel.classList.remove('ps-hidden');
    calendarPanel.classList.add('ps-hidden');
    tabWeekly.classList.add('ps-rtab-active');
    tabCalendar.classList.remove('ps-rtab-active');
  } else {
    weeklyPanel.classList.add('ps-hidden');
    calendarPanel.classList.remove('ps-hidden');
    tabWeekly.classList.remove('ps-rtab-active');
    tabCalendar.classList.add('ps-rtab-active');
    // 初回描画
    renderYearCalendar();
  }
}

/* ══════════════════════════════════════
   ポモドーロ
══════════════════════════════════════ */
const WORK_SEC  = 25 * 60;
const BREAK_SEC =  5 * 60;
const CIRCUMF   = 2 * Math.PI * 42;

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
    `${pad(Math.floor(pomo.remain/60))}:${pad(pomo.remain%60)}`;

  const modeEl = document.getElementById('ps-pomo-mode');
  modeEl.textContent = pomo.isBreak ? 'BREAK' : 'WORK';
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
  pomo.timer   = setInterval(pomoTick, 1000);
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

    if (_scheduleData.weekly_progress != null) {
      renderProgress(_scheduleData.weekly_progress);
    }

    // publishingマップ構築
    buildPubMap(_scheduleData.publishing);

    const today = todayKey();
    document.querySelectorAll('.ps-day-tab').forEach(btn => {
      if (btn.dataset.day === today) btn.classList.add('ps-today');
    });

    renderDay(today);
    setInterval(tickSchedule, 1000);

  } catch (err) {
    console.error('[private-schedule] fetch失敗:', err);
    document.getElementById('ps-now-task').textContent      = 'スケジュール読込エラー';
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

  // 週間タブ
  document.getElementById('ps-day-tabs').addEventListener('click', e => {
    const btn = e.target.closest('.ps-day-tab');
    if (!btn) return;
    renderDay(btn.dataset.day);
  });

  // 右カード内タブ
  document.getElementById('ps-rtab-weekly').addEventListener('click', () => switchRightView('weekly'));
  document.getElementById('ps-rtab-calendar').addEventListener('click', () => switchRightView('calendar'));

  loadSchedule();
});
