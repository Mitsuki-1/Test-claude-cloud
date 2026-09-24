/* Каталог: фильтры по категории, полу, размеру, поиск и сортировка. Параметры читаются из URL (?cat=&size=). */
(function () {
  var qs = new URLSearchParams(location.search);
  var st = {
    cat: qs.get("cat") || "all",
    g: qs.get("g") || "all",
    size: qs.get("size") || "all",
    q: "",
    sort: "pop"
  };
  if (st.size !== "all") window.preferredSize = st.size;

  var RANK = { hit: 0, sale: 1, new: 2 };

  function opts(sel, list, cur) {
    sel.innerHTML = list.map(function (o) { return '<option value="' + o[0] + '"' + (o[0] === cur ? " selected" : "") + ">" + o[1] + "</option>"; }).join("");
  }

  function controls() {
    document.getElementById("f-cat").innerHTML = ["all"].concat(window.CATEGORIES, ["fav"]).map(function (c) {
      var n = c === "fav" ? ' <span class="fav-count" hidden></span>' : "";
      return '<button class="chip' + (c === "fav" ? " chip-fav" : "") + (st.cat === c ? " is-on" : "") + '" data-cat="' + c + '">' + window.t("cat." + c) + n + "</button>";
    }).join("");
    opts(document.getElementById("f-g"), [["all", window.t("f.gender") + ": " + window.t("g.all")], ["girl", window.t("g.girl")], ["boy", window.t("g.boy")], ["unisex", window.t("g.unisex")]], st.g);
    opts(document.getElementById("f-size"), [["all", window.t("f.size") + ": " + window.t("f.sizeAll")]].concat(window.SIZES.map(function (s) { return [s.key, window.sizeLabel(s.key)]; })), st.size);
    opts(document.getElementById("f-sort"), [["pop", window.t("s.pop")], ["cheap", window.t("s.cheap")], ["exp", window.t("s.exp")], ["new", window.t("s.new")]], st.sort);
  }

  function list() {
    var q = st.q.trim().toLowerCase();
    var res = window.PRODUCTS.filter(function (p) {
      if (st.cat === "fav") { if (!window.Fav.has(p.id)) return false; }
      else if (st.cat !== "all" && p.cat !== st.cat) return false;
      if (st.g !== "all" && p.g !== st.g && !(p.g === "unisex" && st.g !== "unisex")) return false;
      if (st.size !== "all" && p.sizes.indexOf(st.size) < 0) return false;
      if (q && (p.name.ru + " " + p.name.uz + " " + p.desc.ru + " " + p.desc.uz + " " + p.id).toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
    var r = function (p) { return p.badge in RANK ? RANK[p.badge] : 9; };
    res.sort({
      pop: function (a, b) { return r(a) - r(b); },
      cheap: function (a, b) { return a.price - b.price; },
      exp: function (a, b) { return b.price - a.price; },
      new: function (a, b) { return (b.badge === "new") - (a.badge === "new"); }
    }[st.sort]);
    return res;
  }

  function grid() {
    var res = list();
    document.getElementById("found").textContent = window.t("f.found") + ": " + res.length;
    document.getElementById("grid").innerHTML = res.length ? res.map(window.productCard).join("") :
      '<div class="empty" style="grid-column:1/-1"><div style="font-size:48px">' + (st.cat === "fav" ? "♡" : "🧸") + '</div><p>' + window.t(st.cat === "fav" ? "fav.empty" : "f.none") + '</p><button class="btn btn-ghost" id="f-reset">' + window.t("f.reset") + "</button></div>";
    window.observeReveal && window.observeReveal();
    window.Fav.sync();
  }

  function sync() {
    var p = new URLSearchParams();
    if (st.cat !== "all") p.set("cat", st.cat);
    if (st.g !== "all") p.set("g", st.g);
    if (st.size !== "all") p.set("size", st.size);
    try { history.replaceState(null, "", location.pathname + (p.toString() ? "?" + p : "")); } catch (e) {}
  }

  function update() { controls(); grid(); sync(); }

  document.addEventListener("click", function (e) {
    var c = e.target.closest("[data-cat]");
    if (c) { st.cat = c.dataset.cat; update(); return; }
    if (e.target.closest("#f-reset")) { st = { cat: "all", g: "all", size: "all", q: "", sort: "pop" }; document.getElementById("f-q").value = ""; update(); }
  });
  document.addEventListener("change", function (e) {
    var id = e.target.id;
    if (id === "f-g") st.g = e.target.value;
    else if (id === "f-size") { st.size = e.target.value; window.preferredSize = st.size === "all" ? null : st.size; }
    else if (id === "f-sort") st.sort = e.target.value;
    else return;
    update();
  });
  document.addEventListener("input", function (e) {
    if (e.target.id === "f-q") { st.q = e.target.value; grid(); }
  });
  document.addEventListener("langchange", update);
  document.addEventListener("favchange", function () { if (st.cat === "fav") grid(); });
})();
