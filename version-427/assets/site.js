(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var mainNav = document.querySelector('[data-main-nav]');
    var topSearch = document.querySelector('.top-search');

    if (navToggle && mainNav) {
        navToggle.addEventListener('click', function () {
            mainNav.classList.toggle('is-open');
            if (topSearch) {
                topSearch.classList.toggle('is-open');
            }
        });
    }

    document.querySelectorAll('.site-search').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            var value = input ? input.value.trim() : '';
            if (!value) {
                event.preventDefault();
                window.location.href = 'search.html';
            }
        });
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var index = 0;
        var showSlide = function (next) {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        };
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                showSlide(i);
            });
        });
        showSlide(0);
        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(index + 1);
            }, 5000);
        }
    }

    var scopes = document.querySelectorAll('[data-filter-scope]');
    scopes.forEach(function (scope) {
        var input = scope.querySelector('[data-filter-keyword]');
        var year = scope.querySelector('[data-filter-year]');
        var region = scope.querySelector('[data-filter-region]');
        var type = scope.querySelector('[data-filter-type]');
        var reset = scope.querySelector('[data-filter-reset]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
        var empty = scope.querySelector('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);

        if (input && params.has('q')) {
            input.value = params.get('q') || '';
        }

        var normalize = function (value) {
            return String(value || '').toLowerCase().replace(/\s+/g, '');
        };

        var filter = function () {
            var keyword = normalize(input ? input.value : '');
            var selectedYear = year ? year.value : '';
            var selectedRegion = region ? region.value : '';
            var selectedType = type ? type.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute('data-title'));
                var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchYear = !selectedYear || card.getAttribute('data-year') === selectedYear;
                var matchRegion = !selectedRegion || card.getAttribute('data-region') === selectedRegion;
                var matchType = !selectedType || card.getAttribute('data-type') === selectedType;
                var matched = matchKeyword && matchYear && matchRegion && matchType;
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        };

        [input, year, region, type].forEach(function (item) {
            if (item) {
                item.addEventListener('input', filter);
                item.addEventListener('change', filter);
            }
        });

        if (reset) {
            reset.addEventListener('click', function () {
                if (input) {
                    input.value = '';
                }
                if (year) {
                    year.value = '';
                }
                if (region) {
                    region.value = '';
                }
                if (type) {
                    type.value = '';
                }
                filter();
            });
        }

        filter();
    });
})();
