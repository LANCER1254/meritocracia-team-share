#!/usr/bin/env bash
# ============================================
# Meritocracia 設定Wiki Viewer (bat version)
# - 追加インストール不要（batは既存）
# - ターミナル表示のみ
# ============================================

BASE_DIR="$HOME/DOCS/meritocracia-team-share/docs/settings/Meritocracia_Data_Hub/01_世界観・設定_Wiki"

cd "$BASE_DIR" || exit 1

FILE=$(find . -type f -name "*.md" | sed 's|^\./||' | sort | fzf)

[ -z "$FILE" ] && exit 0

bat --style=plain --paging=always "$FILE"