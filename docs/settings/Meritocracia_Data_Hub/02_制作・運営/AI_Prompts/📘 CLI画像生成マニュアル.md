📘 CLI画像生成マニュアル

（ComfyUI / StableDiffusion）

概要

本環境では GUIを使用せずCLIから画像生成を行う。

生成は

workflow.json
↓
curl
↓
ComfyUI API
↓
StableDiffusion
↓
GPU生成
↓
output保存

の流れで実行される。

環境構成
項目	内容
OS	Linux
GPU	RTX3060
生成エンジン	Stable Diffusion
UIエンジン	ComfyUI
操作方法	CLI
ディレクトリ構成
~/ComfyUI
~/ComfyUI/models/checkpoints
~/ComfyUI/output

~/merit-ai
 └ workflow.json
モデル

使用モデル

dreamshaper_8.safetensors

配置場所

~/ComfyUI/models/checkpoints
生成手順
① ComfyUIサーバー起動
cd ~/ComfyUI
python main.py

API

http://127.0.0.1:8188
② 別ターミナルで作業
cd ~/merit-ai
③ プロンプト編集
code workflow.json

編集箇所

"text": "prompt内容"
④ CLI画像生成
curl -X POST http://127.0.0.1:8188/prompt \
-H "Content-Type: application/json" \
-d '{"prompt": '"$(cat workflow.json)"'}'
⑤ 出力確認
ls ~/ComfyUI/output

例

belphegor_00001_.png
画像保存先
~/ComfyUI/output
サーバー確認
curl http://127.0.0.1:8188/system_stats

正常時はJSONが返る。

注意事項

ComfyUIサーバーが起動していないと生成不可

モデルが checkpoints フォルダに存在する必要あり

workflow.jsonが生成設定となる

用途

本環境は以下用途で利用

キャラクターデザイン資料

衣装デザイン案

世界観ビジュアル参考

制作資料

※本番イラストはイラストレーターへ依頼