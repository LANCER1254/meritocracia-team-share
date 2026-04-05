#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
CHAPTER_DIR = BASE_DIR / "chapter"
OUTPUT_JSON = BASE_DIR / "plot-data.json"

CATEGORY_LABELS = {
    "timeline-main": "本編時系列",
    "terror": "中央市場テロ事件",
    "timeline-zero": "ZERO編",
    "if-route": "IFルート",
}


def build_title(stem: str) -> str:
    """ファイル名から最低限見やすいタイトルを作る."""
    return stem.replace("_", " ").replace("ep", "EP ")


def build_desc(folder: str) -> str:
    """フォルダ別の簡易説明."""
    return f"{CATEGORY_LABELS.get(folder, folder)}配下の自動登録プロット"


def main() -> None:
    items = []

    for file in sorted(CHAPTER_DIR.rglob("*.md")):
        rel = file.relative_to(CHAPTER_DIR)
        folder = rel.parts[0]
        stem = file.stem

        items.append(
            {
                "id": stem,
                "title": build_title(stem),
                "category": folder,
                "desc": build_desc(folder),
                "file": f"./viewer.html?file=./chapter/{rel.as_posix()}",
                "dbLink": "../../story/",
            }
        )

    OUTPUT_JSON.write_text(
        json.dumps(items, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    print(f"✅ plot-data regenerated: {len(items)} items")


if __name__ == "__main__":
    main()
