(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = qs('.menu-toggle');
    var panel = qs('.mobile-panel');
    if (!button || !panel) return;
    button.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) return;
    var slides = qsa('.hero-slide', hero);
    var dots = qsa('.hero-dot', hero);
    if (!slides.length) return;
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === active);
      });
    }

    function autoplay() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        autoplay();
      });
    });

    show(0);
    autoplay();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initFilters() {
    var input = qs('.card-filter');
    var year = qs('.filter-year');
    var region = qs('.filter-region');
    var cards = qsa('.movie-card');
    if (!cards.length || (!input && !year && !region)) return;

    if (year && year.options.length <= 1) {
      var years = [];
      cards.forEach(function (card) {
        var value = card.getAttribute('data-year') || '';
        if (value && years.indexOf(value) === -1) years.push(value);
      });
      years.sort().reverse().forEach(function (value) {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        year.appendChild(option);
      });
    }

    if (region && region.options.length <= 1) {
      var regions = [];
      cards.forEach(function (card) {
        var value = card.getAttribute('data-region') || '';
        if (value && regions.indexOf(value) === -1) regions.push(value);
      });
      regions.sort().forEach(function (value) {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        region.appendChild(option);
      });
    }

    function apply() {
      var q = normalize(input ? input.value : '');
      var y = year ? year.value : '';
      var r = region ? region.value : '';
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-tags'),
          card.textContent
        ].join(' '));
        var matchText = !q || haystack.indexOf(q) !== -1;
        var matchYear = !y || card.getAttribute('data-year') === y;
        var matchRegion = !r || card.getAttribute('data-region') === r;
        card.classList.toggle('hidden', !(matchText && matchYear && matchRegion));
      });
    }

    if (input) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) input.value = q;
      input.addEventListener('input', apply);
    }
    if (year) year.addEventListener('change', apply);
    if (region) region.addEventListener('change', apply);
    apply();
  }

  function attachStream(video, url) {
    if (!video || !url) return;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        maxBufferLength: 28,
        enableWorker: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      return;
    }
    video.src = url;
  }

  window.initPlayer = function (url) {
    function ready() {
      var frame = qs('.player-frame');
      var video = qs('.movie-video');
      var button = qs('.play-layer');
      var loaded = false;
      if (!frame || !video) return;

      function play() {
        if (!loaded) {
          attachStream(video, url);
          loaded = true;
        }
        frame.classList.add('playing');
        video.setAttribute('controls', 'controls');
        var attempt = video.play();
        if (attempt && attempt.catch) attempt.catch(function () {});
      }

      if (button) button.addEventListener('click', play);
      video.addEventListener('click', function () {
        if (!loaded) play();
      });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', ready);
    } else {
      ready();
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
