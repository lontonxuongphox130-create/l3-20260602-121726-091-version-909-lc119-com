(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function attachSource(shell, video, source) {
    if (shell.dataset.playerAttached === "1") {
      return;
    }
    shell.dataset.playerAttached = "1";

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      shell.hlsInstance = hls;
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }

    video.src = source;
  }

  ready(function () {
    var shells = Array.prototype.slice.call(document.querySelectorAll("[data-video-url]"));

    shells.forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector("[data-play-button]");
      var source = shell.getAttribute("data-video-url");

      if (!video || !source) {
        return;
      }

      function playMovie() {
        attachSource(shell, video, source);
        shell.classList.add("is-ready");
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.then(function () {
            shell.classList.add("is-playing");
          }).catch(function () {
            shell.classList.add("is-ready");
          });
        } else {
          shell.classList.add("is-playing");
        }
      }

      if (button) {
        button.addEventListener("click", playMovie);
      }

      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
      });

      video.addEventListener("pause", function () {
        if (!video.ended) {
          shell.classList.remove("is-playing");
          shell.classList.add("is-ready");
        }
      });

      video.addEventListener("click", function () {
        if (video.paused) {
          playMovie();
        }
      });

      attachSource(shell, video, source);
    });
  });
})();
