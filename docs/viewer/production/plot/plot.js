async function loadPlotIndex() {
  const root = document.getElementById("plot-list");

  try {
    const response = await fetch("./plot-data.json");
    const items = await response.json();

    renderPlotCards(items);
  } catch (error) {
    root.innerHTML = `
      <article class="card">
        <h2>読み込み失敗</h2>
        <p>${error.message}</p>
      </article>
    `;
  }
}

function renderPlotCards(items) {
  const root = document.getElementById("plot-list");

  root.innerHTML = items.map(item => `
    <article class="card" data-id="${item.id}">
      <h2>${item.title}</h2>
      <small>${item.phase}</small>
      <p>${item.desc}</p>

      <div class="links">
        <a class="btn sub" href="${item.file}" target="_blank">
          📘 プロット閲覧
        </a>

        <a class="btn" href="${item.dbLink}">
          🔥 事件全体表
        </a>
      </div>
    </article>
  `).join("");
}

document.addEventListener("DOMContentLoaded", loadPlotIndex);