/* ============================================================
   Letter from Iris — letter.js
   review.json を fetch して DOM に流し込む
   ============================================================ */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
    fetch('./review.json')
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        })
        .then(data => {
            /* 基本情報 */
            document.getElementById('recipient').textContent  = data.recipient;
            document.getElementById('intro-text').innerText   = data.intro;
            document.getElementById('tea-name').textContent   = data.tea_service;
            document.getElementById('read-count').textContent = data.read_count;
            document.getElementById('review-summary').textContent = data.summary;
            document.getElementById('sign-name').textContent  = data.sign;

            /* 本文段落生成 */
            const body = document.getElementById('letter-body');
            data.body.forEach(paragraph => {
                const p = document.createElement('p');
                p.textContent = paragraph;
                body.appendChild(p);
            });

            /* フェードイン（Gemini版と同じ挙動） */
            setTimeout(() => {
                document.getElementById('container').style.opacity = '1';
            }, 100);
        })
        .catch(err => {
            console.error('[Letter from Iris] 読み込みエラー:', err);
            document.body.innerHTML =
                `<p style="color:#c8a050;text-align:center;padding:60px 20px;font-family:serif;">
                    お手紙を読み込めませんでした<br><small>${err.message}</small>
                </p>`;
        });
});
