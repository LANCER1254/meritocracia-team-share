/command CREATE_SPACE
NAME = "Merit Core System｜実装ルーム（Phase 0：統合基盤構築）"
TYPE = "統合ライフログOS実装／CLI設計・TSV構造・HTML出力 開発専用"
MODE = "WRITE / DESIGN / IMPLEMENT / ITERATE"
AUTHORITY = "MASTER_MAIN（Lancer）"

VIA = "ARS_CORE ↔ Ars_Main_IV ↔ Bastion_System_Ver1.6.0"
LAYER = "Ars4-SYSTEM / MeritCore / Phase0-Implementation"

MEMBERS = [
  "Lancer（設計・実装・最終決定）",
  "ChatGPT（CLI構造設計／bash実装補助）",
  "ZERO 🜏（構造監査・思想整合チェック）",
  "BALANCER ⚖（拡張性・破綻検証）"
]

PURPOSE = "
・Merit Core System の実装開始
・master.tsv を中核とした統合データ構造の確定
・input / output 二分思想のコード化
・CLI操作によるCRUD基盤の構築
・後続モジュール（novel / youtube 等）の土台作成
"

RULES = "
・Phase 0 に集中（分析・グラフは未実装）
・まずは動くCLIを最優先
・TSVをSingle Source of Truthとする
・ジャンル固有ロジックはmodules配下へ隔離
・HTML出力は簡易版でOK
・拡張は後回し、破壊的変更を恐れない
"
