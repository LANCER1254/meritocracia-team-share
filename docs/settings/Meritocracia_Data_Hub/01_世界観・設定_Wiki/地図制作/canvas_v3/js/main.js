// canvas_v3/js/main.js
console.error("🔥 [MeritMap] main.js TOP", new Date().toISOString());

import { loadGrid, loadCities, loadWorldLayout } from "./loader.js";
import { render } from "./renderer.js";
import { initLayerTabs, initSidebar } from "./ui.js";
import { state } from "./state.js";

async function init() {
  console.error("🔥 [MeritMap] init START");

  const canvas = document.getElementById("map");
  const info = document.getElementById("info");

  if (!canvas) {
    if (info) info.innerText = "Error: #map canvas not found";
    throw new Error("canvas #map not found");
  }

  try {
    if (info) info.innerText = "Loading grid...";
    await loadGrid(canvas);
    console.error("🔥 loadGrid OK. cells=", state.gridData?.length);

    if (info) info.innerText = "Loading cities...";
    await loadCities();
    console.error("🔥 loadCities OK. cities=", state.cityData?.length);

    if (info) info.innerText = "Loading layout...";
    await loadWorldLayout();
    console.error("🔥 loadWorldLayout OK. anchors=", state.worldLayout?.anchors?.length);

    // ✅ 初回描画（ctx渡さない）
    render(canvas);
    console.error("🔥 render OK");

    // ✅ レイヤータブ初期化
    initLayerTabs(canvas);
    console.error("🔥 initLayerTabs OK");

    // ✅ サイドバー初期化（これが今まで無かった）
    initSidebar(canvas);
    console.error("🔥 initSidebar OK");

    if (info) info.innerText = "✅ Ready";

  } catch (err) {
    console.error("🔥 INIT ERROR:", err);
    if (info) info.innerText = "Error: " + (err?.message ?? String(err));
  }
}

init();
