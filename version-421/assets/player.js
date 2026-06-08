function setupPlayer(videoId, maskId, stream) {
  var video = document.getElementById(videoId);
  var mask = document.getElementById(maskId);
  var hls = null;
  var ready = false;

  function bindStream() {
    if (ready || !video || !stream) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
    } else {
      video.src = stream;
    }

    ready = true;
  }

  function playVideo() {
    bindStream();
    if (mask) {
      mask.classList.add("hidden");
    }
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  if (mask) {
    mask.addEventListener("click", playVideo);
  }

  if (video) {
    video.addEventListener("play", bindStream, { once: true });
    video.addEventListener("click", function () {
      if (!ready) {
        playVideo();
      }
    });
    video.addEventListener("ended", function () {
      if (mask) {
        mask.classList.remove("hidden");
      }
    });
  }

  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
}
