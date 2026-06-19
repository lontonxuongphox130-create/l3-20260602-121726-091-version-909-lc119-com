(function () {
  const menuButton = document.querySelector('[data-menu-toggle="true"]');
  const mobilePanel = document.querySelector('[data-mobile-panel="true"]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide="true"]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  let heroIndex = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, position) {
      slide.classList.toggle('active', position === heroIndex);
    });
    dots.forEach(function (dot, position) {
      dot.classList.toggle('active', position === heroIndex);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(heroIndex + 1);
    }, 5200);
  }

  const params = new URLSearchParams(window.location.search);
  const queryFromUrl = params.get('q') || '';
  const searchInput = document.querySelector('[data-search-input="true"]');
  const regionSelect = document.querySelector('[data-region-select="true"]');
  const typeSelect = document.querySelector('[data-type-select="true"]');
  const searchGrid = document.querySelector('[data-search-grid="true"]');
  const resultCount = document.querySelector('[data-result-count="true"]');

  function normalizeText(value) {
    return String(value || '').trim().toLowerCase();
  }

  function runSearch() {
    if (!searchGrid) {
      return;
    }

    const cards = Array.from(searchGrid.querySelectorAll('.movie-card'));
    const keyword = normalizeText(searchInput ? searchInput.value : '');
    const region = regionSelect ? regionSelect.value : '';
    const type = typeSelect ? typeSelect.value : '';
    let shown = 0;

    cards.forEach(function (card) {
      const text = normalizeText([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-tags')
      ].join(' '));
      const regionOk = !region || card.getAttribute('data-region') === region;
      const typeOk = !type || card.getAttribute('data-type') === type;
      const keywordOk = !keyword || text.indexOf(keyword) !== -1;
      const visible = regionOk && typeOk && keywordOk;

      card.classList.toggle('hidden-card', !visible);
      if (visible) {
        shown += 1;
      }
    });

    if (resultCount) {
      resultCount.textContent = String(shown);
    }
  }

  if (searchInput) {
    searchInput.value = queryFromUrl;
    searchInput.addEventListener('input', runSearch);
  }

  if (regionSelect) {
    regionSelect.addEventListener('change', runSearch);
  }

  if (typeSelect) {
    typeSelect.addEventListener('change', runSearch);
  }

  runSearch();

  const yearButtons = Array.from(document.querySelectorAll('[data-year-filter]'));
  const filterGrid = document.querySelector('[data-filter-grid="true"]');

  yearButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      const year = button.getAttribute('data-year-filter');
      yearButtons.forEach(function (item) {
        item.classList.toggle('active', item === button);
      });

      if (!filterGrid) {
        return;
      }

      Array.from(filterGrid.querySelectorAll('.movie-card')).forEach(function (card) {
        const visible = year === 'all' || card.getAttribute('data-year') === year;
        card.classList.toggle('hidden-card', !visible);
      });
    });
  });

  function startPlayer(box) {
    const video = box.querySelector('video');
    if (!video) {
      return;
    }

    const streamUrl = video.getAttribute('data-hls-url');
    if (!streamUrl) {
      return;
    }

    box.classList.add('playing');

    if (window.Hls && window.Hls.isSupported()) {
      if (video.hlsController) {
        video.hlsController.destroy();
      }

      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      video.hlsController = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
    } else {
      video.src = streamUrl;
      video.play().catch(function () {});
    }
  }

  Array.from(document.querySelectorAll('[data-player-box="true"]')).forEach(function (box) {
    const button = box.querySelector('[data-play-button="true"]');
    if (button) {
      button.addEventListener('click', function () {
        startPlayer(box);
      });
    }
  });
})();
