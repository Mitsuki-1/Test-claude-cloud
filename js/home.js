/* Главная: видео-hero, счётчики, хит недели, reels + сторис, конструктор выписки, магазины. */
(function () {
  var U = function (id, w) { return "https://images.unsplash.com/photo-" + id + "?auto=format&fit=crop&w=" + (w || 800) + "&q=70"; };
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var CAT_IMG = {
    newborn: [U("1555252333-9f8e92e65df9", 1200), "#EAF0F8"],
    discharge: [U("1522771930-78848d9293e8"), "#F5DCE2"],
    bodysuits: [U("1566004100631-35d015d6a491"), "#E4ECF8"],
    sets: [U("1503454537195-1dcabb73ffb9"), "#EAF0F8"],
    dresses: [U("1543342384-1f1350e27861"), "#F5DCE2"],
    pajamas: [U("1607453998774-d533f65dac99"), "#E4ECF8"]
  };
  var CAT_ORDER = ["newborn", "discharge", "bodysuits", "sets", "dresses", "pajamas"];

  var LOOK = [
    ["1503454537195-1dcabb73ffb9", "#F5DCE2"], ["1519689680058-324335c77eba", "#EAF0F8"], ["1471286174890-9c112ffca5b4", "#E4ECF8"],
    ["1492725764893-90b379c2b6e7", "#F5DCE2"], ["1476703993599-0035a21b17a9", "#EAF0F8"], ["1543342384-1f1350e27861", "#F5DCE2"],
    ["1515488042361-ee00e0ddd4e4", "#E4ECF8"], ["1502781252888-9143ba7f074e", "#EAF0F8"]
  ];

  // Ролики из t.me/Caramelluz, подписи — из постов
  var REELS = ["r1", "r2", "r3", "r4", "r5", "r6", "r7"];

  // Адреса и часы работы — из постов канала
  var SHOPS = [
    { k: "shop.1", h: [10, 20], q: "Ташкент, Яккасарайский район, улица Нукус 15Б" },
    { k: "shop.2", n: "shop.2n", h: [9, 21], q: "Ташкент, Алмазарский район, Себзар корзинка" },
    { k: "shop.3", h: [10, 22], q: "Ташкент, ТРЦ Chimgan, улица Темура Малика 3А" },
    { k: "shop.4", h: [10, 22], q: "Ташкент, торговый центр Riviera" }
  ];

  var fmt = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " "); };

  /* ---------- Hero ---------- */
  var hero = document.getElementById("hero");
  var video = hero.querySelector("video");
  var src = video.querySelector("source");
  var fallback = function () { hero.classList.add("no-video"); };
  src.addEventListener("error", fallback);
  video.addEventListener("error", fallback);
  video.addEventListener("loadeddata", function () { hero.classList.remove("no-video"); hero.classList.add("video-on"); });
  if (reduced) { video.removeAttribute("autoplay"); video.pause(); fallback(); }
  setTimeout(function () { if (video.readyState < 2) fallback(); }, 2500);

  var media = hero.querySelector(".hero-media");
  if (!reduced) {
    window.addEventListener("scroll", function () {
      var y = window.scrollY;
      if (y < window.innerHeight) media.style.transform = "translate3d(0," + y * 0.25 + "px,0) scale(" + (1 + y / 4000) + ")";
    }, { passive: true });
  }

  var wordIdx = 0;
  if (!reduced) setInterval(function () {
    var em = document.querySelector(".hero h1 .rot");
    if (!em) return;
    var words = window.t("hero.words").split("|");
    wordIdx = (wordIdx + 1) % words.length;
    em.classList.add("out");
    setTimeout(function () { em.textContent = words[wordIdx]; em.classList.remove("out"); em.classList.add("in"); setTimeout(function () { em.classList.remove("in"); }, 500); }, 380);
  }, 2800);

  function countUp() {
    document.querySelectorAll("[data-count]").forEach(function (el) {
      var to = +el.dataset.count, plus = el.dataset.plus || "";
      if (reduced) { el.textContent = fmt(to) + plus; return; }
      var t0 = null;
      var step = function (ts) {
        if (!t0) t0 = ts;
        var p = Math.min(1, (ts - t0) / 1600);
        el.textContent = fmt(Math.round(to * (1 - Math.pow(1 - p, 3)))) + (p === 1 ? plus : "");
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }
  setTimeout(countUp, 700);

  function hot() {
    var p = window.findProduct("c102");
    document.getElementById("hot").innerHTML =
      '<div class="hot-card" data-open="' + p.id + '" tabindex="0" role="button">' +
      '<div class="hot-img"><img src="' + p.img + '" alt="" data-art="' + p.cat + '" data-color="' + p.color + '"></div>' +
      '<div class="hot-body"><span class="hot-k">🔥 ' + window.t("hot.kicker") + '</span><b>' + window.L(p.name) + '</b>' +
      '<div class="hot-row"><span class="hot-price">' + window.formatSum(p.price) + '</span><span class="hot-btn">' + window.t("hot.cta") + ' <svg class="i"><use href="#i-arrow"/></svg></span></div></div></div>';
  }

  /* ---------- Reels + Stories ---------- */
  var reelIO = ("IntersectionObserver" in window) ? new IntersectionObserver(function (ents) {
    ents.forEach(function (en) {
      var v = en.target;
      if (en.isIntersecting && !reduced && !document.body.classList.contains("story-open")) { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); }
      else v.pause();
    });
  }, { threshold: 0.55 }) : null;

  function reels() {
    var list = document.getElementById("reels-list");
    list.innerHTML = REELS.map(function (r, i) {
      return '<button class="reel reveal" data-reel="' + i + '" aria-label="' + window.t(r).replace(/"/g, "&quot;") + '">' +
        '<video muted loop playsinline preload="metadata" src="assets/reels/' + r + '.mp4#t=0.1"></video>' +
        '<span class="reel-shade"></span><span class="reel-play"><svg class="i"><use href="#i-play"/></svg></span>' +
        '<span class="reel-cap">' + window.t(r) + "</span></button>";
    }).join("");
    if (reelIO) list.querySelectorAll("video").forEach(function (v) { reelIO.observe(v); });
  }

  var story = null, sIdx = 0;
  function mountStory() {
    story = document.createElement("div");
    story.className = "story";
    story.setAttribute("role", "dialog");
    story.setAttribute("aria-modal", "true");
    story.innerHTML =
      '<div class="story-box">' +
      '<div class="story-bars">' + REELS.map(function () { return "<span><i></i></span>"; }).join("") + "</div>" +
      '<div class="story-top"><span class="story-brand"><svg class="logo-mark"><use href="#i-logo"/></svg>caramell_uzbekistan</span>' +
      '<button class="story-btn" data-s="sound" aria-label="sound"><svg class="i"><use href="#i-mute"/></svg></button>' +
      '<button class="story-btn" data-s="close" aria-label="close">×</button></div>' +
      '<video playsinline muted></video>' +
      '<button class="story-nav prev" data-s="prev" aria-label="prev"></button><button class="story-nav next" data-s="next" aria-label="next"></button>' +
      '<div class="story-foot"><p class="story-cap"></p><a class="btn btn-tg btn-block" target="_blank" rel="noopener" href="' + window.CONTACT.tg + '"><svg class="i"><use href="#i-tg"/></svg><span class="story-cta"></span></a></div>' +
      "</div>";
    document.body.appendChild(story);
    var v = story.querySelector("video");
    v.addEventListener("timeupdate", function () {
      if (v.duration) story.querySelectorAll(".story-bars i")[sIdx].style.transform = "scaleX(" + v.currentTime / v.duration + ")";
    });
    v.addEventListener("ended", function () { go(1); });
    story.addEventListener("click", function (e) {
      var b = e.target.closest("[data-s]");
      if (!b) { if (e.target === story) closeStory(); return; }
      var a = b.dataset.s;
      if (a === "close") closeStory();
      else if (a === "prev") go(-1);
      else if (a === "next") go(1);
      else if (a === "sound") { v.muted = !v.muted; b.querySelector("use").setAttribute("href", v.muted ? "#i-mute" : "#i-sound"); }
    });
    var y0 = null;
    story.addEventListener("touchstart", function (e) { y0 = e.touches[0].clientY; }, { passive: true });
    story.addEventListener("touchend", function (e) { if (y0 !== null && e.changedTouches[0].clientY - y0 > 90) closeStory(); y0 = null; });
    document.addEventListener("keydown", function (e) {
      if (!document.body.classList.contains("story-open")) return;
      if (e.key === "Escape") closeStory();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    });
  }

  function show(i) {
    sIdx = i;
    var v = story.querySelector("video");
    story.querySelectorAll(".story-bars i").forEach(function (b, n) { b.style.transform = "scaleX(" + (n < i ? 1 : 0) + ")"; });
    v.src = "assets/reels/" + REELS[i] + ".mp4";
    var pr = v.play(); if (pr && pr.catch) pr.catch(function () {});
    story.querySelector(".story-cap").textContent = window.t(REELS[i]);
    story.querySelector(".story-cta").textContent = window.t("reels.order");
  }
  function go(d) {
    var n = sIdx + d;
    if (n < 0) n = 0;
    if (n >= REELS.length) return closeStory();
    show(n);
  }
  function openStory(i) {
    if (!story) mountStory();
    document.querySelectorAll(".reel video").forEach(function (v) { v.pause(); });
    document.body.classList.add("story-open");
    document.body.style.overflow = "hidden";
    show(i);
    story.querySelector('[data-s="close"]').focus();
  }
  function closeStory() {
    if (!story) return;
    var v = story.querySelector("video");
    v.pause(); v.removeAttribute("src"); v.load();
    document.body.classList.remove("story-open");
    document.body.style.overflow = "";
    var last = document.querySelector('[data-reel="' + sIdx + '"]');
    last && last.focus();
  }

  /* ---------- Конструктор выписки ---------- */
  var bState = { g: "c101", plaid: true };
  function builder() {
    var set = window.findProduct(bState.g), plaid = window.findProduct("c103");
    document.getElementById("b-plaid-price").textContent = "+ " + window.formatSum(plaid.price);
    document.querySelectorAll("[data-bg]").forEach(function (b) {
      var on = b.dataset.bg === bState.g;
      b.classList.toggle("is-on", on); b.setAttribute("aria-checked", on ? "true" : "false");
    });
    document.getElementById("b-plaid").checked = bState.plaid;
    document.getElementById("b-visual").innerHTML =
      '<img class="b-main" src="' + set.img + '" alt="" data-art="' + set.cat + '" data-color="' + set.color + '">' +
      '<img class="b-side' + (bState.plaid ? " on" : "") + '" src="' + plaid.img + '" alt="" data-art="' + plaid.cat + '" data-color="' + plaid.color + '">';
    document.getElementById("b-lines").innerHTML =
      '<div><span>' + window.L(set.name) + '</span><b>' + window.formatSum(set.price) + "</b></div>" +
      (bState.plaid ? '<div class="b-new"><span>' + window.L(plaid.name) + '</span><b>' + window.formatSum(plaid.price) + "</b></div>" : "");
    var total = set.price + (bState.plaid ? plaid.price : 0);
    var el = document.getElementById("b-total");
    el.textContent = window.formatSum(total);
    el.classList.remove("tick"); void el.offsetWidth; el.classList.add("tick");
  }

  /* ---------- Магазины ---------- */
  function shops() {
    var now = new Date();
    var tash = (now.getUTCHours() + 5) % 24 + now.getUTCMinutes() / 60;
    document.getElementById("shops-list").innerHTML = SHOPS.map(function (s, i) {
      var open = tash >= s.h[0] && tash < s.h[1];
      return '<article class="shop reveal">' +
        '<div class="shop-num">0' + (i + 1) + '</div>' +
        '<span class="shop-status ' + (open ? "open" : "closed") + '"><i></i>' + window.t(open ? "shops.open" : "shops.closed") + "</span>" +
        '<h3>' + window.t(s.k) + "</h3>" + (s.n ? '<p class="shop-note">' + window.t(s.n) + "</p>" : "") +
        '<p class="shop-h"><svg class="i"><use href="#i-clock"/></svg>' + s.h[0] + ":00 – " + s.h[1] + ":00</p>" +
        '<a class="btn btn-ghost" href="https://yandex.uz/maps/?text=' + encodeURIComponent(s.q) + '" target="_blank" rel="noopener"><svg class="i"><use href="#i-pin"/></svg>' + window.t("shops.route") + "</a></article>";
    }).join("");
  }

  /* ---------- Тизер Sweet Me ---------- */
  var soonVid = document.querySelector(".soon-vid");
  if (soonVid && "IntersectionObserver" in window && !reduced) {
    new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (en.isIntersecting) { if (!soonVid.src) soonVid.src = soonVid.dataset.src; var pr = soonVid.play(); if (pr && pr.catch) pr.catch(function () {}); }
        else soonVid.pause();
      });
    }, { threshold: 0.3 }).observe(soonVid);
  }

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

    wordIdx = 0;
    hot();
    reels();
    builder();
    shops();
    if (story && document.body.classList.contains("story-open")) show(sIdx);
    window.observeReveal && window.observeReveal();
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-slide]");
    if (b) {
      var s = document.getElementById("hits");
      s.scrollBy({ left: +b.dataset.slide * s.clientWidth * 0.8, behavior: "smooth" });
      return;
    }
    var r = e.target.closest("[data-reel]");
    if (r) { openStory(+r.dataset.reel); return; }
    var g = e.target.closest("[data-bg]");
    if (g) { bState.g = g.dataset.bg; builder(); return; }
    if (e.target.closest("#b-add")) {
      window.flyToCart && window.flyToCart(document.querySelector("#b-visual .b-main"));
      window.Cart.add(bState.g, "0-3m", 1);
      if (bState.plaid) window.Cart.add("c103", "0-3m", 1);
      window.toast(window.t("b.added") + " ✓");
    }
  });
  document.addEventListener("change", function (e) {
    if (e.target.id === "b-plaid") { bState.plaid = e.target.checked; builder(); }
  });
  document.addEventListener("keydown", function (e) {
    if ((e.key === "Enter" || e.key === " ") && e.target.classList && e.target.classList.contains("hot-card")) { e.preventDefault(); window.openProduct(e.target.dataset.open); }
  });

  setInterval(function () {
    var now = new Date();
    var tash = (now.getUTCHours() + 5) % 24 + now.getUTCMinutes() / 60;
    document.querySelectorAll(".shop-status").forEach(function (el, i) {
      var open = tash >= SHOPS[i].h[0] && tash < SHOPS[i].h[1];
      el.className = "shop-status " + (open ? "open" : "closed");
      el.lastChild.textContent = window.t(open ? "shops.open" : "shops.closed");
    });
  }, 60000);
  document.addEventListener("langchange", render);
})();
