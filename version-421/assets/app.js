(function () {
  var menuButton = document.querySelector(".menu-button");
  var mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      var opened = mobileNav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  var yearNodes = document.querySelectorAll("[data-year]");
  for (var y = 0; y < yearNodes.length; y += 1) {
    yearNodes[y].textContent = String(new Date().getFullYear());
  }

  var slides = document.querySelectorAll(".hero-slide");
  var dots = document.querySelectorAll(".hero-dot");
  var prev = document.querySelector(".hero-prev");
  var next = document.querySelector(".hero-next");
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    for (var i = 0; i < slides.length; i += 1) {
      slides[i].classList.toggle("active", i === current);
    }
    for (var j = 0; j < dots.length; j += 1) {
      dots[j].classList.toggle("active", j === current);
    }
  }

  function startHero() {
    if (timer) {
      window.clearInterval(timer);
    }
    if (slides.length > 1) {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  if (slides.length) {
    showSlide(0);
    startHero();

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
        startHero();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        startHero();
      });
    }

    for (var d = 0; d < dots.length; d += 1) {
      dots[d].addEventListener("click", function () {
        showSlide(Number(this.getAttribute("data-slide")) || 0);
        startHero();
      });
    }
  }

  var searchInput = document.querySelector("[data-search-input]");
  var typeFilter = document.querySelector("[data-type-filter]");
  var cards = document.querySelectorAll(".movie-card[data-search]");
  var emptyState = document.querySelector(".empty-state");

  function filterCards() {
    if (!cards.length) {
      return;
    }
    var term = searchInput ? searchInput.value.trim().toLowerCase() : "";
    var type = typeFilter ? typeFilter.value : "";
    var visible = 0;

    for (var i = 0; i < cards.length; i += 1) {
      var card = cards[i];
      var haystack = (card.getAttribute("data-search") || "").toLowerCase();
      var matchTerm = !term || haystack.indexOf(term) !== -1;
      var matchType = !type || haystack.indexOf(type.toLowerCase()) !== -1;
      var matched = matchTerm && matchType;
      card.style.display = matched ? "" : "none";
      if (matched) {
        visible += 1;
      }
    }

    if (emptyState) {
      emptyState.style.display = visible ? "none" : "block";
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", filterCards);
  }

  if (typeFilter) {
    typeFilter.addEventListener("change", filterCards);
  }
})();
