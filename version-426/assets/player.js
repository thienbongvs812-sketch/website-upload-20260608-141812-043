(function () {
    function initMoviePlayer(videoId, sourceUrl) {
        var video = document.getElementById(videoId);

        if (!video || !sourceUrl) {
            return;
        }

        var shell = video.closest(".player-shell");
        var layer = shell ? shell.querySelector(".play-layer") : null;
        var attached = false;
        var hlsInstance = null;

        function attach() {
            if (attached) {
                return;
            }

            attached = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }
        }

        function play() {
            attach();

            if (layer) {
                layer.classList.add("hidden");
            }

            var promise = video.play();

            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    if (layer) {
                        layer.classList.remove("hidden");
                    }
                });
            }
        }

        if (layer) {
            layer.addEventListener("click", play);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });

        video.addEventListener("play", function () {
            if (layer) {
                layer.classList.add("hidden");
            }
        });

        video.addEventListener("ended", function () {
            if (layer) {
                layer.classList.remove("hidden");
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance && typeof hlsInstance.destroy === "function") {
                hlsInstance.destroy();
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;
})();
