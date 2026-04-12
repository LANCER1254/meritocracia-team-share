'use strict';

/* ============================================================
   CONSTANTS & CONFIG
   ============================================================ */

/** District visual config — shape polygons & colors */
const DISTRICT_CONFIG = {
  church_quarter: {
    color: 'rgba(120,80,160,0.18)',
    stroke: 'rgba(120,80,160,0.35)',
    poly: [
      [100, 100], [320, 100], [330, 140], [320, 300],
      [280, 310], [100, 290], [90, 200]
    ],
    labelOffset: { dx: 0, dy: -15 }
  },
  market_core: {
    color: 'rgba(200,120,60,0.18)',
    stroke: 'rgba(200,120,60,0.35)',
    poly: [
      [370, 380], [620, 370], [640, 420], [630, 580],
      [580, 600], [370, 590], [350, 520]
    ],
    labelOffset: { dx: 0, dy: -15 }
  },
  south_market_edge: {
    color: 'rgba(80,140,100,0.15)',
    stroke: 'rgba(80,140,100,0.30)',
    poly: [
      [370, 620], [620, 620], [640, 670], [630, 830],
      [560, 850], [370, 840], [350, 750]
    ],
    labelOffset: { dx: 0, dy: -10 }
  },
  alley_belt: {
    color: 'rgba(100,100,140,0.16)',
    stroke: 'rgba(100,100,140,0.32)',
    poly: [
      [660, 380], [870, 400], [880, 450], [870, 600],
      [820, 620], [660, 610], [650, 520]
    ],
    labelOffset: { dx: 0, dy: -10 }
  },
  fo_entry_axis: {
    color: 'rgba(60,120,200,0.16)',
    stroke: 'rgba(60,120,200,0.32)',
    poly: [
      [60, 720], [280, 710], [300, 760], [290, 920],
      [240, 940], [60, 930], [50, 840]
    ],
    labelOffset: { dx: 0, dy: -10 }
  },
  civic_square: {
    color: 'rgba(180,140,80,0.14)',
    stroke: 'rgba(180,140,80,0.30)',
    poly: [
      [700, 720], [940, 710], [960, 770], [950, 920],
      [900, 940], [700, 930], [690, 840]
    ],
    labelOffset: { dx: 0, dy: -10 }
  }
};

/** Route color map */
const ROUTE_COLORS = {
  rt_kernel_move:       '#e05050',
  rt_luca_move:         '#b080f0',
  rt_flamewing_invasion:'#ff6a33',
  rt_crowd_evacuation:  '#60d0a0',
  rt_jade_rescue:       '#60a8e0',
  rt_fo_suppression:    '#4a7fc1'
};

/** Pin color by time order — severity progression */
const PIN_COLORS = {
  1: '#60a8e0',   // 市場通常営業
  2: '#ff6a33',   // 炎翼セル配置
  3: '#e05050',   // 最初の爆発
  4: '#e05050',   // 召喚獣出現
  5: '#ff3030',   // 炎槍
  6: '#8b1a1a',   // カーネル死亡
  7: '#4a7fc1',   // FO到着
  8: '#60d0a0',   // 戦闘終了
  9: '#b080f0',   // 公開尋問
  10: '#c9a961'   // ジェイドの誓い
};

/* ============================================================
   STATE
   ============================================================ */
let mapData = null;
let currentPinIndex = 0;       // 0-based: which pins are "active" (0 = show all up to pin 1)
let isPlaying = false;
let playInterval = null;
let selectedItem = null;       // {type, id, data}
let routeVisibility = {};      // route_id -> boolean

// SVG pan/zoom
let viewBox = { x: 0, y: 0, w: 1000, h: 1000 };
let isDragging = false;
let dragStart = { x: 0, y: 0 };
let dragViewStart = { x: 0, y: 0 };

/* ============================================================
   DOM HELPERS
   ============================================================ */
const svgNS = 'http://www.w3.org/2000/svg';

function svgEl(tag, attrs) {
  const e = document.createElementNS(svgNS, tag);
  if (attrs) for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
}

