import os
import json
from collections import defaultdict
from datetime import datetime

TARGET_DIR = "/home/lancer/DOCS/ドキュメント/meritocracia-complete/docs/日報"
MASTER_FILE = os.path.join(TARGET_DIR, "worklog_master.json")

def load_master():
    with open(MASTER_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def categorize(text):
    text = text.lower()
    if any(k in text for k in ["執筆", "原稿", "小説", "エピソード", "プロット", "伏線", "神話", "物語", "キャラ", "心情", "読書", "設定"]):
        return "Writing"
    if any(k in text for k in ["viewer", "ui", "画面", "デプロイ", "html", "ブラウザ", "表示", "フロント"]):
        return "Viewer"
    if any(k in text for k in ["db", "データベース", "json", "パース", "統合", "検索", "meritdb", "tracker", "index", "tsv"]):
        return "DB"
    if any(k in text for k in ["地図", "マップ", "map", "geojson", "cli", "bash", "スクリプト", "python", "自動化", "システム", "バックアップ", "環境"]):
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
                weekly_focus[week_key]["achievements"].append(f"[{cat}] {task}")
                
        # weekly upcoming
        for nxt in entry.get("next_actions", []):
            if len(weekly_focus[week_key]["upcoming_tasks"]) < 10:
                cat = categorize(nxt)
                weekly_focus[week_key]["upcoming_tasks"].append(f"[{cat}] {nxt}")

    # Process final stats for Monthly
    final_monthly = {}
    for mk, mv in monthly_stats.items():
        total = sum(mv["categories"].values())
        ratios = {}
        if total > 0:
            for k, v in mv["categories"].items():
                ratios[k] = round((v / total) * 100, 1)
        
        final_monthly[mk] = {
            "work_days": mv["work_days"],
            "total_tasks_completed": mv["total_tasks"],
            "category_counts": mv["categories"],
            "category_ratios_percent": ratios,
            "issues_encountered": mv["issues_reported"]
        }
        
    # Process final weekly stats
    final_weekly = {}
    for wk, wv in weekly_focus.items():
        scores = wv["focus_scores"]
        top_focus = max(scores, key=scores.get) if sum(scores.values()) > 0 else "None"
        
        # deduplicate
        achievements = list(dict.fromkeys(wv["achievements"]))
        upcoming = list(dict.fromkeys(wv["upcoming_tasks"]))
        
        final_weekly[wk] = {
            "days_logged": wv["days_logged"],
            "top_theme": top_focus,
            "focus_scores": scores,
            "key_achievements": achievements[:5],
            "next_actions": upcoming[:5]
        }
        
    return final_monthly, final_weekly

monthly, weekly = analyze()
print("Monthly sample keys:", list(monthly.keys()))
print("Weekly sample:", list(weekly.keys())[:3])
