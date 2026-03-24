#!/bin/bash

# === 設定 ===
VIEWER_DIR="$HOME/DOCS/meritocracia-team-share/docs/viewer"
OUTPUT="$VIEWER_DIR/index.json"

# === 初期化 ===
echo "{" > "$OUTPUT"
echo '  "reports": [' >> "$OUTPUT"

FIRST=1

# === 日報探索 ===
BASE_DIR="$HOME/DOCS/ドキュメント/meritocracia-complete/docs/日報"

find "$BASE_DIR" -type f -name "日報_*.md"| sort | while read FILE; do
  DATE=$(basename $(dirname "$FILE"))
  NAME=$(basename "$FILE")

  if [ $FIRST -eq 0 ]; then
    echo "," >> "$OUTPUT"
  fi

  echo "    {" >> "$OUTPUT"
  echo "      \"date\": \"$DATE\"," >> "$OUTPUT"
  echo "      \"file\": \"$NAME\"" >> "$OUTPUT"
  echo -n "    }" >> "$OUTPUT"

  FIRST=0
done

echo "" >> "$OUTPUT"
echo "  ]" >> "$OUTPUT"
echo "}" >> "$OUTPUT"

echo "✅ index.json 生成完了: $OUTPUT"