from pathlib import Path
import shutil

SOURCE = Path("/home/lancer/DOCS/meritocracia-team-share/docs/settings/Meritocracia_Data_Hub/04_メリトクラシア・リブート/本編/初稿原稿/修正版プロローグ")
TARGET = Path(".")

files = sorted(SOURCE.glob("*.md"))

for i, file in enumerate(files, start=1):
    dst = TARGET / f"ep{i:02}.md"
    shutil.copy2(file, dst)
    print(f"{file.name} -> {dst.name}")

print(f"同期完了: {len(files)}件")
