/* Главная: видео/слайд-шоу, категории, хиты, lookbook, бегущая строка. */
(function () {
  var U = function (id, w) { return "https://images.unsplash.com/photo-" + id + "?auto=format&fit=crop&w=" + (w || 800) + "&q=70"; };

  // Фото для плиток категорий — замените на свои (assets/img/cat-*.jpg)
  var CAT_IMG = {
    newborn: [U("1555252333-9f8e92e65df9", 1200), "#F4ECE1"],
    discharge: [U("1522771930-78848d9293e8"), "#F2D5CF"],
    bodysuits: [U("1566004100631-35d015d6a491"), "#E6EDE0"],
    sets: [U("1503454537195-1dcabb73ffb9"), "#EFE3CF"],
    dresses: [U("1543342384-1f1350e27861"), "#F6DCDC"],
    pajamas: [U("1607453998774-d533f65dac99"), "#E5E9EF"]
  };
  var CAT_ORDER = ["newborn", "discharge", "bodysuits", "sets", "dresses", "pajamas"];

  // Lookbook — фото детей в одежде Caramell
  var LOOK = [
    ["1503454537195-1dcabb73ffb9", "#F2D5CF"], ["1519689680058-324335c77eba", "#EFE3CF"], ["1471286174890-9c112ffca5b4", "#D6DEE6"],
    ["1492725764893-90b379c2b6e7", "#F6DCDC"], ["1476703993599-0035a21b17a9", "#E4E9DC"], ["1543342384-1f1350e27861", "#F5E1D8"],
    ["1515488042361-ee00e0ddd4e4", "#CFDCE6"], ["1502781252888-9143ba7f074e", "#EAE3D2"]
  ];

  // Если assets/hero.mp4 нет — показываем слайд-шоу
  var hero = document.getElementById("hero");
  var video = hero.querySelector("video");
  var src = video.querySelector("source");
  var fallback = function () { hero.classList.add("no-video"); };
  src.addEventListener("error", fallback);
  video.addEventListener("error", fallback);
  video.addEventListener("loadeddata", function () { hero.classList.remove("no-video"); });
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { video.removeAttribute("autoplay"); fallback(); }
  setTimeout(function () { if (video.readyState < 2) fallback(); }, 2500);

  function render() {
    document.getElementById("cats").innerHTML = CAT_ORDER.map(function (c) {
      return '<a class="cat-tile reveal" href="catalog.html?cat=' + c + '"><img loading="lazy" src="' + CAT_IMG[c][0] + '" alt="" data-art="' + c + '" data-color="' + CAT_IMG[c][1] + '">' +
        '<span>' + window.t("cat." + c) + '<svg class="i"><use href="#i-arrow"/></svg></span></a>';
    }).join("");

    var hits = window.PRODUCTS.filter(function (p) { return p.badge === "hit"; })
      .concat(window.PRODUCTS.filter(function (p) { return p.badge === "new"; }));
    document.getElementById("hits").innerHTML = hits.map(window.productCard).join("");

    document.getElementById("look").innerHTML = LOOK.map(function (l) {
      return '<figure class="reveal"><img loading="lazy" src="' + U(l[0], 700) + '" alt="Caramell kids" data-art="kid" data-color="' + l[1] + '"></figure>';
    }).join("");

    var words = [window.t("trust.tr"), window.t("trust.off"), window.t("trust.price"), window.t("trust.opt"), window.t("trust.del")];
    var row = words.map(function (w) { return "<span>" + w + "</span>"; }).join("");
    document.getElementById("marquee").innerHTML = row + row;

    window.observeReveal && window.observeReveal();
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-slide]");
    if (!b) return;
    var s = document.getElementById("hits");
    s.scrollBy({ left: +b.dataset.slide * s.clientWidth * 0.8, behavior: "smooth" });
  });

  document.addEventListener("langchange", render);
})();
