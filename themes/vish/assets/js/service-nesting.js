(function () {
    "use strict";

    var menuTopFrame = 0;
    var initFrame = 0;
    var masonryControllers = new Map();

    /*
     * Superfish normally cancels the first click on any item that has a child
     * <ul>. The service menu keeps a hidden <ul> only for the mobile clone, so
     * desktop catalog links must stay ordinary, directly clickable links.
     */
    function keepServiceCatalogLinksClickable() {
        if (!window.jQuery || !window.jQuery.fn.superfish || !window.jQuery.fn.superfish.defaults) {
            return;
        }

        var defaults = window.jQuery.fn.superfish.defaults;
        if (defaults.serviceCatalogLinksFixed) {
            return;
        }

        var previousHandler = defaults.onHandleTouch;
        defaults.onHandleTouch = function () {
            if (this && this.hasClass && this.hasClass("service-menu-mobile")) {
                return false;
            }

            return typeof previousHandler === "function"
                ? previousHandler.apply(this, arguments)
                : undefined;
        };
        defaults.serviceCatalogLinksFixed = true;
    }

    keepServiceCatalogLinksClickable();

    function setMenuTop() {
        var header = document.querySelector("#header") || document.querySelector(".header");
        var bottom = header ? Math.round(header.getBoundingClientRect().bottom) : 120;
        var value = Math.max(bottom, 0) + "px";

        if (document.documentElement.style.getPropertyValue("--service-menu-top") !== value) {
            document.documentElement.style.setProperty("--service-menu-top", value);
        }
    }

    function scheduleMenuTop() {
        if (menuTopFrame) {
            return;
        }

        menuTopFrame = window.requestAnimationFrame(function () {
            menuTopFrame = 0;
            setMenuTop();
        });
    }

    function activate(menu, index) {
        menu.querySelectorAll("[data-service-menu-item]").forEach(function (item) {
            item.classList.toggle("is-active", item.getAttribute("data-service-menu-item") === index);
        });

        menu.querySelectorAll("[data-service-menu-panel]").forEach(function (panel) {
            panel.classList.toggle("is-active", panel.getAttribute("data-service-menu-panel") === index);
        });
    }

    function initMenus() {
        document.querySelectorAll("[data-service-menu]").forEach(function (menu) {
            if (menu.getAttribute("data-service-menu-initialized") === "true") {
                return;
            }
            menu.setAttribute("data-service-menu-initialized", "true");
            var items = menu.querySelectorAll("[data-service-menu-item]");

            items.forEach(function (item) {
                var index = item.getAttribute("data-service-menu-item");
                item.addEventListener("mouseenter", function () { activate(menu, index); });
                item.addEventListener("focusin", function () { activate(menu, index); });
            });

            var firstWithChildren = Array.from(items).find(function (item) {
                return Boolean(item.querySelector(".service-menu__count"));
            });

            if (firstWithChildren) {
                activate(menu, firstWithChildren.getAttribute("data-service-menu-item"));
            }
        });
    }

    function initMasonry() {
        masonryControllers.forEach(function (controller, grid) {
            if (!grid.isConnected) {
                controller.destroy();
                masonryControllers.delete(grid);
            }
        });
        document.querySelectorAll("[data-service-masonry]").forEach(function (grid) {
            if (masonryControllers.has(grid)) {
                return;
            }
            grid.setAttribute("data-service-masonry-initialized", "true");
            var items = [];
            var frame = 0;
            var measurements = "";
            var observer = null;
            var childrenObserver = null;
            var destroyed = false;

            function syncItems() {
                var nextItems = Array.from(grid.children);
                if (items.length === nextItems.length && items.every(function (item, index) { return item === nextItems[index]; })) {
                    return;
                }
                if (observer) {
                    items.forEach(function (item) { observer.unobserve(item); });
                    nextItems.forEach(function (item) { observer.observe(item); });
                }
                items = nextItems;
                measurements = "";
            }

            function reset() {
                grid.classList.remove("is-masonry-ready");
                grid.style.height = "";
                items.forEach(function (item) {
                    item.style.position = "";
                    item.style.width = "";
                    item.style.transform = "";
                });
            }

            function layout() {
                frame = 0;
                if (destroyed || !grid.isConnected) {
                    return;
                }
                syncItems();
                var width = grid.clientWidth;
                var columns = window.matchMedia("(max-width: 767px)").matches ? 1 :
                    (window.matchMedia("(max-width: 991px)").matches ? 2 : 3);

                // A hidden tab has no measurable width. Retain its last layout,
                // but invalidate the cache so showing the same width rebuilds it.
                if (!width || !grid.getClientRects().length) {
                    measurements = "";
                    return;
                }
                if (columns === 1 || !items.length) {
                    reset();
                    measurements = "";
                    return;
                }

                var styles = window.getComputedStyle(grid);
                var gap = parseFloat(styles.getPropertyValue("--service-masonry-gap"));
                if (!Number.isFinite(gap)) {
                    gap = 30;
                }
                var columnWidth = (width - gap * (columns - 1)) / columns;
                var columnHeights = Array(columns).fill(0);

                grid.classList.add("is-masonry-ready");
                items.forEach(function (item) {
                    item.style.position = "absolute";
                    item.style.width = columnWidth + "px";
                });

                // Read all heights together before writing card positions.
                var heights = items.map(function (item) { return item.getBoundingClientRect().height; });
                var nextMeasurements = [width, columns, gap, heights.join(",")].join("|");
                if (measurements === nextMeasurements) {
                    return;
                }
                items.forEach(function (item, index) {
                    if (!heights[index]) {
                        return;
                    }
                    var column = columnHeights.indexOf(Math.min.apply(Math, columnHeights));
                    var x = column * (columnWidth + gap);
                    var y = columnHeights[column];
                    item.style.transform = "translate3d(" + x + "px," + y + "px,0)";
                    columnHeights[column] = y + heights[index] + gap;
                });

                grid.style.height = Math.max(0, Math.max.apply(Math, columnHeights) - gap) + "px";
                measurements = nextMeasurements;
            }

            function schedule() {
                if (!frame && !destroyed) {
                    frame = window.requestAnimationFrame(layout);
                }
            }

            if ("ResizeObserver" in window) {
                observer = new ResizeObserver(schedule);
                observer.observe(grid);
            }
            if ("MutationObserver" in window) {
                childrenObserver = new MutationObserver(schedule);
                childrenObserver.observe(grid, { childList: true, subtree: true, characterData: true });
            }
            grid.addEventListener("load", schedule, true);
            grid.addEventListener("error", schedule, true);
            masonryControllers.set(grid, {
                schedule: schedule,
                destroy: function () {
                    destroyed = true;
                    window.cancelAnimationFrame(frame);
                    if (observer) observer.disconnect();
                    if (childrenObserver) childrenObserver.disconnect();
                    grid.removeEventListener("load", schedule, true);
                    grid.removeEventListener("error", schedule, true);
                    reset();
                }
            });
            schedule();
        });
    }

    function scheduleMasonry() {
        masonryControllers.forEach(function (controller) { controller.schedule(); });
    }

    window.addEventListener("resize", scheduleMasonry, { passive: true });
    window.addEventListener("pageshow", scheduleMasonry);
    document.addEventListener("shown.bs.tab", scheduleMasonry);
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(scheduleMasonry);
    }

    function initAnimationLayerRelease() {
        var selector = [
            ".home-redesign-page .services.animate__animated",
            ".home-redesign-page #team.team.animate__animated",
            ".home-redesign-page .staff.animate__animated",
            ".home-redesign-page .cases.animate__animated",
            ".home-redesign-page .video.animate__animated",
            ".home-redesign-page .responses.animate__animated",
            ".home-redesign-page .faq.animate__animated"
        ].join(",");

        document.querySelectorAll(selector).forEach(function (section) {
            if (section.getAttribute("data-animation-layer-release") === "true") {
                return;
            }
            section.setAttribute("data-animation-layer-release", "true");

            var release = function () {
                section.classList.add("animation-layer-released");
                section.removeEventListener("animationend", onAnimationEnd);
                section.removeEventListener("webkitAnimationEnd", onAnimationEnd);
            };
            var onAnimationEnd = function (event) {
                if (event.target === section && event.animationName === "fadeIn") {
                    release();
                }
            };

            section.addEventListener("animationend", onAnimationEnd);
            section.addEventListener("webkitAnimationEnd", onAnimationEnd);

            window.requestAnimationFrame(function () {
                if (typeof section.getAnimations !== "function") {
                    return;
                }
                section.getAnimations().forEach(function (animation) {
                    if (animation.effect && animation.effect.target === section && animation.animationName === "fadeIn") {
                        animation.finished.then(release).catch(function () {});
                    }
                });
            });
        });
    }

    function initAvailable() {
        var header = document.querySelector("#header") || document.querySelector(".header");

        scheduleMenuTop();
        initMenus();
        initMasonry();
        initAnimationLayerRelease();

        if (header && header.getAttribute("data-service-header-initialized") !== "true") {
            header.setAttribute("data-service-header-initialized", "true");
            window.addEventListener("resize", scheduleMenuTop, { passive: true });

            if ("ResizeObserver" in window) {
                new ResizeObserver(scheduleMenuTop).observe(header);
            }

            if ("MutationObserver" in window) {
                new MutationObserver(scheduleMenuTop).observe(header, {
                    attributes: true,
                    attributeFilter: ["class", "style"]
                });
            }
        }
    }

    function scheduleInit() {
        if (initFrame) {
            return;
        }
        initFrame = window.requestAnimationFrame(function () {
            initFrame = 0;
            initAvailable();
        });
    }

    initAvailable();
    document.addEventListener("DOMContentLoaded", initAvailable, { once: true });

    if ("MutationObserver" in window) {
        new MutationObserver(function (mutations) {
            var relevant = mutations.some(function (mutation) {
                return Array.from(mutation.addedNodes).concat(Array.from(mutation.removedNodes)).some(function (node) {
                    if (node.nodeType !== 1) {
                        return false;
                    }
                    return node.matches("[data-service-masonry], .service-masonry__item, [data-service-menu], #header, .header, .animate__animated") ||
                        Boolean(node.querySelector("[data-service-masonry], [data-service-menu], #header, .header, .animate__animated"));
                });
            });
            if (relevant) {
                scheduleInit();
            }
        }).observe(document.documentElement, { childList: true, subtree: true });
    }
}());
