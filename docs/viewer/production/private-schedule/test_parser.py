import os
import re
import json
from collections import defaultdict

TARGET_DIR = "/home/lancer/DOCS/ドキュメント/meritocracia-complete/docs/日報"

date_pattern1 = re.compile(r'202\d-[01]\d-[0-3]\d')
date_pattern2 = re.compile(r'202\d[01]\d[0-3]\d')

def extract_date(filepath, content):
    m = date_pattern1.search(filepath)
    if m: return m.group(0)
    m = date_pattern2.search(filepath)
    if m:
        d = m.group(0)
        return f"{d[:4]}-{d[4:6]}-{d[6:]}"
    return "UNKNOWN_DATE"

def parse_markdown(content):
    data = {"completed": [], "updated": [], "issues": [], "next_actions": [], "tags": []}
    current_section = None
    
    for line in content.split('\n'):
        line = line.strip()
        if not line: continue
        
        tags = re.findall(r'#([^\s]+)', line)
        for t in tags:
            if t not in data["tags"]: data["tags"].append(t)
        if line.startswith("プロジェクト："):
            data["tags"].append(line.replace("プロジェクト：", "").strip())
            
        if '目的' in line or '対応' in line or '完了' in line or '✅' in line:
            current_section = "completed"
        elif '更新' in line:
            current_section = "updated"
        elif '問題' in line or '🧨' in line or '🔍' in line or '原因' in line:
            current_section = "issues"
        elif '次回' in line or '今後' in line or '🔜' in line or '📌' in line or '予定' in line:
            current_section = "next_actions"
        elif line.startswith('#'):
            current_section = None
            
        if current_section and (line.startswith('-') or line.startswith('*') or line.startswith('✅') or line.startswith('🔜') or line.startswith('・')):
            clean_line = re.sub(r'^[-*・✅🔜]\s*', '', line).strip()
            if clean_line and clean_line not in data[current_section]:
                data[current_section].append(clean_line)
                
    return data

results = defaultdict(lambda: {"date": "", "completed": [], "updated": [], "issues": [], "next_actions": [], "tags": [], "source_files": []})

for root, dirs, files in os.walk(TARGET_DIR):
    for file in files:
        if file.endswith(".md"):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            date = extract_date(filepath, content)
            parsed = parse_markdown(content)
            
            rec = results[date]
            rec["date"] = date
            rec["source_files"].append(os.path.relpath(filepath, TARGET_DIR))
            
            for k in ["completed", "updated", "issues", "next_actions", "tags"]:
                for item in parsed[k]:
                    if item not in rec[k]: rec[k].append(item)

output = list(results.values())
output.sort(key=lambda x: x["date"])
print(json.dumps(output[:2], indent=2, ensure_ascii=False))
