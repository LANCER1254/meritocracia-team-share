# MeritCore プロジェクト 今後の予定表（ロードマップ）

## 目的

本プロジェクトの目的は以下の3つ。

1. **創作環境の高度化（MeritCore開発）**
2. **技術ブログによる知見共有**
3. **作品解説ブログによる世界観発信**

この3つを並行して進める。

---

# 全体戦略

プロジェクトは以下の3軸で進行する。

```text
① 開発（MeritCore / RAG）
② 技術発信（Zenn / Qiita）
③ 作品発信（ブログ / note）
```

それぞれが互いに補完関係にある。

---

# フェーズ構成

## Phase0（現在）

基礎環境完成

状況

```text
MeritCore CLI
MeritDB
MeritWriter
MeritMap
scripts 約160
index.tsv 938 files
```

基礎ナレッジ管理環境は完成済み。

---

# Phase1 技術記事公開（優先）

目的

```text
MeritCore環境の紹介
```

記事候補

### 記事①

タイトル案

```text
小説を書くためのLinux CLI環境を自作した話
```

内容

* なぜCLI環境を作ったのか
* 創作の問題
* スクリプト化の理由
* MeritCore紹介

---

### 記事②

```text
938ファイルの小説設定を検索するCLIナレッジDBを作った
```

内容

* 設定管理の問題
* index.tsv方式
* MeritDBの仕組み
* CLI検索デモ

---

### 記事③

```text
作家が自分用の創作OSを作った話
```

内容

* MeritCore思想
* CLI統合環境
* 自作ツール群

---

# Phase2 RAG導入

目的

```text
MeritDB + AI検索
```

開発内容

```text
grep検索
↓
関連md抽出
↓
AI回答
```

想定作業時間

```text
5時間
```

完成後

```text
質問 → 関連設定 → AI回答
```

---

# Phase3 Vector RAG

目的

```text
意味検索
```

構造

```text
Markdown
↓
Embedding
↓
VectorDB
↓
AI回答
```

作業時間

```text
15〜20時間
```

---

# Phase4 技術記事（RAG編）

記事候補

```text
938ファイルの小説設定をRAGで検索するシステムを作った
```

内容

* RAG導入理由
* CLI統合
* 開発ログ
* 実際の検索例

---

# Phase5 作品解説ブログ

目的

```text
作品世界の紹介
```

媒体候補

```text
note
個人ブログ
```

記事例

### 作品世界観

```text
メリトクラシア世界観解説
```

内容

* 世界構造
* 国家
* 神界システム

---

### キャラクター解説

```text
ジェイド・レオンハルト解説
```

内容

* 思想
* 行動原理
* 物語構造

---

### 制度解説

```text
グローリアテストとは何か
```

内容

* 試験制度
* 社会構造
* 階級システム

---

# Phase6 開発発信（継続）

X（Twitter）発信

内容

```text
開発ログ
CLIツール
RAG進捗
```

目的

```text
技術 + 創作コミュニティ
```

---

# 長期ビジョン

MeritCoreは最終的に

```text
創作ナレッジOS
```

として完成させる。

構造

```text
MeritCore
├ MeritDB
├ MeritWriter
├ MeritMap
├ MeritAI（RAG）
└ Knowledge System
```

---

# まとめ

今後の優先順位

```text
① 技術記事（MeritCore）
② 技術記事（MeritDB）
③ RAG導入
④ RAG記事
⑤ 作品解説ブログ
```

この順序で進める。

---

MeritCore Project Roadmap
Development / Writing / Publication Plan