function htmlEl(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

/* ============================================================
   FETCH DATA
   ============================================================ */
async function loadMapData() {
  const res = await fetch('./map-data.json');
  if (!res.ok) throw new Error('map-data.json の読み込みに失敗しました');
  return res.json();
}

/* ============================================================
   RENDER: DISTRICTS
   ============================================================ */
function renderDistricts(svg) {
  const g = svgEl('g', { id: 'layer-districts' });

  for (const dist of mapData.districts) {
    const cfg = DISTRICT_CONFIG[dist.district_id];
    if (!cfg) continue;

    const dg = svgEl('g', { class: 'district-group', 'data-district': dist.district_id });

    // Polygon shape
    const points = cfg.poly.map(p => p.join(',')).join(' ');
    const shape = svgEl('polygon', {
      class: 'district-shape',
      points,
      fill: cfg.color,
      stroke: cfg.stroke,
      'stroke-width': '1.5'
    });
    shape.addEventListener('click', () => selectItem('district', dist.district_id, dist));
    dg.appendChild(shape);

    // Center label
    const cx = cfg.poly.reduce((s, p) => s + p[0], 0) / cfg.poly.length + (cfg.labelOffset?.dx || 0);
    const cy = cfg.poly.reduce((s, p) => s + p[1], 0) / cfg.poly.length + (cfg.labelOffset?.dy || 0);

    const label = svgEl('text', {
      class: 'district-label',
      x: cx,
      y: cy
    });
    label.textContent = dist.name;
    dg.appendChild(label);

    const subLabel = svgEl('text', {
      class: 'district-label-sub',
      x: cx,
      y: cy + 18
    });
    subLabel.textContent = dist.district_id.toUpperCase().replace(/_/g, ' ');
    dg.appendChild(subLabel);

    g.appendChild(dg);
  }

  svg.appendChild(g);
}

/* ============================================================
   RENDER: ROUTES (Tube-line style)
   ============================================================ */
function renderRoutes(svg) {
  const g = svgEl('g', { id: 'layer-routes' });

  for (const route of mapData.routes) {
    const color = ROUTE_COLORS[route.route_id] || '#888';
    const pointsStr = route.points.map(p => `${p.x},${p.y}`).join(' ');

    // Glow line (behind)
    const glow = svgEl('polyline', {
      class: 'route-line-glow',
      id: `glow-${route.route_id}`,
      points: pointsStr,
      stroke: color
    });
    g.appendChild(glow);

    // Main line
    const line = svgEl('polyline', {
      class: 'route-line animated',
      id: `route-${route.route_id}`,
      points: pointsStr,
      stroke: color,
      opacity: '0.7'
    });
    g.appendChild(line);

    // Station dots at each point
    for (let i = 0; i < route.points.length; i++) {
      const p = route.points[i];
      const station = svgEl('circle', {
        class: 'route-station',
        cx: p.x,
        cy: p.y,
        r: 4,
        fill: '#0a1020',
        stroke: color,
        'stroke-width': 2
      });
      station.addEventListener('click', () => selectItem('route', route.route_id, route));
      g.appendChild(station);
    }

    // Initialize visibility
    routeVisibility[route.route_id] = true;
  }

  svg.appendChild(g);
}

/* ============================================================
   RENDER: LOCATIONS (POI Pins)
   ============================================================ */
function renderLocations(svg) {
  const g = svgEl('g', { id: 'layer-locations' });

  for (const loc of mapData.locations) {
    const lg = svgEl('g', {
      class: 'location-pin-group',
      'data-location': loc.location_id,
      transform: `translate(${loc.x}, ${loc.y})`
    });

    // Pin drop shadow
    const shadow = svgEl('ellipse', {
      cx: 0, cy: 6,
      rx: 5, ry: 2,
      fill: 'rgba(0,0,0,0.4)'
    });
    lg.appendChild(shadow);

    // Pin body (teardrop)
    const pin = svgEl('path', {
      class: 'location-pin-outer',
      d: 'M0,-14 C-7,-14 -10,-8 -10,-4 C-10,3 0,10 0,10 C0,10 10,3 10,-4 C10,-8 7,-14 0,-14 Z',
      fill: 'rgba(201,169,97,0.8)',
      stroke: 'rgba(201,169,97,0.6)',
      'stroke-width': '1'
    });
    lg.appendChild(pin);

    // Inner circle
    const inner = svgEl('circle', {
      class: 'location-pin-inner',
      cx: 0, cy: -4,
      r: 4,
      fill: '#0d1525'
    });
    lg.appendChild(inner);

    // Label below
    const label = svgEl('text', {
      class: 'location-label',
      x: 0, y: 20
    });
    label.textContent = loc.name;
    lg.appendChild(label);

    lg.addEventListener('click', () => selectItem('location', loc.location_id, loc));
    g.appendChild(lg);
  }

  svg.appendChild(g);
}

/* ============================================================
   RENDER: PINS (Event markers, time-ordered)
   ============================================================ */
function renderPins(svg) {
  const g = svgEl('g', { id: 'layer-pins' });

  const sorted = [...mapData.pins].sort((a, b) => a.time_order - b.time_order);

  for (const pin of sorted) {
    const color = PIN_COLORS[pin.time_order] || '#888';

    const pg = svgEl('g', {
      class: 'pin-group pin-active',
      id: `pin-${pin.pin_id}`,
      'data-pin': pin.pin_id,
      'data-order': pin.time_order
    });

    // Pulse ring
    const pulse = svgEl('circle', {
      class: 'pin-pulse',
      cx: pin.x, cy: pin.y,
      r: 12,
      fill: 'none',
      stroke: color,
      'stroke-width': 2
    });
    pg.appendChild(pulse);

    // Main circle
    const marker = svgEl('circle', {
      class: 'pin-marker',
      cx: pin.x, cy: pin.y,
      r: 10,
      fill: color,
      stroke: '#0a1020',
      'stroke-width': 2
    });
    pg.appendChild(marker);

    // Number
    const num = svgEl('text', {
      class: 'pin-number',
      x: pin.x, y: pin.y
    });
    num.textContent = pin.time_order;
    pg.appendChild(num);

    // Label
    const label = svgEl('text', {
      class: 'pin-label',
      x: pin.x, y: pin.y + 20
    });
    label.textContent = pin.name;
    pg.appendChild(label);

    pg.addEventListener('click', () => {
      currentPinIndex = pin.time_order;
      updateSlider();
      updatePinVisibility();
      selectItem('pin', pin.pin_id, pin);
    });

    g.appendChild(pg);
  }

  svg.appendChild(g);
}

/* ============================================================
   RENDER: STREET GRID
   ============================================================ */
function renderStreetGrid(svg) {
  const g = svgEl('g', { id: 'layer-streets', opacity: '0.06' });

  // Horizontal streets
  const hPositions = [130, 350, 500, 650, 820];
  for (const y of hPositions) {
    const line = svgEl('line', {
      x1: 40, y1: y, x2: 960, y2: y,
      stroke: '#c9a961',
      'stroke-width': '0.8',
      'stroke-dasharray': '6 8'
    });
    g.appendChild(line);
  }

  // Vertical streets
  const vPositions = [170, 350, 500, 650, 830];
  for (const x of vPositions) {
    const line = svgEl('line', {
      x1: x, y1: 60, x2: x, y2: 960,
      stroke: '#c9a961',
      'stroke-width': '0.8',
      'stroke-dasharray': '6 8'
    });
    g.appendChild(line);
  }

  svg.appendChild(g);
}

/* ============================================================
   PIN VISIBILITY (timeline)
   ============================================================ */
function updatePinVisibility() {
  if (!mapData) return;
  const pins = document.querySelectorAll('.pin-group');
  pins.forEach(pg => {
    const order = parseInt(pg.getAttribute('data-order'));
    if (currentPinIndex === 0) {
      // Show all
      pg.classList.remove('pin-inactive');
      pg.classList.add('pin-active');
    } else {
      if (order <= currentPinIndex) {
        pg.classList.remove('pin-inactive');
        pg.classList.add('pin-active');
      } else {
        pg.classList.remove('pin-active');
        pg.classList.add('pin-inactive');
      }
    }
  });
}

/* ============================================================
   ROUTE VISIBILITY
   ============================================================ */
function updateRouteVisibility(routeId, visible) {
  routeVisibility[routeId] = visible;
  const line = document.getElementById(`route-${routeId}`);
  const glow = document.getElementById(`glow-${routeId}`);
  if (line) line.classList.toggle('hidden-route', !visible);
  if (glow) glow.classList.toggle('hidden-route', !visible);
}

/* ============================================================
   SIDEBAR: ROUTE TOGGLES
   ============================================================ */
function renderRouteToggles() {
  const container = document.getElementById('route-toggles');
  if (!container || !mapData) return;

  for (const route of mapData.routes) {
    const color = ROUTE_COLORS[route.route_id] || '#888';

    const toggle = htmlEl('label', 'route-toggle');

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = true;
    cb.addEventListener('change', () => updateRouteVisibility(route.route_id, cb.checked));
    toggle.appendChild(cb);

    const colorLine = htmlEl('span', 'route-color-line');
    colorLine.style.background = color;
    toggle.appendChild(colorLine);

    const label = htmlEl('span', 'route-toggle-label', route.name);
    toggle.appendChild(label);

    container.appendChild(toggle);
  }
}

/* ============================================================
   SIDEBAR: DETAIL PANEL
   ============================================================ */
function selectItem(type, id, data) {
  selectedItem = { type, id, data };
  renderDetail();
  highlightOnMap(type, id);
}

function renderDetail() {
  const panel = document.getElementById('detail-panel');
  if (!panel || !selectedItem) return;

  const { type, id, data } = selectedItem;
  panel.innerHTML = '';

  const card = htmlEl('div', 'detail-card');

  // Type badge
  const typeBadge = htmlEl('div', 'detail-type-badge');
  const typeLabels = { district: 'DISTRICT', location: 'LOCATION', route: 'ROUTE', pin: 'EVENT PIN' };
  typeBadge.textContent = typeLabels[type] || type.toUpperCase();
  card.appendChild(typeBadge);

  // Name
  const name = htmlEl('div', 'detail-name', data.name);
  card.appendChild(name);

  // ID
  const idEl = htmlEl('div', 'detail-id', id);
  card.appendChild(idEl);

  card.appendChild(htmlEl('div', 'detail-divider'));

  if (type === 'district') {
    // Show locations in this district
    const locsInDist = mapData.locations.filter(l => l.district_id === id);
    if (locsInDist.length) {
      const field = htmlEl('div', 'detail-field');
      field.appendChild(htmlEl('div', 'detail-field-label', 'このエリアのスポット'));
      const val = htmlEl('div', 'detail-field-value');
      val.textContent = locsInDist.map(l => l.name).join('、');
      field.appendChild(val);
      card.appendChild(field);
    }

    // Coordinates
    const coordField = htmlEl('div', 'detail-field');
    coordField.appendChild(htmlEl('div', 'detail-field-label', '座標'));
    coordField.appendChild(htmlEl('div', 'detail-field-value', `x: ${data.x}  y: ${data.y}`));
    card.appendChild(coordField);

  } else if (type === 'location') {
    // District
    const distField = htmlEl('div', 'detail-field');
    distField.appendChild(htmlEl('div', 'detail-field-label', '所属エリア'));
    const distData = mapData.districts.find(d => d.district_id === data.district_id);
    distField.appendChild(htmlEl('div', 'detail-field-value', distData ? distData.name : data.district_id));
    card.appendChild(distField);

    // Coordinates
    const coordField = htmlEl('div', 'detail-field');
    coordField.appendChild(htmlEl('div', 'detail-field-label', '座標'));
    coordField.appendChild(htmlEl('div', 'detail-field-value', `x: ${data.x}  y: ${data.y}`));
    card.appendChild(coordField);

    // Related routes
    const relRoutes = mapData.routes.filter(r =>
      r.points.some(p => Math.abs(p.x - data.x) < 30 && Math.abs(p.y - data.y) < 30)
    );
    if (relRoutes.length) {
      const field = htmlEl('div', 'detail-field');
      field.appendChild(htmlEl('div', 'detail-field-label', '関連ルート'));
      const list = htmlEl('div', 'detail-routes-list');
      for (const r of relRoutes) {
        const chip = htmlEl('div', 'detail-route-chip');
        const dot = htmlEl('span', 'detail-route-dot');
        dot.style.background = ROUTE_COLORS[r.route_id] || '#888';
        chip.appendChild(dot);
        chip.appendChild(htmlEl('span', null, r.name));
        list.appendChild(chip);
      }
      field.appendChild(list);
      card.appendChild(field);
    }

    // Related pins
    const relPins = mapData.pins.filter(p => p.location_id === data.location_id);
    if (relPins.length) {
      const field = htmlEl('div', 'detail-field');
      field.appendChild(htmlEl('div', 'detail-field-label', 'このスポットの事件'));
      const val = htmlEl('div', 'detail-field-value');
      val.textContent = relPins.map(p => `[${p.time_order}] ${p.name}`).join('\n');
      val.style.whiteSpace = 'pre-line';
      field.appendChild(val);
      card.appendChild(field);
    }

  } else if (type === 'route') {
    // Color line
    const colorField = htmlEl('div', 'detail-field');
    colorField.appendChild(htmlEl('div', 'detail-field-label', 'ルートカラー'));
    const colorLine = htmlEl('div', 'route-color-line');
    colorLine.style.background = ROUTE_COLORS[data.route_id] || '#888';
    colorLine.style.width = '60px';
    colorLine.style.height = '4px';
    colorLine.style.borderRadius = '2px';
    colorField.appendChild(colorLine);
    card.appendChild(colorField);

    // Waypoints
    const wpField = htmlEl('div', 'detail-field');
    wpField.appendChild(htmlEl('div', 'detail-field-label', '経由地点'));
    const wpVal = htmlEl('div', 'detail-field-value');
    wpVal.textContent = data.points.map((p, i) => `${i + 1}. (${p.x}, ${p.y})`).join('\n');
    wpVal.style.whiteSpace = 'pre-line';
    wpVal.style.fontFamily = "'JetBrains Mono', monospace";
    wpVal.style.fontSize = '11px';
    wpField.appendChild(wpVal);
    card.appendChild(wpField);

  } else if (type === 'pin') {
    // Time order
    const timeEl = htmlEl('div', 'detail-pin-time', `# ${data.time_order}`);
    card.appendChild(timeEl);

    // Location
    const locData = mapData.locations.find(l => l.location_id === data.location_id);
    if (locData) {
      const locField = htmlEl('div', 'detail-field');
      locField.appendChild(htmlEl('div', 'detail-field-label', '発生場所'));
      locField.appendChild(htmlEl('div', 'detail-field-value', locData.name));
      card.appendChild(locField);
    }

    // Coordinates
    const coordField = htmlEl('div', 'detail-field');
    coordField.appendChild(htmlEl('div', 'detail-field-label', '座標'));
    coordField.appendChild(htmlEl('div', 'detail-field-value', `x: ${data.x}  y: ${data.y}`));
    card.appendChild(coordField);

    // Related routes nearby
    const relRoutes = mapData.routes.filter(r =>
      r.points.some(p => Math.abs(p.x - data.x) < 40 && Math.abs(p.y - data.y) < 40)
    );
    if (relRoutes.length) {
      const field = htmlEl('div', 'detail-field');
      field.appendChild(htmlEl('div', 'detail-field-label', '関連ルート'));
      const list = htmlEl('div', 'detail-routes-list');
      for (const r of relRoutes) {
        const chip = htmlEl('div', 'detail-route-chip');
        const dot = htmlEl('span', 'detail-route-dot');
        dot.style.background = ROUTE_COLORS[r.route_id] || '#888';
        chip.appendChild(dot);
        chip.appendChild(htmlEl('span', null, r.name));
        list.appendChild(chip);
      }
      field.appendChild(list);
      card.appendChild(field);
    }
  }

  panel.appendChild(card);
}

/* ============================================================
   HIGHLIGHT ON MAP
   ============================================================ */
function highlightOnMap(type, id) {
  // Remove previous highlights
  document.querySelectorAll('.selected-highlight').forEach(e => e.remove());

  let cx, cy;

  if (type === 'district') {
    const cfg = DISTRICT_CONFIG[id];
    if (cfg) {
      cx = cfg.poly.reduce((s, p) => s + p[0], 0) / cfg.poly.length;
      cy = cfg.poly.reduce((s, p) => s + p[1], 0) / cfg.poly.length;
    }
  } else if (type === 'location') {
    const loc = mapData.locations.find(l => l.location_id === id);
    if (loc) { cx = loc.x; cy = loc.y; }
  } else if (type === 'pin') {
    const pin = mapData.pins.find(p => p.pin_id === id);
    if (pin) { cx = pin.x; cy = pin.y; }
  } else if (type === 'route') {
    const route = mapData.routes.find(r => r.route_id === id);
    if (route && route.points.length) {
      const mid = route.points[Math.floor(route.points.length / 2)];
      cx = mid.x; cy = mid.y;
    }
  }

  if (cx != null && cy != null) {
    const svg = document.getElementById('map-svg');
    const ring = svgEl('circle', {
      class: 'selected-highlight',
      cx, cy,
      r: 18,
      fill: 'none',
      stroke: '#c9a961',
      'stroke-width': 2
    });
    svg.appendChild(ring);
  }
}

/* ============================================================
   TIMELINE CONTROLS
   ============================================================ */
function setupTimeline() {
  const slider = document.getElementById('tl-slider');
  const labelEl = document.getElementById('tl-label');
  const nameEl = document.getElementById('tl-event-name');
  const btnPlay = document.getElementById('btn-play');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');

  if (!slider || !mapData) return;

  const maxOrder = mapData.pins.length;
  slider.min = 0;
  slider.max = maxOrder;
  slider.value = 0;

  function updateSliderUI() {
    slider.value = currentPinIndex;
    if (currentPinIndex === 0) {
      labelEl.textContent = 'ALL';
      nameEl.textContent = '全イベント表示';
    } else {
      const pin = mapData.pins.find(p => p.time_order === currentPinIndex);
      labelEl.textContent = `${currentPinIndex} / ${maxOrder}`;
      nameEl.textContent = pin ? pin.name : '';
    }
    updatePinVisibility();
  }

  // Expose for external use
  window.updateSlider = updateSliderUI;

  slider.addEventListener('input', () => {
    currentPinIndex = parseInt(slider.value);
    updateSliderUI();
  });

  btnPlay.addEventListener('click', () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  });

  btnPrev.addEventListener('click', () => {
    stopPlayback();
    currentPinIndex = Math.max(0, currentPinIndex - 1);
    updateSliderUI();
  });

  btnNext.addEventListener('click', () => {
    stopPlayback();
    currentPinIndex = Math.min(maxOrder, currentPinIndex + 1);
    updateSliderUI();
  });

  function startPlayback() {
    isPlaying = true;
    btnPlay.textContent = '⏸';
    btnPlay.classList.add('active');
    if (currentPinIndex >= maxOrder) currentPinIndex = 0;

    playInterval = setInterval(() => {
      currentPinIndex++;
      if (currentPinIndex > maxOrder) {
        stopPlayback();
        currentPinIndex = maxOrder;
      }
      updateSliderUI();

      // Auto-select pin
      if (currentPinIndex > 0) {
        const pin = mapData.pins.find(p => p.time_order === currentPinIndex);
        if (pin) selectItem('pin', pin.pin_id, pin);
      }
    }, 2000);
  }

  function stopPlayback() {
    isPlaying = false;
    btnPlay.textContent = '▶';
    btnPlay.classList.remove('active');
    if (playInterval) {
      clearInterval(playInterval);
      playInterval = null;
    }
  }

  updateSliderUI();
}

