function initVideoPlayer(videoId, buttonId, coverId, source) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var cover = document.getElementById(coverId);
  var loaded = false;
  var hlsInstance = null;

  if (!video || !button || !cover || !source) {
    return;
  }

  function loadSource() {
    if (loaded) {
      return;
    }
    loaded = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (window.Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function startPlay() {
    loadSource();
    cover.classList.add("is-hidden");
    video.controls = true;
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  button.addEventListener("click", startPlay);
  cover.addEventListener("click", startPlay);
  video.addEventListener("click", function () {
    if (!loaded) {
      startPlay();
    }
  });

  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
