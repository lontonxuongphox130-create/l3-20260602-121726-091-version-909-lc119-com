(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = qs('.menu-toggle');
  var mobilePanel = qs('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var expanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!expanded));
      mobilePanel.hidden = expanded;
      menuButton.textContent = expanded ? '☰' : '×';
    });
  }

  var slider = qs('[data-hero-slider]');

  if (slider) {
    var slides = qsa('.hero-slide', slider);
    var dots = qsa('.hero-dots button', slider);
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var searchInput = qs('#search-input');
  var categoryFilter = qs('#category-filter');
  var results = qsa('.movie-card[data-search]');
  var emptyResult = qs('#empty-result');
  var searchTitle = qs('#search-title');

  if (searchInput && results.length) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    searchInput.value = initialQuery;

    function applySearch() {
      var query = searchInput.value.trim().toLowerCase();
      var category = categoryFilter ? categoryFilter.value : 'all';
      var visible = 0;

      results.forEach(function (card) {
        var text = card.getAttribute('data-search') || '';
        var cardCategory = card.getAttribute('data-category') || '';
        var matchText = !query || text.indexOf(query) !== -1;
        var matchCategory = category === 'all' || cardCategory === category;
        var match = matchText && matchCategory;
        card.hidden = !match;

        if (match) {
          visible += 1;
        }
      });

      if (emptyResult) {
        emptyResult.hidden = visible !== 0;
      }

      if (searchTitle) {
        searchTitle.textContent = query ? '搜索结果' : '片库结果';
      }
    }

    searchInput.addEventListener('input', applySearch);

    if (categoryFilter) {
      categoryFilter.addEventListener('change', applySearch);
    }

    applySearch();
  }

  var video = qs('#movie-video');
  var overlay = qs('#player-overlay');

  if (video) {
    var stream = video.getAttribute('data-stream');

    if (stream) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(stream);
        hls.attachMedia(video);
      }
    }

    function startVideo() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      var playResult = video.play();

      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', startVideo);
    }

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
  }
})();
