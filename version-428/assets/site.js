(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[character];
    });
  }

  function initMobileNav() {
    const button = document.querySelector("[data-nav-toggle]");
    const nav = document.querySelector("[data-main-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    const root = document.querySelector("[data-hero-carousel]");
    if (!root) {
      return;
    }
    const slides = Array.from(root.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(root.querySelectorAll("[data-hero-dot]"));
    const previous = root.querySelector("[data-hero-prev]");
    const next = root.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    let active = 0;
    let timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    if (previous) {
      previous.addEventListener("click", function () {
        show(active - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        start();
      });
    }

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function matchMovie(movie, query) {
    const text = [
      movie.title,
      movie.region,
      movie.type,
      movie.genre,
      movie.year,
      movie.tags
    ].join(" ").toLowerCase();
    return text.includes(query.toLowerCase());
  }

  function initGlobalSearch() {
    const input = document.querySelector("[data-global-search]");
    const results = document.querySelector("[data-global-results]");
    if (!input || !results || !window.SITE_MOVIES) {
      return;
    }

    function render() {
      const query = input.value.trim();
      if (!query) {
        results.classList.remove("is-open");
        results.innerHTML = "";
        return;
      }
      const matches = window.SITE_MOVIES.filter(function (movie) {
        return matchMovie(movie, query);
      }).slice(0, 36);
      results.classList.add("is-open");
      if (!matches.length) {
        results.innerHTML = '<div class="no-results is-open">暂无相关影片</div>';
        return;
      }
      results.innerHTML = matches.map(function (movie) {
        const title = escapeHtml(movie.title);
        const url = escapeHtml(movie.url);
        const poster = escapeHtml(movie.poster);
        const year = escapeHtml(movie.year);
        const region = escapeHtml(movie.region);
        const type = escapeHtml(movie.type);
        return `<a class="search-result-card" href="${url}">` +
          `<img src="${poster}" alt="${title}" loading="lazy">` +
          `<span><strong>${title}</strong><span>${year} · ${region} · ${type}</span></span>` +
          `</a>`;
      }).join("");
    }

    input.addEventListener("input", render);
  }

  function initLocalFilters() {
    const filterRoot = document.querySelector("[data-local-filter]");
    if (!filterRoot) {
      return;
    }
    const input = filterRoot.querySelector("[data-filter-keyword]");
    const region = filterRoot.querySelector("[data-filter-region]");
    const type = filterRoot.querySelector("[data-filter-type]");
    const year = filterRoot.querySelector("[data-filter-year]");
    const cards = Array.from(document.querySelectorAll("[data-movie-card]"));
    const empty = document.querySelector("[data-filter-empty]");

    function value(element) {
      return element ? element.value.trim().toLowerCase() : "";
    }

    function update() {
      const query = value(input);
      const regionValue = value(region);
      const typeValue = value(type);
      const yearValue = value(year);
      let visible = 0;

      cards.forEach(function (card) {
        const text = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.tags,
          card.dataset.year
        ].join(" ").toLowerCase();
        const ok = (!query || text.includes(query)) &&
          (!regionValue || String(card.dataset.region || "").toLowerCase() === regionValue) &&
          (!typeValue || String(card.dataset.type || "").toLowerCase() === typeValue) &&
          (!yearValue || String(card.dataset.year || "").toLowerCase() === yearValue);
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-open", visible === 0);
      }
    }

    [input, region, type, year].forEach(function (element) {
      if (element) {
        element.addEventListener("input", update);
        element.addEventListener("change", update);
      }
    });
  }

  ready(function () {
    initMobileNav();
    initHero();
    initGlobalSearch();
    initLocalFilters();
  });
})();
