import os
import re
import json
from collections import defaultdict
from pathlib import Path

TARGET_DIR = "/home/lancer/DOCS/ドキュメント/meritocracia-complete/docs/日報"
OUTPUT_FILE = os.path.join(TARGET_DIR, "worklog_master.json")

date_pattern1 = re.compile(r'202\d-[01]\d-[0-3]\d')
date_pattern2 = re.compile(r'202\d[01]\d[0-3]\d')

def extract_date(filepath, content):
    m = date_pattern1.search(filepath)
    if m: return m.group(0)
    m = date_pattern2.search(filepath)
    if m:
        d = m.group(0)
        return f"{d[:4]}-{d[4:6]}-{d[6:]}"
    for line in content.split('\n'):
        if '日付' in line or '日時' in line:
            m = date_pattern1.search(line)
            if m: return m.group(0)
            m = date_pattern2.search(line)
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
        
        # tag extraction
        # Ignore markdown headers and shebangs
        if not line.startswith('# ') and not line.startswith('#!'):
            # find all tags #something, but exclude standalone #
            tags = re.findall(r'(?<!\S)#([a-zA-Z0-9_\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]+)', line)
            for t in tags:
                if t not in data["tags"]: data["tags"].append(t)
                
        if line.startswith("プロジェクト：") or line.startswith("対象プロジェクト"):
            proj = re.sub(r'^.*?プロジェクト[:：]\s*', '', line).strip()
            if proj and proj not in data["tags"]:
                data["tags"].append(proj)
            
        # Section detection
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
            
        # Collect bullet points
        if current_section and (line.startswith('-') or line.startswith('*') or line.startswith('✅') or line.startswith('🔜') or line.startswith('・')):
            clean_line = re.sub(r'^[-*・✅🔜]\s*', '', line).strip()
            if clean_line and clean_line not in data[current_section]:
                # avoid adding the section header itself as a bullet
                if clean_line not in ['実施した対応', '完了内容', '次回作業名']:
                    data[current_section].append(clean_line)
                
    return data

def main():
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
                rel_path = os.path.relpath(filepath, TARGET_DIR)
                if rel_path not in rec["source_files"]:
                    rec["source_files"].append(rel_path)
                
                for k in ["completed", "updated", "issues", "next_actions", "tags"]:
                    for item in parsed[k]:
                        if item not in rec[k]: 
                            rec[k].append(item)

    # Process index.json just in case there are other files linked there (mostly they should be covered)
    index_path = os.path.join(TARGET_DIR, "index.json")
    if os.path.exists(index_path):
        with open(index_path, 'r', encoding='utf-8') as f:
            try:
                index_data = json.load(f)
                for date, file_list in index_data.items():
                    for file_name in file_list:
                        results[date]["date"] = date
            except json.JSONDecodeError:
                pass

    output = list(results.values())
    output.sort(key=lambda x: x["date"])
    
    # Exclude entries with UNKNOWN_DATE if they have no source files or it's empty
    output = [x for x in output if x["date"] != "UNKNOWN_DATE" or x["source_files"]]

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
        
    print(f"Successfully generated {OUTPUT_FILE} with {len(output)} entries.")

if __name__ == '__main__':
    main()
