// canvas_v3/js/state.js

export const state = {
  // =========================
  // 基本設定
  // =========================
  CELL_SIZE: 1,

  // =========================
  // データ
  // =========================
  gridData: [],
  cityData: [],
  worldLayout: null,

  // =========================
  // マップ範囲
  // =========================
  minE: 0,
  minN: 0,
  maxE: 0,
  maxN: 0,

  // =========================
  // レイヤー表示制御
  // =========================
  activeLayers: {
    grid: true,
    real_cities: true,
    anchors: true,
    military: true
  },

  // =========================
  // 🔥 単体表示用（今回追加）
  // =========================
  selectedCity: null,
  selectedAnchor: null
};
