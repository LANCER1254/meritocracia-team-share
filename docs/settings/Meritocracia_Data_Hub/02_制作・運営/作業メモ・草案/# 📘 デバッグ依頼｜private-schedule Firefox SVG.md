# 📘 デバッグ依頼｜private-schedule Firefox SVG className修正 + Viewer横展開点検

対象:
`~/DOCS/meritocracia-team-share/docs/viewer`

## 🎯 目的

Firefox で `private-schedule` のポモドーロが無反応になる不具合を修正し、同種事故を Viewer 全体で再発防止したい。

## ■ 確定原因

Firefox Console:

```text
Uncaught TypeError: setting getter-only property "className"
    renderPomo app.js:152
```

`renderPomo()` 内で SVG circle 要素 `#ps-ring` に対して以下を実行していた。

```javascript
ringEl.className = ...
```

Firefoxでは SVG の `className` が getter-only 扱いで初期描画時にクラッシュする。

結果として:

* 初回 renderPomo 停止
* 後続イベント登録未実行
* START / PAUSE / RESET 無反応

## ■ 修正方針（必須）

以下のように統一してください。

```javascript
ringEl.classList.toggle('ps-break', s.isBreak);
modeEl.classList.toggle('ps-break', s.isBreak);
```

## ■ 追加依頼（重要）

`docs/viewer` 配下を横断し、

```javascript
className =
```

を使用している箇所を洗い出してください。

特に以下を重点確認:

* SVG circle
* SVG path
* progress ring
* timeline icon
* graph系UI

### ルール

* SVG要素: `classList.toggle()` へ置換
* HTML div/span: 必要な箇所のみ維持
* 見た目を壊さない
* Firefox基準で安全化

## ■ 期待成果物

1. 修正済み `private-schedule/app.js`
2. Viewer全体の危険箇所一覧
3. 横展開修正案
4. Firefox互換ルール簡易ガイド
