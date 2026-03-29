import json
import sys
import subprocess
from pathlib import Path

# =========================
# 設定
# =========================
DATA_PATH = Path(__file__).parent / "data.json"

# =========================
# JSON操作
# =========================
def load_data():
    if not DATA_PATH.exists():
        print("❌ data.json が存在しません")
        sys.exit(1)

    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def save_data(data):
    with open(DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


# =========================
# タスク更新
# =========================
def update_status(task_name, new_status):
    data = load_data()

    for task in data.get("tasks", []):
        if task["name"] == task_name:
            task["status"] = new_status
            save_data(data)
            print(f"✅ {new_status.upper()}: {task_name}")
            return True

    print("❌ タスクが見つかりません")
    return False


# =========================
# 一覧表示
# =========================
def list_tasks():
    data = load_data()

    print("\n📊 タスク一覧\n")
    for task in data.get("tasks", []):
        print(f"- {task['name']} [{task['status']}]")
    print()


# =========================
# Git自動push（任意）
# =========================
def auto_git_push():
    try:
        subprocess.run("git add .", shell=True, check=True)
        subprocess.run('git commit -m "auto: task update"', shell=True, check=True)
        subprocess.run("git push", shell=True, check=True)
        print("🚀 Git push 完了")
    except Exception as e:
        print(f"⚠ Gitエラー: {e}")


# =========================
# CLI
# =========================
def main():
    if len(sys.argv) < 2:
        print("使い方:")
        print('  python task.py done "タスク名"')
        print('  python task.py doing "タスク名"')
        print('  python task.py todo "タスク名"')
        print('  python task.py list')
        return

    command = sys.argv[1]

    if command == "list":
        list_tasks()
        return

    if len(sys.argv) < 3:
        print("❌ タスク名を入力してください")
        return

    task_name = sys.argv[2]

    if command in ["done", "doing", "todo"]:
        success = update_status(task_name, command)

        if success:
            # 自動Git（いらなければコメントアウト）
            auto_git_push()
    else:
        print("❌ 不明なコマンド")


if __name__ == "__main__":
    main()