(function () {
  var panels = document.querySelectorAll('[data-mobile-panel]');
  document.querySelectorAll('[data-mobile-toggle]').forEach(function (button) {
    button.addEventListener('click', function () {
      panels.forEach(function (panel) {
        panel.classList.toggle('is-open');
      });
    });
  });

  document.querySelectorAll('img').forEach(function (img) {
    img.addEventListener('error', function () {
      img.classList.add('is-hidden');
      var box = img.closest('.poster-frame, .hero-thumb, .hero-slide, .category-box-images');
      if (box) {
        box.classList.add('cover-soft');
      }
    });
  });

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function play() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        play();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        play();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', play);
    show(0);
    play();
  });

  function params() {
    try {
      return new URLSearchParams(window.location.search);
    } catch (error) {
      return new URLSearchParams('');
    }
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var input = scope.querySelector('[data-filter-input]');
    var select = scope.querySelector('[data-filter-select]');
    var list = document.querySelector('[data-filter-list]');
    if (!list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
    var initial = params().get('q') || '';
    if (input && initial) {
      input.value = initial;
    }

    function apply() {
      var q = input ? input.value.trim().toLowerCase() : '';
      var type = select ? select.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-category'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.textContent
        ].join(' ').toLowerCase();
        var okText = !q || haystack.indexOf(q) !== -1;
        var okType = !type || haystack.indexOf(type) !== -1;
        card.style.display = okText && okType ? '' : 'none';
      });
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    if (select) {
      select.addEventListener('change', apply);
    }
    apply();
  });

  var hlsReady = null;

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (hlsReady) {
      return hlsReady;
    }
    hlsReady = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return hlsReady;
  }

  function bindStream(video, stream) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      return Promise.resolve();
    }
    return loadHls().then(function (Hls) {
      if (Hls && Hls.isSupported()) {
        if (video._hls) {
          video._hls.destroy();
        }
        var hls = new Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        video._hls = hls;
        hls.loadSource(stream);
        hls.attachMedia(video);
        return new Promise(function (resolve) {
          hls.on(Hls.Events.MANIFEST_PARSED, function () {
            resolve();
          });
        });
      }
      video.src = stream;
      return Promise.resolve();
    });
  }

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('.play-overlay');
    if (!video) {
      return;
    }
    var started = false;
    var stream = video.getAttribute('data-stream');

    function start() {
      if (!stream) {
        return;
      }
      var ready = started ? Promise.resolve() : bindStream(video, stream);
      started = true;
      ready.then(function () {
        player.classList.add('is-playing');
        var attempt = video.play();
        if (attempt && attempt.catch) {
          attempt.catch(function () {
            player.classList.remove('is-playing');
          });
        }
      }).catch(function () {
        player.classList.remove('is-playing');
      });
    }

    if (button) {
      button.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', function () {
      player.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      player.classList.remove('is-playing');
    });
  });
})();
