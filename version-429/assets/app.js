(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMobileNav() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function setupHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function setActive(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        setActive(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        setActive(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        setActive(index + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        setActive(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    setActive(0);
    start();
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
    scopes.forEach(function (scope) {
      var input = scope.querySelector('[data-filter-input]');
      var typeSelect = scope.querySelector('[data-filter-type]');
      var yearSelect = scope.querySelector('[data-filter-year]');
      var categorySelect = scope.querySelector('[data-filter-category]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));

      function normalize(value) {
        return String(value || '').toLowerCase().trim();
      }

      function getQueryValue() {
        var params = new URLSearchParams(window.location.search);
        return params.get('q') || '';
      }

      function apply() {
        var text = normalize(input && input.value);
        var type = normalize(typeSelect && typeSelect.value);
        var year = normalize(yearSelect && yearSelect.value);
        var category = normalize(categorySelect && categorySelect.value);

        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute('data-title'));
          var cardType = normalize(card.getAttribute('data-type'));
          var cardYear = normalize(card.getAttribute('data-year'));
          var cardCategory = normalize(card.getAttribute('data-category'));
          var visible = true;
          if (text && haystack.indexOf(text) === -1) {
            visible = false;
          }
          if (type && cardType !== type) {
            visible = false;
          }
          if (year && cardYear !== year) {
            visible = false;
          }
          if (category && cardCategory !== category) {
            visible = false;
          }
          card.classList.toggle('is-hidden', !visible);
        });
      }

      if (input && !input.value) {
        input.value = getQueryValue();
      }
      [input, typeSelect, yearSelect, categorySelect].forEach(function (element) {
        if (element) {
          element.addEventListener('input', apply);
          element.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('[data-play-button]');
      var errorBox = shell.querySelector('[data-player-error]');
      var stream = video ? video.getAttribute('data-stream') : '';
      var hlsInstance = null;
      var attached = false;

      function showError(message) {
        if (errorBox) {
          errorBox.textContent = message;
        }
      }

      function attachStream() {
        if (!video || !stream || attached) {
          return;
        }
        attached = true;
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              showError('视频加载失败，请稍后再试');
            }
          });
        } else {
          video.src = stream;
        }
      }

      function startPlayback() {
        if (!video) {
          return;
        }
        attachStream();
        video.controls = true;
        var playPromise = video.play();
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.then(function () {
            shell.classList.add('is-playing');
          }).catch(function () {
            showError('点击视频画面可继续播放');
          });
        } else {
          shell.classList.add('is-playing');
        }
      }

      function togglePlayback() {
        if (!video) {
          return;
        }
        if (video.paused) {
          startPlayback();
        } else {
          video.pause();
        }
      }

      if (button) {
        button.addEventListener('click', startPlayback);
      }
      if (video) {
        video.addEventListener('click', togglePlayback);
        video.addEventListener('play', function () {
          shell.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
          shell.classList.remove('is-playing');
        });
        video.addEventListener('error', function () {
          showError('视频加载失败，请稍后再试');
        });
      }
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMobileNav();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
