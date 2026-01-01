;======================================================
; ep01_thermal.ks
; Ep01「★はじまりの階段★」＋ サーマル解放システム
; 使い方：
;  1) ティラノビルダーのシナリオに新規.ksを作成し、この内容を貼付
;  2) 画像/BGMは下部のプレースホルダ名を手元のアセットに合わせて差し替え
;  3) プレイ中に T キー or 画面右上ボタンで「情報庫」を開閉
;======================================================

;-----------------------
; JSユーティリティ定義
;-----------------------
[iscript]
(function(){
  // 永続辞書（セーブに保存され、周回でも維持したいなら sf を使用）
  if(!sf.thermal_terms){ sf.thermal_terms = {}; }

  // 初期マスタ（Ep01で登場）
  window.THERMAL_MASTER = {
    term_gloria_test:  {name:"《グローリアテスト》",desc:"十歳以上の子ども全員が受ける国家試験。学力・魔力量・倫理が審査され、階級が変わる。",stage:1},
    term_meritocracia: {name:"メリトクラシア",desc:"実力主義国家。能力と成果のみで身分が決まる。生まれや家柄は「言い訳」とされる。",stage:1},
    term_unfaehig:     {name:"ウンフェーイグ",desc:"最下層階級。字義は“役立たず”。蔑称としても機能する。",stage:1},
    phrase_motto:      {name:"合言葉「目を上げろ、迷子になるな」",desc:"ジェイドの心の指針。恐怖を抑え、希望を忘れないための言葉。",stage:1},
    term_paria:        {name:"パリア",desc:"準奴隷階級。社会的保護を失った者たち。名を奪われ番号で管理される。",stage:1},
    term_number_system:{name:"番号制度",desc:"名前を奪われた者を番号で識別する制度。人格と尊厳の象徴的剥奪。",stage:1},
    term_nobility:     {name:"貴族階級",desc:"上位階級。試験を通じ地位と名誉を維持する。",stage:1},
    term_black_examiner:{name:"黒衣の試験官",desc:"無表情な監視者。測定・倫理の進行役。のちの監察部局に通じる存在。",stage:1},
    term_magic_stone:  {name:"透明鉱石",desc:"魔力量測定装置。手を触れると反応し、魔力の安定値を可視化する。",stage:1},
    term_magic_measurement:{name:"魔力量測定",desc:"グローリアテストの一部。魔力を測り、異常値や封印兆候を検知する。",stage:1},
    term_ethics_exam:  {name:"倫理試問",desc:"判断基準・道徳性を測定する試験。回答は記録・監察される。",stage:1},
    term_vow:          {name:"誓い",desc:"“名前を奪われない”という決意。ジェイドの覚醒と物語の出発点。",stage:1}
  };

  // 画面右上に「情報庫」ボタン（必要ならCSS調整）
  function ensureCodexButton(){
    if($("#codex_btn").length) return;
    var $btn=$('<div id="codex_btn" style="position:fixed;top:16px;right:16px;z-index:9999;background:#0008;color:#fff;padding:8px 12px;border-radius:8px;cursor:pointer;font-size:14px;">情報庫</div>');
    $btn.on("click", function(){ openCodex(); });
    $(".tyrano_base").append($btn);
  }

  // トースト通知
  function toast(msg){
    var id="thermal_toast";
    $("#"+id).remove();
    var $t=$('<div id="'+id+'" style="position:fixed;top:10%;left:50%;transform:translateX(-50%);z-index:9999;background:#000C;color:#fff;padding:12px 16px;border-radius:12px;font-size:18px;opacity:0;">'+msg+'</div>');
    $(".tyrano_base").append($t);
    $t.animate({opacity:1},150,function(){
      setTimeout(function(){ $t.animate({opacity:0},200,function(){ $t.remove(); }); }, 1600);
    });
  }

  // 解放/更新API
  window.unlockTerm = function(id, opt){
    var base = window.THERMAL_MASTER[id] || {name:id,desc:"",stage:1};
    var cur  = sf.thermal_terms[id];
    var name = (opt && opt.name) || base.name;
    var desc = (opt && opt.desc) || base.desc;
    var stage= (opt && opt.stage!=null) ? opt.stage : (cur?cur.stage:(base.stage||1));

    if(!cur){
      sf.thermal_terms[id] = {name:name,desc:desc,stage:stage};
      toast("新規データ解放："+name);
    }else{
      var updated=false;
      if(stage>cur.stage){ cur.stage=stage; updated=true; }
      if(desc && desc!==cur.desc){ cur.desc=desc; updated=true; }
      if(name && name!==cur.name){ cur.name=name; updated=true; }
      if(updated){ toast("データ更新："+(cur.name||name)); }
      sf.thermal_terms[id]=cur;
    }
  };

  // 図鑑UI
  window.openCodex = function(){
    if($("#thermal_codex").length){ $("#thermal_codex").remove(); return; }
    var $bg=$('<div id="thermal_codex" style="position:fixed;inset:0;background:#0009;z-index:9998;"></div>');
    var $panel=$('<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:1000px;height:620px;background:#111;border-radius:16px;color:#fff;padding:16px;box-shadow:0 8px 24px #000;"></div>');
    var $title=$('<div style="font-size:24px;margin-bottom:8px;">情報庫 / サーマル・アーカイブ</div>');
    var $wrap=$('<div style="display:flex;gap:16px;height:520px;"></div>');
    var $list=$('<div style="width:360px;height:100%;overflow:auto;background:#1b1b1b;border-radius:10px;padding:8px;"></div>');
    var $detail=$('<div style="flex:1;height:100%;overflow:auto;background:#1b1b1b;border-radius:10px;padding:16px;"></div>');
    var $close=$('<div style="position:absolute;right:16px;bottom:12px;background:#444;padding:8px 14px;border-radius:8px;cursor:pointer;">閉じる</div>');
    $close.on("click",function(){ $("#thermal_codex").remove(); });

    // ソートして項目生成
    var entries = Object.entries(sf.thermal_terms).sort(function(a,b){
      return (a[1].name||"").localeCompare(b[1].name||"","ja");
    });

    entries.forEach(function([id,term],i){
      var $row=$('<div style="padding:8px;border-bottom:1px solid #333;cursor:pointer;">'+(term.name||id)+'</div>');
      $row.on("click",function(){
        $detail.html(
          '<div style="font-size:22px;margin-bottom:6px;">'+(term.name||id)+'</div>'+
          '<div style="color:#aaa;margin-bottom:8px;">Stage: '+(term.stage||1)+'</div>'+
          '<div style="font-size:18px;line-height:1.7;">'+(term.desc||"")+'</div>'
        );
      });
      if(i===0){ setTimeout(function(){ $row.click(); },0); }
      $list.append($row);
    });

    if(entries.length===0){
      $detail.html('<div style="font-size:18px;opacity:.8;">未解放のデータ。物語を進めてください。</div>');
    }

    $panel.append($title,$wrap,$close);
    $wrap.append($list,$detail);
    $bg.append($panel);
    $(".tyrano_base").append($bg);
  };

  // Tキーで開閉
  document.addEventListener("keydown", function(e){
    if(e.key==="t"||e.key==="T"){ openCodex(); }
  });

  // 右上ボタン保証
  setTimeout(ensureCodexButton, 600);
})();
[endscript]

