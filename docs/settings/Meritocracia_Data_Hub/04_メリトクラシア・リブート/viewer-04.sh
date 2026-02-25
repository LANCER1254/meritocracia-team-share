#!/usr/bin/env bash
# ==========================================
# 📖 04_メリトクラシア・リブート Viewer
# ==========================================

BASE_DIR="$(cd "$(dirname "$0")" && pwd)"

while true; do
  clear
  echo "==============================="
  echo "📖 メリトクラシア・リブート"
  echo "==============================="
  echo "1) 📘 本編を見る"
  echo "2) 🗂 プロットを見る（準備中）"
  echo "3) 🌐 投稿用原稿を見る（準備中）"
  echo "q) 戻る"
  echo "==============================="
  read -p "選択: " choice

  case "$choice" in
    1)
      if [ -x "$BASE_DIR/viewer-main.sh" ]; then
        bash "$BASE_DIR/viewer-main.sh"
      else
        echo "❌ 本編ビューアが見つかりません"
        read -p "Enterで戻る..."
      fi
      ;;
    2)
      echo "🗂 プロットビューアは次工程で実装予定"
      read -p "Enterで戻る..."
      ;;
    3)
      echo "🌐 投稿用原稿ビューアは次工程で実装予定"
      read -p "Enterで戻る..."
      ;;
    q)
      break
      ;;
    *)
      continue
      ;;
  esac
done