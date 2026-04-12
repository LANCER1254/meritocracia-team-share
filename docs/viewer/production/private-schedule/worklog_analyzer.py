import os
import json
from collections import defaultdict
from datetime import datetime

TARGET_DIR = "/home/lancer/DOCS/ドキュメント/meritocracia-complete/docs/日報"
MASTER_FILE = os.path.join(TARGET_DIR, "worklog_master.json")
STATS_FILE = os.path.join(TARGET_DIR, "worklog_stats.json")
WEEKLY_FILE = os.path.join(TARGET_DIR, "weekly_focus.json")

def load_master():
    with open(MASTER_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def categorize(text):
    text = text.lower()
    # Priority matching
    if any(k in text for k in ["執筆", "原稿", "小説", "エピ", "プロット", "伏線", "神話", "物語", "キャラ", "心情", "読書", "設定", "テキスト", "文章", "資料", "設定資料", "世界観"]):
        return "Writing"
    if any(k in text for k in ["viewer", "ui", "画面", "デプロイ", "html", "ブラウザ", "表示", "フロント", "レイアウト", "css", "js", "ビューア"]):
        return "Viewer"
    if any(k in text for k in ["db", "データベース", "json", "パース", "統合", "検索", "meritdb", "tracker", "index", "tsv", "ログ"]):
        return "DB"
    if any(k in text for k in ["地図", "マップ", "map", "geojson", "cli", "bash", "スクリプト", "python", "自動化", "システム", "バックアップ", "環境", "サーバー", "ローカル", "コマンド", "sh", "構築"]):
        return "System/Map"
    return "Other"

def analyze():
    data = load_master()
    
    monthly_stats = defaultdict(lambda: {
        "work_days": 0,
        "total_tasks": 0,
        "categories": {"Writing": 0, "Viewer": 0, "DB": 0, "System/Map": 0, "Other": 0},
        "issues_reported": 0
    })
    
    weekly_focus = defaultdict(lambda: {
        "focus_scores": {"Writing": 0, "Viewer": 0, "DB": 0, "System/Map": 0, "Other": 0},
        "achievements": [],
        "upcoming_tasks": [],
        "days_logged": 0
    })
    
    for entry in data:
        date_str = entry["date"]
        try:
            dt = datetime.strptime(date_str, "%Y-%m-%d")
        except ValueError:
            continue
            
        month_key = dt.strftime("%Y-%m")
        # ISO week: YYYY-Wnn
        year, week_num, _ = dt.isocalendar()
        week_key = f"{year}-W{week_num:02d}"
        
        # Monthly Accumulation
        monthly_stats[month_key]["work_days"] += 1
        monthly_stats[month_key]["issues_reported"] += len(entry.get("issues", []))
        
        weekly_focus[week_key]["days_logged"] += 1
        
        all_tasks = entry.get("completed", []) + entry.get("updated", [])
        monthly_stats[month_key]["total_tasks"] += len(all_tasks)
        
        for task in all_tasks:
            cat = categorize(task)
            monthly_stats[month_key]["categories"][cat] += 1
            weekly_focus[week_key]["focus_scores"][cat] += 1
            if cat != "Other" and len(weekly_focus[week_key]["achievements"]) < 10:
                # Store full task text with category label
                weekly_focus[week_key]["achievements"].append(f"[{cat}] {task}")
                
        for nxt in entry.get("next_actions", []):
            if len(weekly_focus[week_key]["upcoming_tasks"]) < 10:
                cat = categorize(nxt)
                weekly_focus[week_key]["upcoming_tasks"].append(f"[{cat}] {nxt}")

    # Process final stats for Monthly
    final_monthly = []
    for mk in sorted(monthly_stats.keys()):
        mv = monthly_stats[mk]
        total = sum(mv["categories"].values())
        ratios = {}
        if total > 0:
            for k, v in mv["categories"].items():
                ratios[k] = round((v / total) * 100, 1)
        else:
            for k in mv["categories"].keys():
                ratios[k] = 0.0
                
        final_monthly.append({
            "month": mk,
            "work_days": mv["work_days"],
            "total_tasks_completed": mv["total_tasks"],
            "category_counts": mv["categories"],
            "category_ratios_percent": ratios,
            "issues_encountered": mv["issues_reported"]
        })
        
    # Process final weekly stats
    final_weekly = []
    for wk in sorted(weekly_focus.keys()):
        wv = weekly_focus[wk]
        scores = wv["focus_scores"]
        # Find top theme excluding "Other" if possible
        filtered_scores = {k: v for k, v in scores.items() if k != "Other"}
        top_focus = max(filtered_scores, key=filtered_scores.get) if sum(filtered_scores.values()) > 0 else "Mixed/Other"
        
        # Deduplicate achievements and strictly limit to 5
        achievements = list(dict.fromkeys(wv["achievements"]))[:5]
        upcoming = list(dict.fromkeys(wv["upcoming_tasks"]))[:5]
        
        final_weekly.append({
            "week": wk,
            "days_logged": wv["days_logged"],
            "top_theme": top_focus,
            "focus_scores": scores,
            "key_achievements": achievements,
            "next_actions": upcoming
        })
        
    return final_monthly, final_weekly

if __name__ == "__main__":
    if not os.path.exists(MASTER_FILE):
        print(f"Error: {MASTER_FILE} not found.")
        exit(1)
        
    monthly, weekly = analyze()
    
    with open(STATS_FILE, "w", encoding="utf-8") as f:
        json.dump(monthly, f, indent=2, ensure_ascii=False)
        
    with open(WEEKLY_FILE, "w", encoding="utf-8") as f:
        json.dump(weekly, f, indent=2, ensure_ascii=False)
        
    print(f"✅ Generated {STATS_FILE} ({len(monthly)} months)")
    print(f"✅ Generated {WEEKLY_FILE} ({len(weekly)} weeks)")
