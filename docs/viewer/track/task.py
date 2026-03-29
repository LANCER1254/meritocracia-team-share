import json
import sys

FILE = "data.json"

def load():
    with open(FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save(data):
    with open(FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def mark_done(task_name):
    data = load()

    for task in data["tasks"]:
        if task["name"] == task_name:
            task["status"] = "done"
            print(f"✅ 完了: {task_name}")
            save(data)
            return

    print("❌ タスク見つからない")

if __name__ == "__main__":
    cmd = sys.argv[1]
    name = sys.argv[2]

    if cmd == "done":
        mark_done(name)
