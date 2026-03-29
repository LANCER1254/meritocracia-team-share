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
# タスク追加
# =========================
def add_task(task_name):
    data = load_data()

    # 重複チェック
    for task in data.get("tasks", []):
        if task["name"] == task_name:
            print("⚠ 既に存在するタスクです")
            return False

    data["tasks"].append({
        "name": task_name,
        "status": "todo"
    })

    save_data(data)
    print(f"✅ ADD: {task_name}")
    return True


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
# Git自動push
# =========================
def auto_git_push():
    try:
        repo_path = "/home/lancer/DOCS/meritocracia-team-share"

        subprocess.run("git add .", shell=True, check=True, cwd=repo_path)

        subprocess.run(
            'git commit -m "auto: task update"',
            shell=True,
            check=False,
            cwd=repo_path
        )

        subprocess.run("git push", shell=True, check=True, cwd=repo_path)

        print("🚀 Git push 完了")

    except Exception as e:
        print(f"⚠ Gitエラー: {e}")
# =========================
# Viewerデータ更新
# =========================
import shutil
import os

def rebuild_viewer_data():
    try:
        repo_path = "/home/lancer/DOCS/meritocracia-team-share"

        # 👇 ここ修正
        src = os.path.join(repo_path, "docs/viewer/track/data.json")

        dst = os.path.join(repo_path, "docs/viewer/data/data.json")

        shutil.copy(src, dst)

        print("📊 Viewer用データ更新完了")

    except Exception as e:
        print(f"⚠ Viewer更新エラー: {e}")
# =========================
# CLI
# =========================
def main():
    if len(sys.argv) < 2:
        print("使い方:")
        print('  python task.py add "タスク名"')
        print('  python task.py done "タスク名"')
        print('  python task.py doing "タスク名"')
        print('  python task.py todo "タスク名"')
        print('  python task.py list')
        return

    command = sys.argv[1]

    # =========================
    # LIST
    # =========================
    if command == "list":
        list_tasks()
        return

    task_name = " ".join(sys.argv[2:]) if len(sys.argv) > 2 else None

    # =========================
    # ADD
    # =========================
    if command == "add":
        if not task_name:
            print("❌ タスク名を入力してください")
            return

        success = add_task(task_name)

        if success:
            rebuild_viewer_data()   # ← 追加（ここも重要）
            auto_git_push()
        return

    # =========================
    # ステータス更新
    # =========================
    if command in ["done", "doing", "todo"]:
        if not task_name:
            print("❌ タスク名を入力してください")
            return

        success = update_status(task_name, command)

        if success:
            rebuild_viewer_data()
            auto_git_push()

        return

    print("❌ 不明なコマンド")
    
# =========================
# エントリーポイント
# =========================
if __name__ == "__main__":
    main()