;-----------------------
; マクロ（解放／更新）
;-----------------------
[macro name="THERMAL_UNLOCK" id="" name="" desc="" stage=""]
[iscript]
  unlockTerm("{id}", {
    name: "{name}",
    desc: "{desc}",
    stage: ("{stage}"===""? null : Number("{stage}"))
  });
[endscript]
[endmacro]

;======================================================
; ここから Ep01 本編
;======================================================
*ep01

;---- 背景・BGM（置き換え推奨） ----
; [bg storage="bg_tower_morning.jpg" time=800]
; [playbgm storage="bgm_intro01.ogg" loop=true]

「オレの名前はジェイド・レオンハルト。十歳だ。」
「今朝の光はやたら眩しいのに、胸の奥は鉛を流し込まれたみたいに重かった。」

「なんでかって？　今日は《グローリアテスト》の日だから。」
[THERMAL_UNLOCK id="term_gloria_test"]

「ここは実力主義国家――メリトクラシア。」
[THERMAL_UNLOCK id="term_meritocracia"]

「オレは平民階級……ウンフェーイグ。意味は“役立たず”。」
[THERMAL_UNLOCK id="term_unfaehig"]

「……目を上げろ、迷子になるな。」
[THERMAL_UNLOCK id="phrase_motto"]

