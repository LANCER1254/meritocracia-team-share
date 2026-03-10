📜 MeritCore AI環境構築計画
議事録 / 技術方針まとめ
作成日

2026-03-08

1. 目的

メリトクラシア制作環境を以下の状態にする。

PCが壊れても 完全に近い再現

AI環境の 自動構築

GitHubによる 設計図バックアップ

CLI（MeritCore）による 統合管理

2. 基本設計
GitHub = 設計図

GitHubには以下を保存する。

MeritCore/
 ├ Dockerfile
 ├ docker-compose.yml
 ├ install.sh
 ├ install_models.sh
 ├ requirements.txt
 ├ scripts/
 ├ config/
 ├ lore/
 └ prompts/

保存内容

CLIスクリプト

AI設定

Docker環境定義

lore（世界設定）

prompts

容量

数MB〜数十MB

3. GitHubに保存しないデータ

容量の大きいデータは保存しない。

対象

AIモデル
StableDiffusionモデル
embedding DB
vector DB
cache
logs
生成画像

理由

数GB〜数十GB

GitHubに不向き

4. 重いデータの管理方法

重いデータは 自動DLスクリプトで復元する

例

install_models.sh

処理

HuggingFace
Civitai
モデルDL

これにより

GitHubから環境完全復元可能

5. Docker導入

Dockerを導入し 環境再現性を向上

Dockerfile例

FROM ubuntu:22.04

RUN apt update
RUN apt install -y python3 python3-pip

RUN pip install faiss-cpu

固定される要素

OS

Python

ライブラリ

AIツール

6. 再現性

再現性レベル

構成	再現率
GitHubのみ	80〜90%
GitHub + install script	90〜95%
GitHub + Docker	95〜99%

GPUなどハード依存を除けば

実質100%再現

7. 復元手順

新PC復元手順

① GitHub取得

git clone meritcore

② 環境構築

docker compose build

③ モデルDL

./install_models.sh

④ AI環境起動

docker compose up

復元時間

約10〜20分

8. MeritCore CLI統合

MeritCore CLIからAI管理を行う。

例

mc
 ├ writing
 ├ map
 ├ ai
 ├ tools
 └ ops

AIメニュー

mc ai ask
mc ai search
mc ai rebuild
mc ai install
9. AIアーキテクチャ

AI構造

質問
 ↓
設定検索（ローカル）
 ↓
プロンプト生成
 ↓
Claude / ChatGPT
 ↓
回答

ローカルAIの役割

設定検索

embedding

vectorDB

クラウドAIの役割

推論

文章生成

10. ストレージ容量見込み
データ	容量
設定ファイル	数MB
embedding DB	200MB〜1GB
AIモデル	2GB〜20GB

合計

数GB〜数十GB

11. バックアップ方針

3層バックアップ

① GitHub
② ローカルバックアップ
③ 外部SSD / NAS

12. 今後の開発段階
Phase1

AI検索システム（RAG）

時間目安

4〜7時間

内容

設定検索

プロンプト生成

API連携

Phase2

MeritCore AI統合

時間目安

1〜2日

内容

CLI統合

embedding

vector検索

Phase3

作家AIシステム

時間目安

3〜5日

機能

キャラ関係管理

年表生成

矛盾チェック

13. 最終目標

MeritCoreを

創作OSレベルの環境

にする。

機能

mc write
mc map
mc ai
mc lore
mc plot
14. 想定メリット

PC故障でも 10〜20分で復元

AI環境の 完全自動構築

GitHubによる 開発管理

CLIによる 制作効率化

まとめ

今回の方針

GitHub = 設計図
Docker = 環境
Script = 自動復元

これにより

実質100%再現可能な創作環境

を構築する。