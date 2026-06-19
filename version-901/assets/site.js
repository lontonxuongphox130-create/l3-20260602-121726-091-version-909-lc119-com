
(function () {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('mainNav');
    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
    if (slides.length > 0) {
        var current = 0;
        var showSlide = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        };
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                showSlide(i);
            });
        });
        showSlide(0);
        window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function (panel) {
        var input = panel.querySelector('[data-card-search]');
        var buttons = Array.prototype.slice.call(panel.querySelectorAll('[data-filter]'));
        var scope = document.querySelector(panel.getAttribute('data-filter-panel')) || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
        var active = 'all';
        var apply = function () {
            var q = input ? input.value.trim().toLowerCase() : '';
            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-year') || '',
                    card.getAttribute('data-region') || '',
                    card.getAttribute('data-genre') || '',
                    card.textContent || ''
                ].join(' ').toLowerCase();
                var genre = (card.getAttribute('data-genre') || '').toLowerCase();
                var okText = !q || text.indexOf(q) !== -1;
                var okFilter = active === 'all' || genre.indexOf(active) !== -1 || text.indexOf(active) !== -1;
                card.classList.toggle('hidden-card', !(okText && okFilter));
            });
        };
        if (input) {
            input.addEventListener('input', apply);
            var params = new URLSearchParams(window.location.search);
            if (params.get('q')) {
                input.value = params.get('q');
            }
        }
        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                active = button.getAttribute('data-filter') || 'all';
                buttons.forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                apply();
            });
        });
        apply();
    });

    var players = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));
    players.forEach(function (shell) {
        var video = shell.querySelector('video');
        var button = shell.querySelector('.play-cover');
        var src = shell.getAttribute('data-video-src');
        var hlsInstance = null;
        var loaded = false;
        var load = function () {
            if (!video || !src) {
                return;
            }
            if (!loaded) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = src;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls();
                    hlsInstance.loadSource(src);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = src;
                }
                loaded = true;
            }
            if (button) {
                button.classList.add('is-hidden');
            }
            video.controls = true;
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        };
        if (button) {
            button.addEventListener('click', load);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    load();
                }
            });
        }
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
}());
