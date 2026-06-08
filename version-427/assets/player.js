(function () {
    var instances = {};

    function attach(video, url) {
        if (video.dataset.ready === '1') {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(url);
            hls.attachMedia(video);
            instances[video.id] = hls;
        } else {
            video.src = url;
        }

        video.dataset.ready = '1';
    }

    function begin(video, overlay, url) {
        attach(video, url);
        video.controls = true;
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
        var promise = video.play();
        if (promise && promise.catch) {
            promise.catch(function () {
                video.controls = true;
            });
        }
    }

    window.MoviePlayer = {
        start: function (videoId, buttonId, url) {
            var video = document.getElementById(videoId);
            var button = document.getElementById(buttonId);
            if (!video || !button || !url) {
                return;
            }
            var overlay = button.closest('.player-overlay');
            button.addEventListener('click', function () {
                begin(video, overlay, url);
            });
            video.addEventListener('click', function () {
                if (video.dataset.ready !== '1') {
                    begin(video, overlay, url);
                }
            });
        },
        destroy: function (videoId) {
            if (instances[videoId]) {
                instances[videoId].destroy();
                delete instances[videoId];
            }
        }
    };
})();
