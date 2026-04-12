/**
 * MERITOCRACIA -REBOOT-  /  ACADEMY WIKI JS
 * 責任: インタラクション・TOC自動追従のみ。
 * 増築: 新セクションは .section[id] を追加するだけで自動対応。
 */
(function () {
  'use strict';

  /* ============================================================
     1. AUTO TOC — セクションを動的に検出し TOC を自動構築・追従
     ============================================================ */
  var tocList = document.getElementById('toc-list');
  var sections = [];

  /**
   * DOM 内の全 .section[id] を走査して TOC を自動生成。
   * data-toc-label 属性があればその文字列を使用、なければ .section-title テキスト。
   * data-toc-stub="true" であればスタブ扱い（薄表示）。
   */
  function buildToc() {
    if (!tocList) return;

    var allSections = document.querySelectorAll('.section[id]');
    sections = [];

    // 既存の手動 li を削除（再構築）
    tocList.innerHTML = '';

    allSections.forEach(function (sec) {
      sections.push(sec);

      var id    = sec.getAttribute('id');
      var label = sec.getAttribute('data-toc-label');
      var isStub = sec.getAttribute('data-toc-stub') === 'true';

      if (!label) {
        var titleEl = sec.querySelector('.section-title');
        label = titleEl ? titleEl.textContent.trim() : id;
      }

      var li = document.createElement('li');
      if (isStub) li.classList.add('toc-stub');

      var a = document.createElement('a');
      a.href = '#' + id;
      a.setAttribute('data-section', id);
      a.textContent = label;

      li.appendChild(a);
      tocList.appendChild(li);
    });
  }

  /* ===== TOC Active Tracking ===== */
  function updateTocActive() {
    var scrollPos = window.scrollY + 130;
    var current = '';

    sections.forEach(function (sec) {
      if (sec.offsetTop <= scrollPos) {
        current = sec.getAttribute('id');
      }
    });

    var tocLinks = tocList ? tocList.querySelectorAll('a') : [];
    tocLinks.forEach(function (link) {
      var isActive = link.getAttribute('data-section') === current;
      link.classList.toggle('active', isActive);

      if (isActive) {
        // 横スクロールで active が見えるよう調整
        var tocInner = document.querySelector('.toc-inner');
        if (tocInner) {
          var linkLeft  = link.offsetLeft;
          var tocWidth  = tocInner.offsetWidth;
          var scrollLeft = tocInner.scrollLeft;
          if (linkLeft < scrollLeft || linkLeft > scrollLeft + tocWidth * 0.7) {
            tocInner.scrollLeft = linkLeft - tocWidth * 0.3;
          }
        }
      }
    });
  }

  /* ============================================================
     2. SCROLL HANDLER（rAF throttle）
     ============================================================ */
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        updateTocActive();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  /* ============================================================
     3. EVALUATION BAR ANIMATION（IntersectionObserver）
     ============================================================ */
  function initEvalBars() {
    var bars = document.querySelectorAll('.eval-bar-fill');
    if (!bars.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var bar = entry.target;
          var w   = bar.getAttribute('data-width') || '0';
          bar.style.width = w + '%';
          observer.unobserve(bar);
        }
      });
    }, { threshold: 0.3 });

    bars.forEach(function (bar) {
      bar.style.width = '0%';
      observer.observe(bar);
    });
  }

  /* ============================================================
     4. COLLAPSIBLE SECTIONS
     ============================================================ */
  function initCollapsibles() {
    var toggles = document.querySelectorAll('.collapsible-toggle');
    toggles.forEach(function (toggle) {
      toggle.addEventListener('click', function () {
        var isOpen = this.classList.contains('open');
        this.classList.toggle('open', !isOpen);
        var content = this.nextElementSibling;
        if (content) content.classList.toggle('open', !isOpen);
      });
    });
  }

  /* ============================================================
     5. SECTION FADE-IN（軽量アニメーション）
     ============================================================ */
  function initSectionFade() {
    var style = document.createElement('style');
    style.textContent = [
      '.section { opacity: 0; transform: translateY(16px); transition: opacity 0.5s ease, transform 0.5s ease; }',
      '.section.visible { opacity: 1; transform: none; }'
    ].join('');
    document.head.appendChild(style);

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.05 });

    document.querySelectorAll('.section').forEach(function (sec) {
      io.observe(sec);
    });
  }

  /* ============================================================
     6. SMOOTH ANCHOR CLICK（TOC リンク）
     ============================================================ */
  function initAnchorSmooth() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;
      var id = link.getAttribute('href').slice(1);
      var target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', '#' + id);
      }
    });
  }

  /* ============================================================
     7. WIKI LAST-UPDATED TIMESTAMP（フッター自動更新）
     ============================================================ */
  function initTimestamp() {
    var el = document.getElementById('wiki-last-updated');
    if (!el) return;
    // data属性から読む（HTMLで上書き可能）
    // <span id="wiki-last-updated" data-date="2026-04-12"></span>
    var d = el.getAttribute('data-date');
    if (d) el.textContent = d;
  }

  /* ============================================================
     8. INIT
     ============================================================ */
  function init() {
    buildToc();
    updateTocActive();
    initEvalBars();
    initCollapsibles();
    initSectionFade();
    initAnchorSmooth();
    initTimestamp();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ============================================================
     Public API（将来の追加モジュール向け）
     例: window.AcademyWiki.rebuildToc() で外部から呼べる
     ============================================================ */
  window.AcademyWiki = {
    rebuildToc: function () {
      buildToc();
      updateTocActive();
    }
  };

})();
