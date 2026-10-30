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
  // Логотипы с официальных сайтов брендов — assets/brands; Leo King и U.S. Polo нарисованы по коробкам и биркам,
  // у брендов без логотипа — набранное название (класс bm-…)
  // w — ширина логотипа в px: подобрана так, чтобы все логотипы выглядели одного «веса» (широкие тонкие — шире, плотные — уже)
  var logo = function (file, name, w) { return '<img src="assets/brands/' + file + '" alt="' + name + '" loading="lazy" style="width:' + w + 'px">'; };
  var LEO =
    '<svg class="lk-crown" viewBox="0 0 28 22" aria-hidden="true"><path fill="currentColor" d="M14.0 0.0 L14.8 2.0 L17.0 2.2 L15.4 3.6 L15.9 5.8 L14.0 4.6 L12.1 5.8 L12.6 3.6 L11.0 2.2 L13.2 2.0Z' +
    'M6.5 3.9 L7.1 5.2 L8.5 5.4 L7.4 6.3 L7.7 7.7 L6.5 6.9 L5.3 7.7 L5.6 6.3 L4.5 5.4 L5.9 5.2ZM21.5 3.9 L22.1 5.2 L23.5 5.4 L22.4 6.3 L22.7 7.7 L21.5 6.9 L20.3 7.7 L20.6 6.3 L19.5 5.4 L20.9 5.2Z' +
    'M5 21h18l1.6-9.2-5.4 3.6L14 8.6l-5.2 6.8-5.4-3.6z"/></svg>' +
    '<span class="lk-word">le<svg class="lk-o" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7.6" fill="none" stroke="currentColor" stroke-width="2.2"/>' +
    '<circle cx="7.4" cy="8.6" r="1.2" fill="currentColor"/><circle cx="12.6" cy="8.6" r="1.2" fill="currentColor"/><path d="M6.8 11.6q3.2 3.4 6.4 0" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>king</span>';
  var BRAND_LOOK = {
    "Caramell": [logo("caramell.png", "Caramell", 116), "caramell"],
    "Leo King": [LEO, "leoking"],
    "U.S. Polo": ["<b>U.S. POLO ASSN.</b><small>SINCE 1890</small><i></i>", "polo"],
    "Atelier Babbi": [logo("atelier-babbi.png", "Atelier Babbi", 124), "img"],
    "BiStyle": ["BİSTYLE", "bistyle"],
    "Sweet Me": [logo("sweet-me.png", "Sweet Me", 84), "img"],
    "Monna Rosa": [logo("monna-rossa.png", "Monna Rosa", 112), "img"],
    "Pamina": [logo("pamina.png", "Pamina", 96), "img"],
    "M&Y Collection": [logo("m-y-collection.png", "M&amp;Y Collection", 78), "img"],
    "Nipperland": [logo("nipperland.svg", "Nipperland", 118), "img"],
    "Free Sure": [logo("free-sure.png", "Free Sure", 116), "img"],
    "Bebus": ["bebus", "bebus"],
    "Puggi": ["puggi", "puggi"],
    "Noynoy": ["noynoy", "noynoy"],
    "Cumino": [logo("cumino.svg", "Cumino", 82), "img"],
    "Anna Baba": ["Anna Baba", "annababa"],
    "Lovemax": ["Lovemax", "lovemax"]
  };
  var slug = function (b) { return b.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); };
  var esc = function (s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); };
  var mark = function (b) { return BRAND_LOOK[b] ? BRAND_LOOK[b][0] : esc(b); };

  // Порядок карточек брендов задан магазином; новые бренды — в конце, по числу товаров
  var ORDER = Object.keys(BRAND_LOOK);
  var BRANDS = (function () {
    var n = {};
    window.PRODUCTS.forEach(function (p) { n[p.brand] = (n[p.brand] || 0) + 1; });
    var pos = function (b) { var i = ORDER.indexOf(b); return i < 0 ? 999 : i; };
    return Object.keys(n).sort(function (a, b) { return pos(a) - pos(b) || n[b] - n[a] || a.localeCompare(b); });
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
