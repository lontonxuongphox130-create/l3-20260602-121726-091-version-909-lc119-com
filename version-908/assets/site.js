(function () {
    var toggle = document.querySelector(".nav-toggle");
    var panel = document.querySelector(".mobile-panel");

    if (toggle && panel) {
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var current = 0;

    function setSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle("is-active", i === current);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle("is-active", i === current);
        });
    }

    dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
            setSlide(i);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            setSlide(current + 1);
        }, 5200);
    }

    var search = document.querySelector(".site-search");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));

    function applyFilter(extra) {
        var q = search ? search.value.trim().toLowerCase() : "";
        var f = (extra || "").toLowerCase();

        cards.forEach(function (card) {
            var hay = [
                card.getAttribute("data-title"),
                card.getAttribute("data-year"),
                card.getAttribute("data-region"),
                card.getAttribute("data-category"),
                card.getAttribute("data-tags"),
                card.textContent
            ].join(" ").toLowerCase();
            var ok = (!q || hay.indexOf(q) !== -1) && (!f || hay.indexOf(f) !== -1);
            card.classList.toggle("is-hidden", !ok);
        });
    }

    if (search) {
        search.addEventListener("input", function () {
            applyFilter("");
        });
    }

    filterButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            var value = button.getAttribute("data-filter") || "";
            if (search) {
                search.value = value;
            }
            applyFilter(value);
        });
    });

    window.mountVideo = function (source) {
        var frame = document.querySelector(".player-frame");
        var video = document.querySelector("[data-video-player]");
        var cover = document.querySelector(".player-cover");
        var button = document.querySelector(".player-button");

        if (!frame || !video || !source) {
            return;
        }

        function bind() {
            if (video.getAttribute("data-ready") === "1") {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }

            video.setAttribute("data-ready", "1");
        }

        function start() {
            bind();
            frame.classList.add("is-playing");
            video.controls = true;
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener("click", start);
        }

        if (button) {
            button.addEventListener("click", start);
        }

        video.addEventListener("click", function () {
            if (video.getAttribute("data-ready") !== "1") {
                start();
            }
        });
    };
})();
