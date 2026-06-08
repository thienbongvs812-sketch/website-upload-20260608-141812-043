(function () {
    function setupMoviePlayer(sourceUrl) {
        var frame = document.querySelector("[data-player]");
        var video = frame ? frame.querySelector("video") : null;
        var overlay = frame ? frame.querySelector(".player-overlay") : null;
        var hlsInstance = null;
        var attached = false;

        if (!frame || !video || !sourceUrl) {
            return;
        }

        function attachSource() {
            if (attached) {
                return;
            }

            attached = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
                return;
            }

            video.src = sourceUrl;
        }

        function startPlayback() {
            attachSource();
            frame.classList.add("is-playing");
            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    frame.classList.remove("is-playing");
                });
            }
        }

        if (overlay) {
            overlay.addEventListener("click", function (event) {
                event.preventDefault();
                startPlayback();
            });
        }

        frame.addEventListener("click", function (event) {
            if (event.target === video || frame.classList.contains("is-playing")) {
                return;
            }

            startPlayback();
        });

        video.addEventListener("play", function () {
            frame.classList.add("is-playing");
        });

        video.addEventListener("ended", function () {
            frame.classList.remove("is-playing");
        });

        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    window.setupMoviePlayer = setupMoviePlayer;
})();
