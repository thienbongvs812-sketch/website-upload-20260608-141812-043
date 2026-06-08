import { H as Hls } from "./hls.js";

export function setupPlayer(videoId, buttonId, overlayId, streamUrl) {
  const video = document.getElementById(videoId);
  const button = document.getElementById(buttonId);
  const overlay = document.getElementById(overlayId);
  if (!video || !button || !overlay || !streamUrl) {
    return;
  }

  let initialized = false;
  let hls = null;

  function initialize() {
    if (initialized) {
      return;
    }
    initialized = true;
    video.controls = true;
    const nativeHls = video.canPlayType("application/vnd.apple.mpegurl");
    if (nativeHls) {
      video.src = streamUrl;
      return;
    }
    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      return;
    }
    video.src = streamUrl;
  }

  function play() {
    initialize();
    overlay.classList.add("is-hidden");
    const promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        overlay.classList.remove("is-hidden");
      });
    }
  }

  button.addEventListener("click", play);
  if (overlay !== button) {
    overlay.addEventListener("click", play);
  }
  video.addEventListener("click", function () {
    if (video.paused) {
      play();
    }
  });
  video.addEventListener("play", function () {
    overlay.classList.add("is-hidden");
  });
  video.addEventListener("ended", function () {
    overlay.classList.remove("is-hidden");
  });
  window.addEventListener("pagehide", function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
