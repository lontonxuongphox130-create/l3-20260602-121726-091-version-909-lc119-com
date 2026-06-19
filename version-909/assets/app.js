(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    var slider = document.querySelector("[data-hero-slider]");
    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
      var dotsWrap = slider.querySelector("[data-hero-dots]");
      var dots = dotsWrap ? Array.prototype.slice.call(dotsWrap.querySelectorAll("button")) : [];
      var prev = slider.querySelector("[data-hero-prev]");
      var next = slider.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function showSlide(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }

      function startAuto() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          showSlide(index + 1);
        }, 5600);
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          showSlide(dotIndex);
          startAuto();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          showSlide(index - 1);
          startAuto();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          showSlide(index + 1);
          startAuto();
        });
      }

      showSlide(0);
      startAuto();
    }

    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var scope = panel.closest("section") || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
      var empty = scope.querySelector("[data-empty-state]");
      var search = panel.querySelector("[data-search-input]");
      var year = panel.querySelector("[data-year-filter]");
      var region = panel.querySelector("[data-region-filter]");
      var type = panel.querySelector("[data-type-filter]");

      function normalize(value) {
        return String(value || "").trim().toLowerCase();
      }

      function applyFilters() {
        var query = normalize(search && search.value);
        var yearValue = normalize(year && year.value);
        var regionValue = normalize(region && region.value);
        var typeValue = normalize(type && type.value);
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize([
            card.dataset.title,
            card.dataset.year,
            card.dataset.region,
            card.dataset.type,
            card.dataset.genre
          ].join(" "));
          var matchQuery = !query || text.indexOf(query) !== -1;
          var matchYear = !yearValue || normalize(card.dataset.year) === yearValue;
          var matchRegion = !regionValue || normalize(card.dataset.region).indexOf(regionValue) !== -1;
          var matchType = !typeValue || normalize(card.dataset.type).indexOf(typeValue) !== -1;
          var matched = matchQuery && matchYear && matchRegion && matchType;
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [search, year, region, type].forEach(function (element) {
        if (element) {
          element.addEventListener("input", applyFilters);
          element.addEventListener("change", applyFilters);
        }
      });

      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q");
      if (initialQuery && search) {
        search.value = initialQuery;
      }

      applyFilters();
    });
  });
})();
