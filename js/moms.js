/* Раздел «Мамам»: калькулятор размера, чек-лист в роддом, подбор подарка, советы. */
(function () {
  var SIZES = window.SIZES;

  /* ---------- Калькулятор размера ---------- */
  var lastCalc = null;

  function idxBy(val, prop) {
    for (var i = 0; i < SIZES.length; i++) if (val < SIZES[i][prop][1]) return i;
    return SIZES.length - 1;
  }

  function calc() {
    var num = function (id) { var v = parseFloat(String(document.getElementById(id).value).replace(",", ".")); return isNaN(v) ? null : v; };
    var age = num("s-age"), h = num("s-h"), w = num("s-w");
    if (age === null && h === null && w === null) { lastCalc = { empty: true }; return drawCalc(); }
    var cands = [], near = false;
    if (h !== null) { var i = idxBy(h, "h"); cands.push(i); if (SIZES[i].h[1] - h <= 2) near = true; }
    if (w !== null) cands.push(idxBy(w, "w"));
    if (age !== null) cands.push(idxBy(age, "a"));
    var main = Math.max.apply(null, cands);            // при расхождении берём больший — вещь не будет мала
    if (h !== null && near && main === idxBy(h, "h")) main = Math.min(main + 1, SIZES.length - 1);
    lastCalc = { idx: main, near: near };
    drawCalc();
  }

  function drawCalc() {
    var box = document.getElementById("size-res");
    var table = document.getElementById("size-table");
    var idx = lastCalc && !lastCalc.empty ? lastCalc.idx : -1;
    table.innerHTML = "<tr><th>" + window.t("size.col.size") + "</th><th>" + window.t("size.col.h") + "</th><th>" + window.t("size.col.w") + "</th></tr>" +
      SIZES.map(function (s, i) { return '<tr class="' + (i === idx ? "hl" : "") + '"><td>' + window.sizeLabel(s.key) + "</td><td>" + s.h[0] + "–" + s.h[1] + "</td><td>" + s.w[0] + "–" + s.w[1] + "</td></tr>"; }).join("");
    if (!lastCalc) { box.innerHTML = '<div class="ph">👶</div>'; return; }
    if (lastCalc.empty) { box.innerHTML = '<div class="ph">👶</div><p style="text-align:center">' + window.t("size.need") + "</p>"; return; }
    var s = SIZES[idx], next = SIZES[idx + 1];
    box.innerHTML = '<p>' + window.t("size.res") + '</p><div class="big">' + window.sizeLabel(s.key) + "</div>" +
      "<p>" + window.t("size.col.h") + ": " + s.h[0] + "–" + s.h[1] + " · " + window.t("size.col.w") + ": " + s.w[0] + "–" + s.w[1] + "</p>" +
      (next ? "<p>" + window.t(lastCalc.near ? "size.tip.up" : "size.tip.ok") + ' <span class="alt">' + window.sizeLabel(lastCalc.near ? s.key : next.key) + "</span></p>" : "") +
      '<a class="btn btn-primary" style="align-self:flex-start;margin-top:8px" href="catalog.html?size=' + s.key + '">' + window.t("size.show") + '<svg class="i"><use href="#i-arrow"/></svg></a>';
  }

  document.getElementById("size-form").addEventListener("submit", function (e) { e.preventDefault(); calc(); });

  /* ---------- Чек-лист ---------- */
  var CHECK = [
    ["cg.baby", [["b1", "bodysuits"], ["b2", "bodysuits"], ["b3", "newborn"], ["b4", "newborn"], ["b5"], ["b6"], ["b7"], ["b8"]]],
    ["cg.mom", [["m1"], ["m2"], ["m3"], ["m4"], ["m5"], ["m6"], ["m7"]]],
    ["cg.docs", [["d1"], ["d2"], ["d3"], ["d4"]]],
    ["cg.out", [["o1", "discharge"], ["o2", "discharge"], ["o3"], ["o4"]]]
  ];
  var CK = "caramell_checklist";
  var done = {};
  try { done = JSON.parse(localStorage.getItem(CK) || "{}") || {}; } catch (e) { done = {}; }
  var total = CHECK.reduce(function (s, g) { return s + g[1].length; }, 0);

  function drawCheck() {
    document.getElementById("check-groups").innerHTML = CHECK.map(function (g) {
      return '<div class="check-group"><h3>' + window.t(g[0]) + "</h3>" + g[1].map(function (it) {
        return '<label class="check-item"><input type="checkbox" data-ck="' + it[0] + '"' + (done[it[0]] ? " checked" : "") + '><span class="box"><svg class="i"><use href="#i-check"/></svg></span>' +
          '<span class="txt">' + window.t("ci." + it[0]) + "</span>" +
          (it[1] ? '<a class="buy" href="catalog.html?cat=' + it[1] + '">' + window.t("check.buy") + "</a>" : "") + "</label>";
      }).join("") + "</div>";
    }).join("");
    progress();
  }

  function progress() {
    var n = Object.keys(done).filter(function (k) { return done[k]; }).length;
    document.getElementById("check-bar").style.width = Math.round(n / total * 100) + "%";
    document.getElementById("check-count").textContent = n + " / " + total + " " + window.t("check.done");
  }

  document.getElementById("check-groups").addEventListener("change", function (e) {
    var k = e.target.dataset.ck;
    if (!k) return;
    done[k] = e.target.checked;
    try { localStorage.setItem(CK, JSON.stringify(done)); } catch (er) {}
    progress();
  });
  document.getElementById("check-reset").addEventListener("click", function () {
    done = {};
    try { localStorage.removeItem(CK); } catch (e) {}
    drawCheck();
  });

  /* ---------- Подбор подарка ---------- */
  var AGE = {
    new: ["0-3m"],
    baby: ["0-3m", "3-6m", "6-9m", "9-12m"],
    tod: ["12-18m", "18-24m", "2-3y"],
    kid: ["3-4y", "4-5y", "5-6y", "6-7y", "7-8y"]
  };
  var BUDGET = { b1: 300000, b2: 600000, b3: 1500000 };
  var quiz = { g: null, a: null, b: null };
  var sets = null;

  function drawQuiz() {
    var q = function (n, key, name, options) {
      return '<div class="quiz-q"><div class="lbl"><span>' + window.t("gift.step") + " " + n + "/3 · </span>" + window.t(key) + '</div><div class="opts">' +
        options.map(function (o) { return '<button data-gq="' + name + '" data-v="' + o[0] + '" class="' + (quiz[name] === o[0] ? "is-on" : "") + '">' + o[1] + "</button>"; }).join("") + "</div></div>";
    };
    document.getElementById("gift-quiz").innerHTML =
      q(1, "gift.q1", "g", [["girl", "👧 " + window.t("g.girl")], ["boy", "👦 " + window.t("g.boy")], ["unisex", "🤍 " + window.t("g.unisex")]]) +
      q(2, "gift.q2", "a", [["new", window.t("gift.a.new")], ["baby", window.t("gift.a.baby")], ["tod", window.t("gift.a.tod")], ["kid", window.t("gift.a.kid")]]) +
      q(3, "gift.q3", "b", [["b1", window.t("gift.b1") + " " + window.t("sum")], ["b2", window.t("gift.b2") + " " + window.t("sum")], ["b3", window.t("gift.b3") + " " + window.t("sum")]]) +
      '<button class="btn btn-primary" id="gift-go"' + (quiz.g && quiz.a && quiz.b ? "" : " disabled style=\"opacity:.45;pointer-events:none\"") + ">🎁 " + window.t("gift.go") + "</button>";
  }

  function build() {
    var sizes = AGE[quiz.a], max = BUDGET[quiz.b];
    var fit = function (p) { for (var i = 0; i < sizes.length; i++) if (p.sizes.indexOf(sizes[i]) > -1) return sizes[i]; return null; };
    var cands = window.PRODUCTS.filter(function (p) {
      return fit(p) && (quiz.g === "unisex" ? p.g === "unisex" : (p.g === quiz.g || p.g === "unisex"));
    }).sort(function (a, b) { return (b.badge === "hit") - (a.badge === "hit") || b.price - a.price; });

    var out = [], seen = {};
    cands.forEach(function (seed) {
      if (out.length >= 3 || seed.price > max) return;
      var set = [seed], sum = seed.price, cats = {};
      cats[seed.cat] = 1;
      cands.forEach(function (p) {
        if (set.length >= 3 || cats[p.cat] || sum + p.price > max) return;
        set.push(p); sum += p.price; cats[p.cat] = 1;
      });
      var key = set.map(function (p) { return p.id; }).sort().join();
      if (seen[key]) return;
      seen[key] = 1;
      out.push({ items: set.map(function (p) { return { p: p, size: fit(p) }; }), sum: sum });
    });
    sets = out;
    drawSets();
  }

  function drawSets() {
    var el = document.getElementById("gift-res");
    if (!sets) { el.innerHTML = ""; return; }
    if (!sets.length) {
      el.innerHTML = '<div class="empty"><p>' + window.t("gift.none") + '</p><a class="btn btn-tg" href="' + window.CONTACT.tg + '" target="_blank" rel="noopener">' + window.t("cta.telegram") + "</a></div>";
      return;
    }
    el.innerHTML = '<h3 style="font-size:28px;margin-top:36px">' + window.t("gift.res") + '</h3><div class="gift-sets">' + sets.map(function (s, i) {
      return '<div class="gift-set"><h4>' + window.t("gift.set") + " №" + (i + 1) + '</h4><div class="gift-thumbs">' +
        s.items.map(function (it) { return '<img src="' + it.p.img + '" alt="" data-art="' + it.p.cat + '" data-color="' + it.p.color + '" loading="lazy">'; }).join("") +
        "</div><ul>" + s.items.map(function (it) { return "<li>" + window.L(it.p.name) + " · " + window.sizeLabel(it.size) + "</li>"; }).join("") + "</ul>" +
        '<div class="sum">' + window.formatSum(s.sum) + '</div><button class="btn btn-primary" data-addset="' + i + '"><svg class="i"><use href="#i-bag"/></svg>' + window.t("gift.addAll") + "</button></div>";
    }).join("") + "</div>";
    window.observeReveal && window.observeReveal();
  }

  document.getElementById("gift").addEventListener("click", function (e) {
    var b = e.target.closest("[data-gq]");
    if (b) { quiz[b.dataset.gq] = b.dataset.v; drawQuiz(); return; }
    if (e.target.closest("#gift-go")) { build(); document.getElementById("gift-res").scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    var a = e.target.closest("[data-addset]");
    if (a) {
      sets[+a.dataset.addset].items.forEach(function (it) { window.Cart.add(it.p.id, it.size, 1); });
      window.toast(window.t("p.added") + " ✓");
      window.Cart.open();
    }
  });

  /* ---------- Советы ---------- */
  function drawTips() {
    var html = "";
    for (var i = 1; i <= 6; i++) html += "<details" + (i === 1 ? " open" : "") + "><summary>" + window.t("tip" + i + ".t") + "</summary><p>" + window.t("tip" + i + ".b") + "</p></details>";
    document.getElementById("tips-acc").innerHTML = html;
  }

  document.addEventListener("langchange", function () { drawCalc(); drawCheck(); drawQuiz(); drawSets(); drawTips(); });
})();
