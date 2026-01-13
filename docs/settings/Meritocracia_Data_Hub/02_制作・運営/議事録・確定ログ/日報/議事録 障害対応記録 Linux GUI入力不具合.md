📝 議事録／障害対応記録
Linux GUI入力不具合（IME/IBus 起因）デバッグログ
■ 発生日

2026-01-13

■ 作業者

Lancer

■ 対象環境

OS：Linux（Ubuntu系）

デスクトップ環境：GNOME

セッション：Wayland

日本語入力：IBus（ibus-mozc）

エディタ：

GNOME Text Editor

Mousepad

Sublime Text

Obsidian

VS Code（唯一正常）

1️⃣ 障害概要

GUIアプリ全般で キーボード入力が不能 になる障害が発生。

主な症状

❌ 文字入力不可（日本語・英語とも）

❌ Ctrl+S 等のショートカット無効

✅ クリップボード貼り付けは可能

✅ CLI（bash / nano）は正常

✅ VS Code（Electron系）のみ正常動作

一見するとエディタ固有の不具合に見えるが、
複数GUIアプリで同時発生。

2️⃣ 初期切り分け結果
ファイルシステム・権限
echo "test" > ~/test.txt
nano ~/test.txt
mount | grep " / "


書き込み可能

root FS：rw

権限異常なし

結論

OS・FS・ユーザー権限は 無罪

3️⃣ アプリ依存性の検証
種別	結果
GTK系（GNOME Text Editor / Mousepad）	❌
非GTK（Sublime Text）	❌
Electron系（VS Code）	✅
Electron系（Obsidian）	❌（※ IME未起動時）
CLI	✅

👉 GUIアプリ全体の入力イベント異常 と判断。

4️⃣ IME（IBus）状態確認
IBus再起動試行
ibus exit
ibus-daemon -drx

出力
IBus に接続できません。

判定

ibus デーモンがセッションに存在していない

入力イベントが GUI に配送されていなかった

5️⃣ 原因確定
原因

IBus（日本語入力デーモン）が起動していなかった／セッションに紐づいていなかった

GNOME / Wayland アップデート後に発生

自動起動が失敗した可能性

エラーメッセージなしで静かに発生するため発見困難

👉 Linuxデスクトップでは アップデート起因で発生しやすい既知系トラブル

6️⃣ 復旧手順（成功）
ibus-daemon --daemonize --xim

確認
ps aux | grep ibus-daemon
echo $GTK_IM_MODULE
echo $QT_IM_MODULE
echo $XMODIFIERS

正常値
GTK_IM_MODULE=ibus
QT_IM_MODULE=ibus（または空）
XMODIFIERS=@im=ibus

結果

GUIアプリで文字入力復旧

Obsidian / Sublime / GTKエディタすべて正常化

7️⃣ 再発防止策
■ 即効ワンライナー（保険）
ibus exit && ibus-daemon -drx

■ 自動起動確認

設定 → 自動起動アプリ

ibus-daemon -drx が登録されているか確認

無ければ追加

8️⃣ 教訓・知見（重要）

GUI入力不可 × CLI正常
→ 最初に IME（ibus / fcitx）を疑う

VS Codeだけ動く場合
→ Electron独自入力処理による例外挙動

一般ユーザーは原因特定が困難
→ OS再インストールに至るケース多発

9️⃣ 今後の運用指針

軽メモ／思考整理：Obsidian

本文・構造化：VS Code

緊急時：CLI（nano）

GNOME標準エディタ：非推奨

■ 総括

本障害は ユーザー操作ミスではなく、Linuxデスクトップ環境におけるアップデート起因の入力基盤不具合。
CLIベースの切り分けと IME 層への到達により、再インストール不要で復旧可能。