;---- 石段シーン ----
; [bg storage="bg_stairs.jpg" time=600]
「古い学舎へ続く石段を上る。掌に夜の冷たさが残っていた。」
「背後から軽い足音――灰色の紋章を下げた少女。」

; [chara_show storage="fran.png" name="フラン" time=300]
「……フラン。」

「胸元の灰色は“パリア”。名を奪われ、番号で管理される準奴隷階級。」
[THERMAL_UNLOCK id="term_paria"]
[THERMAL_UNLOCK id="term_number_system"]

; [chara_show storage="leinart.png" name="ライナルト" time=300]
「お前まで落ちるなよ。パリアになったら、もう誰も名前なんか呼ばない。番号は覚えやすいらしいけどな。」
[THERMAL_UNLOCK id="term_nobility"]

「……ふざけんな。」
「（絶対に、名前を手放さない）」

;---- 試験会場 ----
; [bg storage="bg_exam_hall.jpg" time=600]
「灰色の扉を押し開けると、冷たい空気。机の列。黒衣の試験官が視線を向けた気がした。」
; [chara_show storage="black_examiner.png" name="試験官" time=200]
[THERMAL_UNLOCK id="term_black_examiner"]

「基礎学力を終え、魔力量測定へ。透明の鉱石に手を触れる。」
[THERMAL_UNLOCK id="term_magic_stone"]
「あたたかさが逆流し、やがて白に落ち着く。中等、安定値。異常なし。」
[THERMAL_UNLOCK id="term_magic_measurement"]

「隣の試験官が何かを囁く。空気が粘るように重くなる。」
[THERMAL_UNLOCK id="term_black_examiner" desc="無表情な監視者。測定・倫理の進行役であり、受験者の“観測と記録”を担う。のちの監察部局に通じる存在。" stage="2"]

;---- 倫理試問（選択肢） ----
; [bg storage="bg_exam_room.jpg" time=400]
「最後の試験は、倫理の問答だった。」
[THERMAL_UNLOCK id="term_ethics_exam"]
「試験官『飢えた子を救うために、罪を犯すことは正しいか？』」

[select]
  "正しい。誰かを救うためなら。":*ans1
  "正しくない。でも、見捨てたくない。":*ans2
  "答えられない。":*ans3
[endselect]

*ans1
「正しいかどうかなんて、オレにはわかんない。でも……見捨てるより、叱られる方を選ぶ。」
[jump target="after_ethics"]

*ans2
「正しくない……でも、目の前で泣いてる子を見捨てるより、叱られる方を選ぶ。」
[jump target="after_ethics"]

*ans3
「……今は答えられない。でも、逃げない。」
[jump target="after_ethics"]

*after_ethics
「黒衣の視線がまた刺さる。記録されている。オレの全てが。」

;---- 夕暮れの誓い ----
; [bg storage="bg_tower_evening.jpg" time=800]
; [playbgm storage="steps_of_merit.ogg" loop=true]
「日が傾き、塔の影が街を覆っていく。」
「選ばれるのを待ってるだけじゃ、一生番号に続く階段だ。だから――登る。自分で。」
[THERMAL_UNLOCK id="term_number_system" desc="番号は“支配”の象徴。だがジェイドにとっては“超えるべき壁”となった。" stage="2"]

「……目を上げろ、迷子になるな。」
「踊り場の奥、黒い袖口がそっと引いた。誰かが見ていた。」

[THERMAL_UNLOCK id="term_vow"]

「ジェイド・レオンハルト。番号じゃない。これが、オレの最初の誓いだ。」

; ヒント：Tキー または 右上「情報庫」で図鑑を確認できます
; ここでエピソード終了 or 次話へジャンプ
; [jump storage="ep02.ks" target="ep02"]

;======================================================
; アセットのプレースホルダ（差し替え推奨）
;  bg_tower_morning.jpg / bg_stairs.jpg / bg_exam_hall.jpg / bg_exam_room.jpg / bg_tower_evening.jpg
;  bgm_intro01.ogg / steps_of_merit.ogg
;  fran.png / leinart.png / black_examiner.png
;======================================================
