#!/usr/bin/env bash
# ============================================
# Meritocracia 設定Wiki Viewer (Terminal only)
# - fzfでMarkdown選択
# - lessでターミナル表示
# - 追加コマンド不要
# ============================================

BASE_DIR="$HOME/DOCS/meritocracia-team-share/docs/settings/Meritocracia_Data_Hub/01_世界観・設定_Wiki"

cd "$BASE_DIR" || exit 1

FILE=$(find . -type f -name "*.md" | sed 's|^\./||' | sort | fzf)

[ -z "$FILE" ] && exit 0

# -S : 折り返ししない
# -R : 色コードをそのまま
less -SR "$FILE"