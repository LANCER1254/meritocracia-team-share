🧠 Phase8 完全版
🔥 Knowledge DB フル展開（拡張版）
🗂 1｜Knowledge 拡張（KN-0005〜）
🗂 KN-0005
ID: KN-0005
TYPE: Knowledge
CATEGORY: Workflow

SUMMARY:
制作は「構想→設計→実装→検証→修正→資料化」の流れで統一される

DETAIL:
創作と開発を統合したワークフロー。
AIを用途別に分担し、フェーズごとに最適な処理を行う。

RELATION:
- CLI
- AI
🗂 KN-0006
ID: KN-0006
TYPE: Knowledge
CATEGORY: AI/Strategy

SUMMARY:
AIは用途別に分担することで効率最大化する

DETAIL:
Grok：発想
ChatGPT：設計
Claude：レビュー
Gemini：本文生成
役割分離により品質と速度を両立。

RELATION:
- AI生成
🗂 KN-0007
ID: KN-0007
TYPE: Knowledge
CATEGORY: Data/Design

SUMMARY:
Viewerは「資料」ではなく「体験コンテンツ」である

DETAIL:
設定資料をHTML化し、
ナビゲーション・UI・リンク構造で
体験として閲覧可能にする。

RELATION:
- Viewer
🗂 KN-0008
ID: KN-0008
TYPE: Knowledge
CATEGORY: Development

SUMMARY:
CLIは人間の思考を止めないためのインターフェースである

DETAIL:
GUIではなくCLIを採用することで、
操作の中断を防ぎ思考を維持する。

RELATION:
- CLI
🛠 2｜Script 完全展開（SC-0006〜）
🗂 SC-0006
ID: SC-0006
TYPE: Script
CATEGORY: Backup/System

SUMMARY:
環境復元スクリプトによりOS状態を完全保存可能

DETAIL:
設定・cron・パッケージ・環境変数を収集し、
Google Driveへ自動アップロード。

SOURCE:
env_recovery_backup.sh

RELATION:
- rclone
🗂 SC-0007
ID: SC-0007
TYPE: Script
CATEGORY: System/Cleanup

SUMMARY:
キャッシュ削除スクリプトで容量とパフォーマンスを最適化

DETAIL:
.cache / Steam / shadercache / log を削除し、
バックアップ効率を向上。

SOURCE:
cleanup_cache.sh

RELATION:
- Linux
🗂 SC-0008
ID: SC-0008
TYPE: Script
CATEGORY: Game/Environment

SUMMARY:
ゲーム実行環境をWine + DXVKで統一構築

DETAIL:
NVIDIA / Vulkan / Wine / Winetricks を導入し、
同人ゲーム互換環境を構築。

SOURCE:
setup_game_env.sh

RELATION:
- Wine
- Vulkan
🗂 SC-0009
ID: SC-0009
TYPE: Script
CATEGORY: Game/Launcher

SUMMARY:
Proton環境でゲームをCLI起動可能

DETAIL:
Steam Protonを直接呼び出し、
GUIを介さずゲーム起動を固定化。

SOURCE:
run_emilia.sh / run_idol_ichigo.sh

RELATION:
- Steam
- Proton
🗂 SC-0010
ID: SC-0010
TYPE: Script
CATEGORY: Game/Installer

SUMMARY:
Proton-GEをGitHub API経由で自動導入

DETAIL:
最新リリースを取得し、
Steam compatibilitytoolsへ展開。

SOURCE:
install-proton-ge.sh

RELATION:
- GitHub
🗂 SC-0011
ID: SC-0011
TYPE: Script
CATEGORY: CLI/Utility

SUMMARY:
その他メニューは外部ツール・サブシステムの統合UI

DETAIL:
Map Forge / Firefox / AI生成 / Git操作などをまとめて呼び出す。

SOURCE:
other_menu.sh

RELATION:
- CLI
🗂 SC-0012
ID: SC-0012
TYPE: Script
CATEGORY: Novel/Management

SUMMARY:
なろう投稿管理はmeta.tsvを中心に管理される

DETAIL:
ファイル・サブタイトル・投稿日時をTSVで管理し、
CLIで編集可能。

SOURCE:
add.sh / edit-subtitle.sh / edit-datetime.sh

RELATION:
- TSV
🗂 SC-0013
ID: SC-0013
TYPE: Script
CATEGORY: Novel/Analysis

SUMMARY:
文字数計測は外部Pythonスクリプトで実行

DETAIL:
全件更新・dry-run対応により安全に再計算可能。

SOURCE:
charcount.sh

