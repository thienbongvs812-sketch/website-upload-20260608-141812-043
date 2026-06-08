(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");

        if (toggle && menu) {
            toggle.addEventListener("click", function () {
                menu.classList.toggle("open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var currentSlide = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            currentSlide = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === currentSlide);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === currentSlide);
            });
        }

        function startHero() {
            if (timer) {
                clearInterval(timer);
            }

            if (slides.length > 1) {
                timer = setInterval(function () {
                    showSlide(currentSlide + 1);
                }, 5200);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var index = Number(dot.getAttribute("data-hero-dot"));
                showSlide(index);
                startHero();
            });
        });

        startHero();

        var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
        var clearButtons = Array.prototype.slice.call(document.querySelectorAll("[data-clear-search]"));
        var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
        var activeFilter = "all";

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function activeQuery() {
            for (var i = 0; i < inputs.length; i += 1) {
                if (inputs[i].value.trim()) {
                    return normalize(inputs[i].value);
                }
            }
            return "";
        }

        function filterCards() {
            var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
            var query = activeQuery();
            var visibleCount = 0;

            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-category"),
                    card.textContent
                ].join(" "));
                var category = card.getAttribute("data-category") || "";
                var matchesQuery = !query || text.indexOf(query) !== -1;
                var matchesFilter = activeFilter === "all" || category === activeFilter;
                var visible = matchesQuery && matchesFilter;

                card.style.display = visible ? "" : "none";

                if (visible) {
                    visibleCount += 1;
                }
            });

            Array.prototype.slice.call(document.querySelectorAll("[data-card-list]")).forEach(function (list) {
                var notice = list.querySelector(".no-results");

                if (!notice) {
                    notice = document.createElement("div");
                    notice.className = "no-results";
                    notice.textContent = "没有找到匹配内容";
                    list.appendChild(notice);
                }

                notice.style.display = visibleCount === 0 && cards.length ? "block" : "none";
            });
        }

        inputs.forEach(function (input) {
            input.addEventListener("input", filterCards);
        });

        clearButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                inputs.forEach(function (input) {
                    input.value = "";
                });
                filterCards();
            });
        });

        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                activeFilter = chip.getAttribute("data-filter") || "all";
                chips.forEach(function (item) {
                    item.classList.toggle("active", item === chip);
                });
                filterCards();
            });
        });
    });
})();
