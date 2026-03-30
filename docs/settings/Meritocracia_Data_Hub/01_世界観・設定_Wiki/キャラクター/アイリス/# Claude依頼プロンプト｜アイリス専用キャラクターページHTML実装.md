# Claude依頼プロンプト｜アイリス専用キャラクターページHTML実装

あなたはプロダクション品質のフロントエンドエンジニアです。
以下の要件で **単体HTML + CSS（1ファイル完結）** を実装してください。

---

## 🎯 目的

『メリトクラシア -Reboot-』のメインヒロイン
**アイリス＝アールグレイ専用キャラクターページ** を制作する。

GitHub Pagesの Viewer 配下
`docs/viewer/character/iris.html`
にそのまま配置できる品質を目指す。

---

## ☕ デザインテーマ

### コンセプト

**「高貴な琥珀色と、湯気に溶ける絶望」**

名前の **Earlgrey** を活かし、
高級紅茶ブランドのラベルデザインをモチーフにする。

読者が最初に

> 「名前アールグレイだから紅茶やんｗ」

と軽く笑い、読み進めると
戦争奴隷・家庭崩壊・救済テーマの重さに気づく
**ギャップ演出UI** にする。

---

## 🎨 カラーパレット

* メイン背景：`#8B4513`
* グラデ背景：`#D2691E`
* アクセントゴールド：`#D4AF37`
* テキスト：`#FFF8E7`
* 深層心理ボタン：`#5C2E1F`

紅茶の琥珀色、羊皮紙、ティーバッグ、金縁カップを連想させること。

---

## 🧱 HTML構造（この骨組みで実装）

```html
<div class="character-page iris-earlgrey">
  <header class="tea-label-header">
    <div class="brand-logo">MERITOCRACIA - Special Blend</div>
    <h1 class="char-name">Iris Earlgray</h1>
    <p class="flavor-text">“壊れる直前で淹れられた、最も芳醇な一杯”</p>
  </header>

  <main class="profile-container">
    <section class="visual-section">
      <div class="character-illust">
        <div class="steam-effect"></div>
      </div>
    </section>

    <section class="data-section">
      <div class="menu-card">
        <h3>Profile Menu</h3>
        <dl class="status-list">
          <dt>Origin</dt><dd>Altuna (Dark Elf)</dd>
          <dt>Status</dt><dd>Resident / Former War Slave</dd>
          <dt>Specialty</dt><dd>Domestic Arts & Devotion</dd>
        </dl>
      </div>

      <div class="hidden-notes">
        <button class="sugar-cube-btn">深層心理（閲覧注意）</button>
      </div>
    </section>
  </main>

  <footer class="memory-sediment">
    <p>※このページは「レオンハルト家の食卓」の提供でお送りします</p>
    <small>Best Before: 2026.05.08</small>
  </footer>
</div>
```

---

## ✨ 必須演出

### 1) 湯気エフェクト

* `steam-effect` にCSSアニメーション
* ゆっくり上に揺らぐ
* 透明度変化あり
* 紅茶の湯気のような柔らかさ

### 2) 高級ラベル感

* 二重線 border
* 四隅に植物 ornament
* 茶葉 / アイビー風の装飾
* 明朝系・セリフ系フォント
* 英国高級紅茶ブランド風

### 3) hover演出

カード hover 時に

* 背景が少し明るくなる
* 金縁が発光
* 琥珀に光が差し込むような演出

### 4) hidden notes

「深層心理（閲覧注意）」ボタンを押すと

* 裏設定欄が開く
* 戦争奴隷 / 家庭崩壊 / 帰属意識
  を短く表示できるUI

### 5) スマホ最適化

レスポンシブ必須。
スマホ縦画面で最優先で美しく見えるように。

---

## 📦 実装ルール

* HTMLとCSSは1ファイルに統合
* JavaScriptは最小限（hidden notes開閉のみ）
* 外部ライブラリ禁止
* GitHub Pagesで即動作
* production quality
* 可読性重視
* 後で他キャラに流用しやすいクラス設計

---

## 🎯 最終ゴール

読者がページを開いた瞬間

> おしゃれ
> 紅茶モチーフ可愛い
> でも設定が重い
> アイリス守りたい

となる、**メインヒロインの象徴ページ** を作ってください。
