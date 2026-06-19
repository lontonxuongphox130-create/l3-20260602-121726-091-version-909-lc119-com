(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector(".menu-button");
    var mobilePanel = document.querySelector(".mobile-panel");

    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function () {
        mobilePanel.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var active = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
    }

    if (slides.length) {
      showSlide(0);
      if (prev) {
        prev.addEventListener("click", function () {
          showSlide(active - 1);
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          showSlide(active + 1);
        });
      }
      window.setInterval(function () {
        showSlide(active + 1);
      }, 5600);
    }

    var filterBars = Array.prototype.slice.call(document.querySelectorAll("[data-filter-bar]"));
    filterBars.forEach(function (bar) {
      var grid = document.querySelector(bar.getAttribute("data-filter-bar"));
      if (!grid) {
        return;
      }
      var yearSelect = bar.querySelector("[data-filter-year]");
      var regionSelect = bar.querySelector("[data-filter-region]");
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

      function applyFilters() {
        var year = yearSelect ? yearSelect.value : "";
        var region = regionSelect ? regionSelect.value : "";
        cards.forEach(function (card) {
          var okYear = !year || card.getAttribute("data-year") === year;
          var okRegion = !region || card.getAttribute("data-region") === region;
          card.style.display = okYear && okRegion ? "" : "none";
        });
      }

      if (yearSelect) {
        yearSelect.addEventListener("change", applyFilters);
      }
      if (regionSelect) {
        regionSelect.addEventListener("change", applyFilters);
      }
      applyFilters();
    });

    var searchPage = document.querySelector("[data-search-page]");
    if (searchPage) {
      var params = new URLSearchParams(window.location.search);
      var q = (params.get("q") || "").trim();
      var input = searchPage.querySelector("input[name='q']");
      var cards = Array.prototype.slice.call(searchPage.querySelectorAll(".movie-card"));
      if (input) {
        input.value = q;
      }

      function applySearch(value) {
        var keyword = value.trim().toLowerCase();
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre"),
            card.textContent
          ].join(" ").toLowerCase();
          card.style.display = !keyword || haystack.indexOf(keyword) !== -1 ? "" : "none";
        });
      }

      applySearch(q);
      if (input) {
        input.addEventListener("input", function () {
          applySearch(input.value);
        });
      }
    }
  });
})();
