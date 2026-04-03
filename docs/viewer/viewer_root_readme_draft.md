# 📘 docs/viewer README

Meritocracia Hub の Viewer 全体構造と運用ルールをまとめたルートREADME。

---

## 🎯 目的

`docs/viewer/` は **GitHub Pages 公開用の統合Hub**。

世界観・キャラ・ストーリー・制作進行・マップ・知識DBを、
**カテゴリ別の閲覧UIとして統合表示する。**

Hub本体は極力安定運用し、各カテゴリはモジュール単位で拡張する。

---

## 🗂 現在のディレクトリ構造

```text
viewer/
├ index.html              # Hub本体（極力固定）
├ modules/               # セクション部品（partial化）
├ story/                 # ストーリー系
├ character/             # キャラUI
├ db/                    # 国家 / 神話 / DB資料
├ knowledge/             # Knowledge Core
├ map/                   # MeritMap
├ system/                # 心音・契約など
├ track/                 # 進行トラッカー
├ memo/                  # Discord / メモHTML
├ daily.html             # 日報Viewer
└ update_viewer_index.sh # index系更新
```

---

## 🧩 設計ルール（重要）

### 1. Hub本体は極力触らない

- `index.html` は外枠のみ
- セクション本文は `modules/` に分離
- 事故防止のため大規模直編集禁止

### 2. ストーリーから段階的にモジュール化

最初の対象:

```text
modules/story-section.html
```

成功後に以下へ横展開。

- world-section
- character-section
- production-section

### 3. 各カテゴリは独立運用

例:

```text
story/
├ old/       # 旧作90話
├ reboot/    # 新作原稿
├ plot/      # プロット
└ route/     # IF分岐
```

---

## ✍ 推奨拡張順

1. story module化
2. reboot追加
3. plot追加
4. production module化
5. public/private切替

---

## 🚀 運用思想

このViewerは単なるサイトではなく、

> **制作OSの可視化インターフェース**

として扱う。

- old = 過去資産
- reboot = 現行本文
- plot = 設計
- track = 進行
- knowledge = 思考DB

Hub本体は"OSのデスクトップ"、各フォルダは"アプリ"として管理する。

