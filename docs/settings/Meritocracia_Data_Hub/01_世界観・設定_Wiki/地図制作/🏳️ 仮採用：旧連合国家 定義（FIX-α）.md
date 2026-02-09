🏳️ 仮採用：旧連合国家 定義（FIX-α）

名称（仮）
ユナイト・アルカディア連合王国
United Kingdom of Arcadia

モデル
United Kingdom（UK）

位置づけ

アルカディア＝大陸名／文化圏名

複数王国・自治領の連合王国

表向きは対等、実態は中核偏重

🧭 構成地域（UK対応）
UK	アルカディア連合
England	メリトクラシア（中核・制度供給）
Scotland	ノルドリア（北方・独自文化）
Wales	ウェルン（山岳・小国）
Ireland	アイル系小国（外縁・宗教色）

メリトクラシア＝連合の中枢
→ 行政・試験・軍制の“雛形”を担っていた

だから独立後も国家機能が即座に自走できた

🧩 独立の扱い（次で決めるポイント）

※今回は未確定でOK、地図作成に進める

条約破棄（法的独立）

事実上の追放（制度思想が危険視）

双方合意の分離（名目）

🛠 CLI向け 仮ID（そのまま使える）
old_federation:
  id: ARCADIA_UK
  name: United Kingdom of Arcadia
  status: dissolved_for_meritocracia

regions:
  - id: MERITOCRACIA_CORE   # England
  - id: NORDRIA            # Scotland
  - id: WERUN              # Wales
  - id: AIL_REGION         # Ireland


このまま行こう。
次は自然に「メリトクラシア＝連合中核だった証拠」を地図に落とす段階。

続けるなら次のどれにする？

メリトクラシア本土リージョン定義

旧連合時代の首都／行政軸

独立後に引き直された国境線

合図くれたら即そこから詰める。

１

了解。
じゃあ ① メリトクラシア本土リージョン定義 を、
CLIでそのまま扱えるレベルまで落とすね。
（※あとから拡張・改名・分割できる前提）

🧭 リージョン定義方針（前提）

スコープ：旧アルカディア連合時代の中核＝Englandポジション

役割：

行政・制度・試験の雛形

人材供給の中心

地図思想：

「整いすぎている」

川・街道・都市配置が合理的

だからこそ、独立後の“監視国家”に進化できた

📍 リージョン概要（物語×地図）

リージョン名（仮）
メリトクラシア本土（Meritocracia Core）

性格

平原主体

大河あり（物流・行政動線）

海にも面している（連合時代の交易）

物語的意味

ジェイドが生まれ育った「制度の中心」

アイリスが最初に触れた“整った世界”

正しさが一番強い土地

🛠 CLI用：リージョン定義（初期版）
data/regions/region_meritocracia_core.yaml
region:
  id: MERITOCRACIA_CORE
  name: メリトクラシア本土
  role: former_federation_core
  model: england
  status: independent_state

coordinate:
  offset: [0, 0]
  scale: km

terrain:
  base: plain
  features:
    - river_major
    - gentle_hills
    - coastline

cities:
  capital:
    id: MERIT_CAPITAL
    name: メリトクラシア首都
    type: capital
    tags: [administration, trial_system, academy]

  majors:
    - id: ACADEMY_CITY
      name: 学院都市
      type: education
      tags: [gloria_test, youth, monitoring]

    - id: PORT_CITY
      name: 港湾都市
      type: trade
      tags: [old_federation_trade]

  locals:
    - id: BORDER_TOWN
      name: 境界街
      type: town
      tags: [checkpoint]

roads:
  - from: MERIT_CAPITAL
    to: ACADEMY_CITY
    type: paved
    role: administration

  - from: MERIT_CAPITAL
    to: PORT_CITY
    type: highway
    role: trade

institutions:
  - id: INQUISITION_HQ
    name: 審問庁本庁
    located_in: MERIT_CAPITAL

  - id: CENTRAL_ACADEMY
    name: 中央士官学校
    located_in: ACADEMY_CITY

history:
  former_affiliation: ARCADIA_UK
  independence_type: pending

🧠 この定義でできること

まずここだけで map.html を生成可能

あとから

ノルドリアを北側に offset: [0, 180]

ウェルンを西側に offset: [-140, 40]

旧連合時代の

街道

港

行政軸
も タグで可視化できる