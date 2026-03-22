import { state } from "./state.js";
import { ENtoPixel } from "./utils.js";

export function render(canvas, ctx) {
  if (!canvas || !ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  /* ========================= */
  /* 地形                     */
  /* ========================= */

  if (state.activeLayers.grid && state.gridData.length > 0) {
    ctx.fillStyle = "#5aa0e6";

    for (const cell of state.gridData) {
      const pos = ENtoPixel(cell.e, cell.n, canvas);

      ctx.fillRect(
        Math.floor(pos.x),
        Math.floor(pos.y),
        Math.ceil(state.CELL_SIZE),
        Math.ceil(state.CELL_SIZE)
      );
    }
  }

  /* ========================= */
  /* 都市                     */
  /* ========================= */

  if (state.activeLayers.real_cities) {

    if (state.selectedCity) {
      const city = state.cityData.find(c => c.id === state.selectedCity);
      if (city) drawCity(city, canvas, ctx);
    } else {
      for (const city of state.cityData) {
        drawCity(city, canvas, ctx);
      }
    }
  }

  /* ========================= */
  /* 物語拠点                 */
  /* ========================= */

  if (state.activeLayers.anchors && state.worldLayout?.anchors) {

    const anchors = state.worldLayout.anchors;

    if (state.selectedAnchor) {
      const anchor = anchors.find(a => a.id === state.selectedAnchor);
      if (anchor) drawAnchor(anchor, canvas, ctx);
    } else {
      for (const anchor of anchors) {
        drawAnchor(anchor, canvas, ctx);
      }
    }
  }

  /* ========================= */
  /* 軍事（今は未実装枠）     */
  /* ========================= */

  if (state.activeLayers.military) {
    // 今後ここに軍事描画を書く
  }
}


/* ========================= */
/* 都市描画                  */
/* ========================= */

function drawCity(city, canvas, ctx) {
  const pos = ENtoPixel(city.e, city.n, canvas);

  ctx.beginPath();
  ctx.arc(pos.x, pos.y, 6, 0, Math.PI * 2);
  ctx.fillStyle = "#00c8ff";
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 14px sans-serif";
  ctx.fillText(city.name_jp || city.name_en, pos.x + 8, pos.y - 8);
}


/* ========================= */
/* 拠点描画                  */
/* ========================= */

function drawAnchor(anchor, canvas, ctx) {
  const pos = ENtoPixel(anchor.e, anchor.n, canvas);

  ctx.beginPath();
  ctx.arc(pos.x, pos.y, 7, 0, Math.PI * 2);
  ctx.fillStyle = "#ff4dd2";
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 14px sans-serif";
  ctx.fillText(anchor.label, pos.x + 8, pos.y - 8);
}
