from pathlib import Path
import shutil

# ===============================
# パス定義
# ===============================

SOURCE = Path(
    "/home/lancer/DOCS/meritocracia-team-share/docs/settings/"
    "Meritocracia_Data_Hub/04_メリトクラシア・リブート/本編/初稿原稿"
)

TARGET = Path(".")
ARCHIVE = TARGET / "archive"
ADOPT_FILE = TARGET / "adopted.txt"

TARGET.mkdir(exist_ok=True)
ARCHIVE.mkdir(exist_ok=True)

# ===============================
# adopted.txt 読み込み
# ===============================

adopted = [
    line.strip()
    for line in ADOPT_FILE.read_text(encoding="utf-8").splitlines()
    if line.strip()
]

# ===============================
# SOURCE 再帰インデックス構築
#
# SOURCE 配下を再帰検索し、
# ファイル名 → 絶対パス の辞書を作る。
# 同名ファイルが複数存在する場合は先に見つかった方を採用し warning を出す。
# ===============================

source_index: dict[str, Path] = {}

for p in SOURCE.rglob("*.md"):
    name = p.name
    if name in source_index:
        print(f"[WARN] 同名ファイルが複数存在します（先の方を優先）:")
        print(f"       採用済: {source_index[name]}")
        print(f"       無視:   {p}")
    else:
        source_index[name] = p

# ===============================
# 既存 ep*.md を掃除
# ===============================

for old in TARGET.glob("ep*.md"):
    old.unlink()

# ===============================
# 採用稿を順番に同期
#
# - 見つからないファイルは warning してスキップ
# - ep番号は欠番を作らず詰める
# ===============================

synced = 0

for name in adopted:
    src = source_index.get(name)

    if src is None:
        print(f"[WARN] ファイルが見つかりません（スキップ）: {name}")
        print(f"       SOURCE 配下 ({SOURCE}) に {name!r} が存在しません。")
        continue

    synced += 1
    ep_num = f"{synced:02}"
    dst = TARGET / f"ep{ep_num}.md"
    shutil.copy2(src, dst)
    print(f"[ADOPT] {name}  ({src.relative_to(SOURCE)})  ->  {dst.name}")

# ===============================
# 結果サマリ
# ===============================

skipped = len(adopted) - synced
print()
print(f"採用: {synced} 件 / 登録: {len(adopted)} 件", end="")
if skipped:
    print(f"  ⚠️  スキップ: {skipped} 件（上記 WARN を確認してください）")
else:
    print()
