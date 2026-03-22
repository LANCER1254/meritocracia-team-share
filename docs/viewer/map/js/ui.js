import { state } from "./state.js";
import { render } from "./renderer.js";

/* ========================= */
/* レイヤータブ              */
/* ========================= */

export function initLayerTabs(canvas) {
    const container = document.getElementById("layerTabs");
    if (!container) return;

    container.innerHTML = "";

    const ctx = canvas.getContext("2d");

    const layers = [
        { key: "grid", label: "地形" },
        { key: "real_cities", label: "都市" },
        { key: "anchors", label: "拠点" },
        { key: "military", label: "軍事" },
    ];

    layers.forEach(layer => {
        const btn = document.createElement("button");
        btn.textContent = layer.label;

        btn.className = state.activeLayers[layer.key] ? "active" : "";

        btn.onclick = () => {
            state.activeLayers[layer.key] = !state.activeLayers[layer.key];
            btn.className = state.activeLayers[layer.key] ? "active" : "";

            render(canvas, ctx);
        };

        container.appendChild(btn);
    });
}

/* ========================= */
/* サイドバー初期化          */
/* ========================= */

export function initSidebar(canvas) {
    initCityList(canvas);
    initAnchorList(canvas);
}

/* ========================= */
/* 都市リスト（単体表示式）  */
/* ========================= */

function initCityList(canvas) {
    const container = document.getElementById("cityList");
    if (!container) return;

    container.innerHTML = "";
    const ctx = canvas.getContext("2d");

    state.cityData.forEach(city => {

        const item = document.createElement("div");
        item.className = "list-item";
        item.textContent = city.name_jp;

        item.onclick = () => {

            // 同じ都市をクリックしたら解除（全表示）
            if (state.selectedCity === city.id) {
                state.selectedCity = null;
            } else {
                state.selectedCity = city.id;
            }

            updateActiveStyles(container);
            render(canvas, ctx);
        };

        container.appendChild(item);
    });
}

/* ========================= */
/* 拠点リスト（単体表示式）  */
/* ========================= */

function initAnchorList(canvas) {
    const container = document.getElementById("anchorList");
    if (!container) return;

    container.innerHTML = "";
    const ctx = canvas.getContext("2d");

    state.worldLayout.anchors.forEach(anchor => {

        const item = document.createElement("div");
        item.className = "list-item";
        item.textContent = anchor.label;

        item.onclick = () => {

            if (state.selectedAnchor === anchor.id) {
                state.selectedAnchor = null;
            } else {
                state.selectedAnchor = anchor.id;
            }

            updateActiveStyles(container);
            render(canvas, ctx);
        };

        container.appendChild(item);
    });
}

/* ========================= */
/* スタイル更新              */
/* ========================= */

function updateActiveStyles(container) {
    const items = container.querySelectorAll(".list-item");

    items.forEach(item => {
        if (
            item.textContent === getSelectedName()
        ) {
            item.classList.add("active");
        } else {
            item.classList.remove("active");
        }
    });
}

function getSelectedName() {
    if (state.selectedCity) {
        const city = state.cityData.find(c => c.id === state.selectedCity);
        return city?.name_jp;
    }

    if (state.selectedAnchor) {
        const anchor = state.worldLayout.anchors.find(a => a.id === state.selectedAnchor);
        return anchor?.label;
    }

    return null;
}
