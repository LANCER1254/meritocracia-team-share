#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path


SCHEDULE_FILE = Path("schedule.json")


def load_schedule() -> dict:
    if not SCHEDULE_FILE.exists():
        return {"publishing": []}

    with SCHEDULE_FILE.open("r", encoding="utf-8") as f:
        return json.load(f)


def save_schedule(data: dict) -> None:
    with SCHEDULE_FILE.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def choose_type() -> str:
    print("\n種類を選択")
    print("1. release")
    print("2. plot")
    print("3. review")
    print("4. infra")
    print("5. work")
    print("6. personal")

    mapping = {
        "1": "release",
        "2": "plot",
        "3": "review",
        "4": "infra",
        "5": "work",
        "6": "personal",
    }

    while True:
        choice = input("番号: ").strip()
        if choice in mapping:
            return mapping[choice]
        print("❌ 1〜6で入力してください")


def input_timeline() -> list[dict]:
    items = []

    print("\n🕒 時間割を追加します")
    while True:
        time = input("時間 (例 19:00): ").strip()
        label = input("内容: ").strip()

        items.append({
            "time": time,
            "label": label
        })

        cont = input("追加しますか？ (y/n): ").strip().lower()
        if cont != "y":
            break

    return items


def main() -> None:
    print("📘 Year Calendar CLI")
    print("1. 新規予定追加")
    print("2. 終了")

    mode = input("番号: ").strip()
    if mode != "1":
        print("終了")
        return

    data = load_schedule()

    date = input("\n📅 日付 (YYYY-MM-DD): ").strip()
    title = input("🏷 ラベル: ").strip()
    item_type = choose_type()
    timeline = input_timeline()

    data.setdefault("publishing", []).append({
        "date": date,
        "label": title,
        "type": item_type,
        "timeline": timeline
    })

    save_schedule(data)

    print("\n✅ schedule.json に保存しました")
    print(f"📅 {date} / {title}")


if __name__ == "__main__":
    main()
