/* Каталог: фильтры по категории, бренду, полу, размеру, поиск и сортировка. Параметры читаются из URL (?cat=&brand=&size=). */
(function () {
  var qs = new URLSearchParams(location.search);
  var st = {
    cat: qs.get("cat") || "all",
    brand: qs.get("brand") || "all",
    g: qs.get("g") || "all",
    size: qs.get("size") || "all",
    q: "",
    sort: "pop"
  };
  if (st.size !== "all") window.preferredSize = st.size;

  var RANK = { hit: 0, sale: 1, new: 2 };

  /* ---------- Бренды ---------- */
  // Знак бренда — набранное название в духе логотипа (класс bm-…), crown/heart — значок над/перед названием
  var CROWN = '<svg class="bm-crown" viewBox="0 0 24 14" aria-hidden="true"><path fill="currentColor" d="M2 13h20l1.6-9.5-6.1 4.2L12 0l-5.5 7.7L.4 3.5z"/></svg>';
  var BRAND_LOOK = {
    "Caramell": ['<svg class="bm-heart" aria-hidden="true"><use href="#i-logo"/></svg>Caramell', "caramell"],
    "Leo King": [CROWN + "leoking", "leoking"],
    "U.S. Polo": ["U.S. POLO ASSN.", "polo"],
    "Sweet Me": ["Sweet Me", "sweetme"],
    "Monna Rossa": ["Monna Rossa", "monna"],
    "Atelier Babbi": ["<small>atelier</small>BABBI", "babbi"],
    "Pamina": ["PAMINA", "pamina"],
    "Nipperland": ["nipperland", "nipper"],
    "BiStyle": ["Bi<i>Style</i>", "bistyle"],
    "Free Sure": ["FREE SURE", "freesure"],
    "M&Y Collection": ["M&amp;Y<small>collection</small>", "my"],
    "Puggi": ["puggi", "puggi"],
    "Noynoy": ["noynoy", "noynoy"],
    "Bebus": ["bebus", "bebus"],
    "Cumino": ["Cumino", "cumino"]
  };
  var slug = function (b) { return b.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); };
  var esc = function (s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); };
  var mark = function (b) { return BRAND_LOOK[b] ? BRAND_LOOK[b][0] : esc(b); };

  // Все бренды каталога: Caramell первым, дальше — по числу товаров
  var BRANDS = (function () {
    var n = {};
    window.PRODUCTS.forEach(function (p) { n[p.brand] = (n[p.brand] || 0) + 1; });
    return Object.keys(n).sort(function (a, b) { return (b === "Caramell") - (a === "Caramell") || n[b] - n[a] || a.localeCompare(b); });
  })();
  var brandName = function (s) { return BRANDS.filter(function (b) { return slug(b) === s; })[0] || null; };
  if (st.brand !== "all" && !brandName(st.brand)) st.brand = "all";

  function opts(sel, list, cur) {
    sel.innerHTML = list.map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === cur ? " selected" : "") + ">" + o[1] + "</option>"; }).join("");
  }

  function match(p, skipBrand) {
    if (st.cat === "fav") { if (!window.Fav.has(p.id)) return false; }
    else if (st.cat !== "all" && p.cat !== st.cat) return false;
    if (!skipBrand && st.brand !== "all" && slug(p.brand) !== st.brand) return false;
    if (st.g !== "all" && p.g !== st.g && !(p.g === "unisex" && st.g !== "unisex")) return false;
    if (st.size !== "all" && p.sizes.indexOf(st.size) < 0) return false;
    var q = st.q.trim().toLowerCase();
    if (q && (p.name.ru + " " + p.name.uz + " " + p.desc.ru + " " + p.desc.uz + " " + p.brand + " " + p.id).toLowerCase().indexOf(q) < 0) return false;
    return true;
  }

  // Карточки брендов: сколько товаров каждого бренда при остальных выбранных фильтрах
  function brands() {
    var n = {}, all = 0;
    window.PRODUCTS.forEach(function (p) { if (match(p, true)) { n[p.brand] = (n[p.brand] || 0) + 1; all++; } });
    var card = function (key, inner, count, cls) {
      return '<button class="brand' + (cls ? " " + cls : "") + (st.brand === key ? " is-on" : "") + '" data-brand="' + key + '" aria-pressed="' + (st.brand === key) + '">' +
        '<span class="bm">' + inner + "</span><small>" + window.itemsLabel(count) + "</small></button>";
    };
    document.getElementById("f-brands").innerHTML =
      card("all", '<span class="bm-all">' + window.t("f.brandAll") + "</span>", all, "brand-all") +
      BRANDS.filter(function (b) { return n[b] || st.brand === slug(b); }).map(function (b) {
        return card(slug(b), mark(b), n[b] || 0, "bm-" + (BRAND_LOOK[b] ? BRAND_LOOK[b][1] : "other") + (b === "Caramell" ? " brand-own" : ""));
      }).join("");
    var on = document.querySelector("#f-brands .is-on");
    if (on && !brands.done) {  // бренд из ссылки — прокрутить ленту к нему
      var box = on.parentNode;
      box.scrollLeft = on.offsetLeft - (box.clientWidth - on.offsetWidth) / 2;
    }
    brands.done = true;
  }

  function controls() {
    document.getElementById("f-cat").innerHTML = ["all"].concat(window.CATEGORIES, ["fav"]).map(function (c) {
      var n = c === "fav" ? ' <span class="fav-count" hidden></span>' : "";
      return '<button class="chip' + (c === "fav" ? " chip-fav" : "") + (st.cat === c ? " is-on" : "") + '" data-cat="' + c + '">' + window.t("cat." + c) + n + "</button>";
    }).join("");
    opts(document.getElementById("f-brand"), [["all", window.t("f.brand") + ": " + window.t("g.all")]].concat(BRANDS.map(function (b) { return [slug(b), esc(b)]; })), st.brand);
    opts(document.getElementById("f-g"), [["all", window.t("f.gender") + ": " + window.t("g.all")], ["girl", window.t("g.girl")], ["boy", window.t("g.boy")], ["unisex", window.t("g.unisex")]], st.g);
    opts(document.getElementById("f-size"), [["all", window.t("f.size") + ": " + window.t("f.sizeAll")]].concat(window.SIZES.map(function (s) { return [s.key, window.sizeLabel(s.key)]; })), st.size);
    opts(document.getElementById("f-sort"), [["pop", window.t("s.pop")], ["cheap", window.t("s.cheap")], ["exp", window.t("s.exp")], ["new", window.t("s.new")]], st.sort);
    document.getElementById("f-brand").classList.toggle("is-set", st.brand !== "all");
    brands();
  }

  function list() {
    var res = window.PRODUCTS.filter(function (p) { return match(p); });
    var r = function (p) { return p.badge in RANK ? RANK[p.badge] : 9; };
    res.sort({
      pop: function (a, b) { return r(a) - r(b); },
      cheap: function (a, b) { return a.price - b.price; },
      exp: function (a, b) { return b.price - a.price; },
      new: function (a, b) { return (b.badge === "new") - (a.badge === "new"); }
    }[st.sort]);
    return res;
  }

  var PAGE = 48, shown = 0, current = [];

  function more() {
    var g = document.getElementById("grid");
    var next = current.slice(shown, shown + PAGE);
    var old = document.getElementById("f-more");
    if (old) old.parentNode.removeChild(old);
    g.insertAdjacentHTML("beforeend", next.map(window.productCard).join(""));
    shown += next.length;
    if (shown < current.length) {
      g.insertAdjacentHTML("beforeend", '<div class="more-wrap" id="f-more"><button class="btn btn-ghost">' + window.t("f.more") + "</button><small>" +
        window.t("f.shown") + " " + shown + " / " + current.length + "</small></div>");
    }
    window.observeReveal && window.observeReveal();
    window.Fav.sync();
  }

  function grid() {
    current = list();
    shown = 0;
    document.getElementById("found").textContent = window.t("f.found") + ": " + current.length;
    var g = document.getElementById("grid");
    g.innerHTML = current.length ? "" :
      '<div class="empty" style="grid-column:1/-1"><div style="font-size:48px">' + (st.cat === "fav" ? "♡" : "🧸") + '</div><p>' + window.t(st.cat === "fav" ? "fav.empty" : "f.none") + '</p><button class="btn btn-ghost" id="f-reset">' + window.t("f.reset") + "</button></div>";
    if (current.length) more();
  }

  function sync() {
    var p = new URLSearchParams();
    if (st.cat !== "all") p.set("cat", st.cat);
    if (st.brand !== "all") p.set("brand", st.brand);
    if (st.g !== "all") p.set("g", st.g);
    if (st.size !== "all") p.set("size", st.size);
    try { history.replaceState(null, "", location.pathname + (p.toString() ? "?" + p : "")); } catch (e) {}
  }

  // После смены фильтра — к началу списка, если он уже прокручен (сразу под панелью фильтров)
  function toTop() {
    var f = document.getElementById("filters");
    var top = document.getElementById("found").getBoundingClientRect().top + window.scrollY - (parseFloat(getComputedStyle(f).top) || 0) - f.offsetHeight - 12;
    if (window.scrollY > top) window.scrollTo({ top: top, behavior: "smooth" });
  }

  function update() { controls(); grid(); sync(); }

  document.addEventListener("click", function (e) {
    var c = e.target.closest("[data-cat]");
    if (c) { st.cat = c.dataset.cat; update(); toTop(); return; }
    var b = e.target.closest("[data-brand]");
    if (b) { st.brand = st.brand === b.dataset.brand ? "all" : b.dataset.brand; update(); toTop(); return; }
    if (e.target.closest("#f-more")) { more(); return; }
    if (e.target.closest("#f-reset")) { st = { cat: "all", brand: "all", g: "all", size: "all", q: "", sort: "pop" }; document.getElementById("f-q").value = ""; update(); }
  });
  document.addEventListener("change", function (e) {
    var id = e.target.id;
    if (id === "f-brand") st.brand = e.target.value;
    else if (id === "f-g") st.g = e.target.value;
    else if (id === "f-size") { st.size = e.target.value; window.preferredSize = st.size === "all" ? null : st.size; }
    else if (id === "f-sort") st.sort = e.target.value;
    else return;
    update();
    toTop();
  });
  document.addEventListener("input", function (e) {
    if (e.target.id === "f-q") { st.q = e.target.value; brands(); grid(); }
  });
  document.addEventListener("langchange", update);
  document.addEventListener("favchange", function () { if (st.cat === "fav") { brands(); grid(); } });

  /* ---------- Панель фильтров: прячется при прокрутке вниз, возвращается при прокрутке вверх ---------- */
  var filters = document.getElementById("filters");
  var lastY = window.scrollY, hdr = 0;
  function headerH() {
    var h = document.querySelector(".site-header");
    hdr = h ? h.offsetHeight : 0;
    document.documentElement.style.setProperty("--hdr-h", hdr + "px");
  }
  function onScroll() {
    var y = window.scrollY, dy = y - lastY;
    var stuck = y > 0 && filters.getBoundingClientRect().top <= hdr + 1;
    filters.classList.toggle("is-stuck", stuck);
    var typing = document.activeElement && document.activeElement.id === "f-q";
    if (!stuck || y < 80 || document.body.classList.contains("menu-open") || typing) document.body.classList.remove("bars-hidden");
    else if (dy > 6) document.body.classList.add("bars-hidden");
    else if (dy < -6) document.body.classList.remove("bars-hidden");
    if (Math.abs(dy) > 6) lastY = y;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", headerH);
  document.addEventListener("DOMContentLoaded", headerH);
  window.addEventListener("load", headerH);
})();
