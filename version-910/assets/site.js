(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('open');
        });
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input');
            var query = input ? input.value.trim() : '';
            var target = form.getAttribute('data-target') || 'movies.html';
            var prefix = target.indexOf('?') === -1 ? '?' : '&';
            window.location.href = target + (query ? prefix + 'q=' + encodeURIComponent(query) : '');
        });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === current);
        });
    }

    if (slides.length) {
        showSlide(0);
        document.querySelectorAll('[data-hero-next]').forEach(function (button) {
            button.addEventListener('click', function () {
                showSlide(current + 1);
            });
        });
        document.querySelectorAll('[data-hero-prev]').forEach(function (button) {
            button.addEventListener('click', function () {
                showSlide(current - 1);
            });
        });
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });
        window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var filterWrap = document.querySelector('[data-filter-wrap]');
    if (filterWrap) {
        var searchInput = filterWrap.querySelector('[data-filter-search]');
        var typeSelect = filterWrap.querySelector('[data-filter-type]');
        var yearSelect = filterWrap.querySelector('[data-filter-year]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
        var empty = document.querySelector('[data-empty]');
        var initialQuery = new URLSearchParams(window.location.search).get('q') || '';

        if (searchInput && initialQuery) {
            searchInput.value = initialQuery;
        }

        function matchCard(card) {
            var q = searchInput ? searchInput.value.trim().toLowerCase() : '';
            var t = typeSelect ? typeSelect.value : '';
            var y = yearSelect ? yearSelect.value : '';
            var text = (card.getAttribute('data-text') || '').toLowerCase();
            var type = card.getAttribute('data-type') || '';
            var year = card.getAttribute('data-year') || '';
            return (!q || text.indexOf(q) !== -1) && (!t || type === t) && (!y || year === y);
        }

        function applyFilter() {
            var shown = 0;
            cards.forEach(function (card) {
                var ok = matchCard(card);
                card.style.display = ok ? '' : 'none';
                if (ok) {
                    shown += 1;
                }
            });
            if (empty) {
                empty.style.display = shown ? 'none' : 'block';
            }
        }

        [searchInput, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });

        applyFilter();
    }

    function loadScript(url, done) {
        if (window.Hls) {
            done();
            return;
        }
        var script = document.createElement('script');
        script.src = url;
        script.onload = done;
        script.onerror = done;
        document.head.appendChild(script);
    }

    document.querySelectorAll('[data-player]').forEach(function (box) {
        var video = box.querySelector('video');
        var cover = box.querySelector('[data-play-cover]');
        var src = box.getAttribute('data-src');
        var started = false;

        function start() {
            if (!video || !src || started) {
                return;
            }
            started = true;
            if (cover) {
                cover.style.display = 'none';
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
                video.play().catch(function () {});
                return;
            }

            loadScript('https://cdn.jsdelivr.net/npm/hls.js@latest', function () {
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                } else {
                    video.src = src;
                    video.play().catch(function () {});
                }
            });
        }

        if (cover) {
            cover.addEventListener('click', start);
        }
        if (video) {
            video.addEventListener('play', start, { once: true });
        }
    });
})();
