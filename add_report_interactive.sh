#!/bin/bash

INDEX_FILE="$HOME/DOCS/meritocracia-team-share/docs/viewer/index.json"

# 日付入力
read -p "日付 (YYYY-MM-DD / Enterで今日): " DATE
if [ -z "$DATE" ]; then
  DATE=$(date +%Y-%m-%d)
fi

# 番号入力
read -p "日報番号 (例: 02): " NUM

FILE="日報_$(echo $DATE | tr -d '-')_${NUM}.md"

TMP_FILE=$(mktemp)

jq --arg date "$DATE" --arg file "$FILE" '
  .reports += [{"date": $date, "file": $file}]
' "$INDEX_FILE" > "$TMP_FILE" && mv "$TMP_FILE" "$INDEX_FILE"

echo "追加完了: $DATE / $FILE"