RELATION:
- Python
📜 3｜History 拡張（HS-0005〜）
🗂 HS-0005
ID: HS-0005
TYPE: History
CATEGORY: Milestone

SUMMARY:
AIキャラ生成CLI環境完成

DETAIL:
ComfyUI API + seed固定 + CLIにより
キャラ量産パイプライン確立。

RELATION:
- SC-0004
🗂 HS-0006
ID: HS-0006
TYPE: History
CATEGORY: Milestone

SUMMARY:
IP-Adapter導入により再現生成フェーズへ移行

DETAIL:
workflow仕様変更対応を突破し、
高精度キャラ再現が可能に。

RELATION:
- AI生成
🗂 HS-0007
ID: HS-0007
TYPE: History
CATEGORY: Milestone

SUMMARY:
Viewerを作品サイトとして完成

DETAIL:
Hub・読書UI・タイムラインを統合し、
Web作品として成立。

RELATION:
- Viewer
🗂 HS-0008
ID: HS-0008
TYPE: History
CATEGORY: Milestone

SUMMARY:
制作が「プロジェクト運用」に移行

DETAIL:
タスク管理・HP連携・進行管理が導入され、
個人制作からプロジェクト化。

RELATION:
- Tracker
🧠 4｜DB最終構造
Merit Knowledge Core
 ├ KN（思想・設計） 8件+
 ├ SC（スクリプト） 13件+
 ├ HS（履歴）       8件+

👉 もう完全にDBとして成立してる

🚀 5｜ここからの変化（重要）

これやったことで何が起きたか👇

いい判断 👍
👉 Viewer接続＝“見える化”で一気に完成度上がるフェーズ

ここはちゃんと設計する👇

🧠 Phase9｜Viewer接続（DB → UI）
🎯 ゴール
DB（KN / SC / HS）
↓
JSON化
↓
HTMLで表示
↓
ブラウザで検索・閲覧

👉 ＝お前の脳が“サイト化”される

🏗 全体構造（確定）
MeritCore
 ├ DB（.md / .yaml）
 ├ JSON（中間）
 └ Viewer（HTML）
🔥 ① DB → JSON変換

まずここが必須

🧩 出力形式（JSON）
[
  {
    "id": "KN-0001",
    "type": "Knowledge",
    "category": "Core/System",
    "summary": "MeritCoreは創作統合OS",
    "detail": "...",
    "relation": ["CLI", "Viewer"]
  }
]
🛠 方法（最速）

👉 最初は手動 or 簡易スクリプトでOK

仮スクリプト（bash + jq）
cat db/*.md | python convert_to_json.py > db.json

👉 ここは後で自動化する

🔥 ② Viewer（HTML）
📁 構成
viewer/
 ├ index.html
 ├ db.json
 └ app.js
🧾 index.html（コピペOK）
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Merit Knowledge Core</title>
</head>
<body>

<h1>🧠 Merit Knowledge Core</h1>

<input type="text" id="search" placeholder="検索...">

<ul id="list"></ul>

<script src="app.js"></script>

</body>
</html>
⚙ app.js（コア）
fetch('db.json')
  .then(res => res.json())
  .then(data => {

    const list = document.getElementById('list');
    const search = document.getElementById('search');

    function render(items) {
      list.innerHTML = '';
      items.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
          <b>${item.id}</b> - ${item.summary}<br>
          <small>${item.category}</small>
        `;
        list.appendChild(li);
      });
    }

    render(data);

    search.addEventListener('input', e => {
      const keyword = e.target.value.toLowerCase();

      const filtered = data.filter(item =>
        item.summary.toLowerCase().includes(keyword) ||
        item.detail.toLowerCase().includes(keyword)
      );

      render(filtered);
    });

  });
🔥 ③ 表示イメージ
[検索バー]

KN-0001 - MeritCoreは創作統合OS
KN-0002 - CLI中心設計
SC-0001 - CLI統合

👉 grepより直感的
👉 非エンジニアでも使える

🚀 ④ 次の進化（ここが本命）
🧠 詳細ページ化
クリック → 詳細表示
🧠 カテゴリフィルタ
Knowledge
Script
History
🧠 関係性表示
KN-0001
 ↳ SC-0001
 ↳ HS-0001

👉 ここまでやると

👉 Notion超える

💡 お前に最適なやり方
🥇 最短ルート
db.json作る（手動OK）
HTML配置
GitHub Pagesに置く
🥈 中期

👉 JSON自動生成

🥉 完成系

👉 CLI → DB → Viewer自動反映

🔥 正直な話

ここやると👇

作品
×
開発
×
データベース

👉 全部繋がる