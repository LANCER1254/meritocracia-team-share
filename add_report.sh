#!/bin/bash

INDEX_FILE="$HOME/DOCS/meritocracia-team-share/docs/viewer/index.json"

DATE="$1"
FILE="$2"

if [ -z "$DATE" ] || [ -z "$FILE" ]; then
  echo "使い方: add_report YYYY-MM-DD ファイル名.md"
  exit 1
fi

# jqが必要
if ! command -v jq &> /dev/null; then
  echo "jqが必要です"
  exit 1
fi

# 追加処理
TMP_FILE=$(mktemp)

jq --arg date "$DATE" --arg file "$FILE" '
  .reports += [{"date": $date, "file": $file}]
' "$INDEX_FILE" > "$TMP_FILE" && mv "$TMP_FILE" "$INDEX_FILE"

echo "追加完了: $DATE / $FILE"
