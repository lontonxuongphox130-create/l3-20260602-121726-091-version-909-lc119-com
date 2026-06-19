
(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.from((scope || document).querySelectorAll(selector));
  }

  function initMobileMenu() {
    var button = qs('[data-menu-button]');
    var nav = qs('[data-main-nav]');

    if (!button || !nav) {
      return;
    }

    button.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function initHero() {
    var slides = qsa('[data-hero-slide]');
    var dots = qsa('[data-hero-dot]');

    if (slides.length <= 1) {
      return;
    }

    var index = 0;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('active', itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('active', itemIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
      });
    });

    show(0);
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initFilters() {
    var panels = qsa('[data-filter-panel]');

    panels.forEach(function (panel) {
      var scopeSelector = panel.getAttribute('data-filter-panel');
      var scope = qs(scopeSelector);
      var cards = scope ? qsa('[data-title]', scope) : [];
      var keyword = qs('[data-filter-keyword]', panel);
      var year = qs('[data-filter-year]', panel);
      var region = qs('[data-filter-region]', panel);
      var reset = qs('[data-filter-reset]', panel);
      var empty = qs('[data-empty-message]');

      function applyFilter() {
        var kw = normalize(keyword && keyword.value);
        var selectedYear = normalize(year && year.value);
        var selectedRegion = normalize(region && region.value);
        var visibleCount = 0;

        cards.forEach(function (card) {
          var text = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.genre,
            card.dataset.year
          ].join(' '));
          var yearOk = !selectedYear || normalize(card.dataset.year) === selectedYear;
          var regionOk = !selectedRegion || normalize(card.dataset.region) === selectedRegion;
          var keywordOk = !kw || text.indexOf(kw) !== -1;
          var visible = yearOk && regionOk && keywordOk;

          card.style.display = visible ? '' : 'none';
          if (visible) {
            visibleCount += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('visible', visibleCount === 0);
        }
      }

      [keyword, year, region].forEach(function (control) {
        if (control) {
          control.addEventListener('input', applyFilter);
          control.addEventListener('change', applyFilter);
        }
      });

      if (reset) {
        reset.addEventListener('click', function () {
          if (keyword) keyword.value = '';
          if (year) year.value = '';
          if (region) region.value = '';
          applyFilter();
        });
      }

      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q && keyword) {
        keyword.value = q;
      }
      applyFilter();
    });
  }

  function initPlayers() {
    qsa('[data-player]').forEach(function (box) {
      var video = qs('video', box);
      var overlay = qs('[data-play-overlay]', box);
      var button = qs('[data-play-button]', box);
      var source = box.getAttribute('data-source');
      var hlsInstance = null;

      function startPlayer() {
        if (!video || !source) {
          if (overlay) {
            overlay.innerHTML = '<p class="player-note">当前详情页暂无可用播放源</p>';
          }
          return;
        }

        if (overlay) {
          overlay.classList.add('hidden');
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.play().catch(function () {});
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          if (!hlsInstance) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
          }

          video.play().catch(function () {});
          return;
        }

        video.src = source;
        video.play().catch(function () {});
      }

      if (button) {
        button.addEventListener('click', startPlayer);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHero();
    initFilters();
    initPlayers();
  });
}());