/* ============================================================
   PAN & ZOOM
   ============================================================ */
function setupPanZoom() {
  const viewport = document.getElementById('map-viewport');
  const svg = document.getElementById('map-svg');
  if (!viewport || !svg) return;

  function applyViewBox() {
    svg.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`);
  }

  // Mouse drag
  viewport.addEventListener('mousedown', (e) => {
    if (e.target.closest('.pin-group, .location-pin-group, .route-station, .district-shape')) return;
    isDragging = true;
    dragStart = { x: e.clientX, y: e.clientY };
    dragViewStart = { x: viewBox.x, y: viewBox.y };
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = (e.clientX - dragStart.x) * (viewBox.w / viewport.clientWidth);
    const dy = (e.clientY - dragStart.y) * (viewBox.h / viewport.clientHeight);
    viewBox.x = dragViewStart.x - dx;
    viewBox.y = dragViewStart.y - dy;
    applyViewBox();
    updateCoords(e);
  });

  window.addEventListener('mouseup', () => { isDragging = false; });

  // Touch drag
  viewport.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    isDragging = true;
    dragStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    dragViewStart = { x: viewBox.x, y: viewBox.y };
  }, { passive: true });

  viewport.addEventListener('touchmove', (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = (e.touches[0].clientX - dragStart.x) * (viewBox.w / viewport.clientWidth);
    const dy = (e.touches[0].clientY - dragStart.y) * (viewBox.h / viewport.clientHeight);
    viewBox.x = dragViewStart.x - dx;
    viewBox.y = dragViewStart.y - dy;
    applyViewBox();
  }, { passive: true });

  viewport.addEventListener('touchend', () => { isDragging = false; });

  // Scroll zoom
  viewport.addEventListener('wheel', (e) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.1 : 0.9;
    const rect = viewport.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / rect.width;
    const my = (e.clientY - rect.top) / rect.height;

    const newW = Math.max(200, Math.min(2000, viewBox.w * factor));
    const newH = Math.max(200, Math.min(2000, viewBox.h * factor));

    viewBox.x += (viewBox.w - newW) * mx;
    viewBox.y += (viewBox.h - newH) * my;
    viewBox.w = newW;
    viewBox.h = newH;

    applyViewBox();
  }, { passive: false });

  // Zoom buttons
  document.getElementById('btn-zoom-in')?.addEventListener('click', () => {
    const factor = 0.8;
    const newW = Math.max(200, viewBox.w * factor);
    const newH = Math.max(200, viewBox.h * factor);
    viewBox.x += (viewBox.w - newW) / 2;
    viewBox.y += (viewBox.h - newH) / 2;
    viewBox.w = newW;
    viewBox.h = newH;
    applyViewBox();
  });

  document.getElementById('btn-zoom-out')?.addEventListener('click', () => {
    const factor = 1.25;
    const newW = Math.min(2000, viewBox.w * factor);
    const newH = Math.min(2000, viewBox.h * factor);
    viewBox.x += (viewBox.w - newW) / 2;
    viewBox.y += (viewBox.h - newH) / 2;
    viewBox.w = newW;
    viewBox.h = newH;
    applyViewBox();
  });

  document.getElementById('btn-zoom-reset')?.addEventListener('click', () => {
    viewBox = { x: 0, y: 0, w: 1000, h: 1000 };
    applyViewBox();
  });

  // Coordinate display
  viewport.addEventListener('mousemove', (e) => updateCoords(e));

  function updateCoords(e) {
    const coordEl = document.getElementById('map-coords');
    if (!coordEl) return;
    const rect = viewport.getBoundingClientRect();
    const mx = viewBox.x + ((e.clientX - rect.left) / rect.width) * viewBox.w;
    const my = viewBox.y + ((e.clientY - rect.top) / rect.height) * viewBox.h;
    coordEl.textContent = `${Math.round(mx)}, ${Math.round(my)}`;
  }

  applyViewBox();
}

/* ============================================================
   MOBILE SIDEBAR
   ============================================================ */
function setupMobileSidebar() {
  const toggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');

  if (!toggle || !sidebar) return;

  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    backdrop.classList.toggle('visible');
  });

  backdrop?.addEventListener('click', () => {
    sidebar.classList.remove('open');
    backdrop.classList.remove('visible');
  });
}

/* ============================================================
   KEYBOARD SHORTCUTS
   ============================================================ */
function setupKeyboard() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'l') {
      document.getElementById('btn-next')?.click();
    } else if (e.key === 'ArrowLeft' || e.key === 'h') {
      document.getElementById('btn-prev')?.click();
    } else if (e.key === ' ') {
      e.preventDefault();
      document.getElementById('btn-play')?.click();
    } else if (e.key === '+' || e.key === '=') {
      document.getElementById('btn-zoom-in')?.click();
    } else if (e.key === '-') {
      document.getElementById('btn-zoom-out')?.click();
    } else if (e.key === '0') {
      document.getElementById('btn-zoom-reset')?.click();
    }
  });
}

/* ============================================================
   INIT
   ============================================================ */
(async () => {
  try {
    mapData = await loadMapData();

    const svg = document.getElementById('map-svg');
    if (!svg) throw new Error('SVG element not found');

    // Render layers in order (bottom to top)
    renderStreetGrid(svg);
    renderDistricts(svg);
    renderRoutes(svg);
    renderLocations(svg);
    renderPins(svg);

    // Setup interactions
    renderRouteToggles();
    setupTimeline();
    setupPanZoom();
    setupMobileSidebar();
    setupKeyboard();

  } catch (err) {
    console.error('[map.js]', err);
    const detail = document.getElementById('detail-panel');
    if (detail) {
      detail.innerHTML = `<div style="color:#e05050;padding:20px;font-size:13px;border:1px solid rgba(139,26,26,0.3);background:rgba(139,26,26,0.08);">${err.message}</div>`;
    }
  }
})();
