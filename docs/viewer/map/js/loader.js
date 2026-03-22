import { state } from "./state.js";

// 🔥 GitHub Pages対応パス（ローカルでも動く）
const BASE = location.hostname.includes("github.io")
  ? "/meritocracia-team-share/viewer"
  : "";

export async function loadGrid(canvas) {
    const res = await fetch(`${BASE}/data/grids/london_grid.csv`);
    const text = await res.text();
    const rows = text.trim().split("\n");

    state.gridData = [];
    state.minE = Infinity;
    state.minN = Infinity;
    state.maxE = -Infinity;
    state.maxN = -Infinity;

    for (let i = 1; i < rows.length; i++) {
        const cols = rows[i].split(",");

        const e = parseFloat(cols[0]);
        const n = parseFloat(cols[1]);
        const m = parseInt(cols[4]);

        if (isNaN(e) || isNaN(n)) continue;

        state.minE = Math.min(state.minE, e);
        state.minN = Math.min(state.minN, n);
        state.maxE = Math.max(state.maxE, e);
        state.maxN = Math.max(state.maxN, n);

        state.gridData.push({ e, n, m });
    }

    // 🔥 データ読み込めてない場合の防御
    if (state.gridData.length === 0) {
        console.error("❌ Grid data is empty");
        return;
    }

    const rangeE = state.maxE - state.minE;
    const rangeN = state.maxN - state.minN;

    const screenWidth = window.innerWidth * 0.95;
    const screenHeight = window.innerHeight * 0.85;

    const scaleByWidth = screenWidth / (rangeE / 1000);
    const scaleByHeight = screenHeight / (rangeN / 1000);

    state.CELL_SIZE = Math.min(scaleByWidth, scaleByHeight);

    canvas.width = (rangeE / 1000) * state.CELL_SIZE;
    canvas.height = (rangeN / 1000) * state.CELL_SIZE;

    console.error(`🔥 Canvas size: ${canvas.width.toFixed(0)} x ${canvas.height.toFixed(0)}`);
    console.error(`🔥 CELL_SIZE: ${state.CELL_SIZE.toFixed(2)}px`);
    console.error(`🔥 Grid range: E[${state.minE}, ${state.maxE}] N[${state.minN}, ${state.maxN}]`);
}

export async function loadCities() {
    const res = await fetch(`${BASE}/data/reference/real_cities.csv`);
    const text = await res.text();
    const rows = text.trim().split("\n");

    state.cityData = [];

    for (let i = 1; i < rows.length; i++) {
        const cols = rows[i].split(",");

        state.cityData.push({
            id: cols[0],
            name_en: cols[1],
            name_jp: cols[2],
            e: parseFloat(cols[3]),
            n: parseFloat(cols[4]),
            category: cols[5]
        });
    }

    console.error(`🔥 loadCities OK. cities= ${state.cityData.length}`);
}

export async function loadWorldLayout() {
    const res = await fetch(`${BASE}/dist/world_layout.json`);

    if (!res.ok) {
        throw new Error("Failed to load world_layout.json: " + res.status);
    }

    const json = await res.json();
    const layout = json.world_layout;

    const anchors = Object.entries(layout.anchors).map(([id, v]) => ({
        id,
        label: v.label,
        role: v.role,
        e: v.bng[0],
        n: v.bng[1],
        visibility: v.visibility || {}
    }));

    state.worldLayout = {
        crs: layout.crs,
        travelModel: layout.travel_model,
        anchors
    };

    console.error(`🔥 Loaded ${anchors.length} anchors`);
}