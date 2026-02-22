import { state } from "./state.js";

export function ENtoPixel(e, n, canvas) {
    const x = ((e - state.minE) / 1000) * state.CELL_SIZE;
    const y = canvas.height - ((n - state.minN) / 1000) * state.CELL_SIZE;
    return {x, y};
}

export function colorFromMask(mask) {
    if (mask == 0) return "#111";
    if (mask == 1) return "#4A90E2";
    if (mask == 2) return "#E94E4E";
    return "#333";
}

export function cityColor(category) {
    switch(category) {
        case "capital": return "#ff3333";
        case "university": return "#3399ff";
        case "industrial": return "#888888";
        case "coastal": return "#00cccc";
        case "regional": return "#ffaa00";
        default: return "#00aaff";
    }
}
