const arcColors = {
  prologue: "#c9a84c",
  terror:   "#c0392b",
  glory:    "#2980b9",
  officer:  "#6c3483",
  demo:     "#2ecc71"
};

function render(data, filter) {
  const wrap = document.getElementById('timeline');
  wrap.innerHTML = '';

  data.forEach(era => {
    const filtered = era.events.filter(e => filter === 'all' || e.tag === filter);
    if (filtered.length === 0) return;

    const eraDiv = document.createElement('div');
    eraDiv.className = 'era';

    const label = document.createElement('div');
    label.className = 'era-label';
    label.innerHTML = `
      <span class="era-year">${era.year}</span>
      <span class="era-dot" style="border-color:${arcColors[era.arc] || '#c9a84c'}"></span>
      <span class="era-title">${era.title}</span>
    `;

    const events = document.createElement('div');
    events.className = 'events open';

    filtered.forEach(ev => {
      const card = document.createElement('div');
      card.className = `event-card ${ev.color || ''}`;
      if (ev.color === 'red')  card.style.borderLeftColor = '#c0392b';
      if (ev.color === 'blue') card.style.borderLeftColor = '#2980b9';
      if (ev.color === 'dark') card.style.borderLeftColor = '#6c3483';

      const titleHtml = ev.link
        ? `<a class="event-title event-link" href="${ev.link}">${ev.title}</a>`
        : `<div class="event-title">${ev.title}</div>`;

      card.innerHTML = `
        <span class="event-tag tag-${ev.tag}">${ev.tagLabel}</span>
        ${titleHtml}
        <div class="event-desc">${ev.desc}</div>
        ${ev.chars.length ? `<div class="event-chars">${ev.chars.map(c => `<span class="char-badge">${c}</span>`).join('')}</div>` : ''}
      `;
      events.appendChild(card);
    });

    label.addEventListener('click', () => {
      events.classList.toggle('open');
    });

    eraDiv.appendChild(label);
    eraDiv.appendChild(events);
    wrap.appendChild(eraDiv);
  });
}

async function init() {
  const res = await fetch('./story-data.json');
  const data = await res.json();

  render(data, 'all');

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      render(data, btn.dataset.filter);
    });
  });
}

init();
