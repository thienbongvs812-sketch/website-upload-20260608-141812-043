(function () {
    window.initMoviePlayer = function (config) {
        var video = document.querySelector(config.video);
        var overlay = document.querySelector(config.overlay);
        var button = document.querySelector(config.button);
        var started = false;
        var hls = null;

        if (!video || !config.source) {
            return;
        }

        function play() {
            var result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {});
            }
        }

        function attach() {
            if (started) {
                play();
                return;
            }
            started = true;
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            video.controls = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = config.source;
                video.addEventListener("loadedmetadata", play, { once: true });
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(config.source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, play);
            } else {
                video.src = config.source;
                video.addEventListener("loadedmetadata", play, { once: true });
            }
        }

        if (overlay) {
            overlay.addEventListener("click", attach);
        }
        if (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();
                attach();
            });
        }
        video.addEventListener("click", function () {
            if (!started) {
                attach();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
})();
