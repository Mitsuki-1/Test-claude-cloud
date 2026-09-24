/* Корзина: хранится в localStorage, заказ уходит в Telegram готовым сообщением. */
(function () {
  var KEY = "caramell_cart";
  var PHONE = "+998777039494";
  var TG_USER = "Caramell_Uzbekistan";
  var items = [];
  try { items = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { items = []; }
  items = items.filter(function (i) { return window.findProduct(i.id); });

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {}
    render();
  }

  function count() { return items.reduce(function (s, i) { return s + i.qty; }, 0); }
  function total() { return items.reduce(function (s, i) { return s + window.findProduct(i.id).price * i.qty; }, 0); }

  function orderText() {
    var lines = [window.t("cart.msg"), ""];
    items.forEach(function (i, n) {
      var p = window.findProduct(i.id);
      lines.push((n + 1) + ". " + window.L(p.name) + " (" + p.id.toUpperCase() + ")");
      lines.push("   " + window.t("cart.size") + ": " + window.sizeLabel(i.size) + " · " + i.qty + " " + window.t("cart.pcs") + " · " + window.formatSum(p.price * i.qty));
    });
    lines.push("", window.t("cart.total") + ": " + window.formatSum(total()));
    return lines.join("\n");
  }

  var Cart = {
    add: function (id, size, qty) {
      qty = qty || 1;
      var ex = items.find(function (i) { return i.id === id && i.size === size; });
      if (ex) ex.qty += qty; else items.push({ id: id, size: size, qty: qty });
      save();
      bump();
    },
    set: function (idx, qty) {
      if (qty <= 0) items.splice(idx, 1); else items[idx].qty = qty;
      save();
    },
    open: function () { document.body.classList.add("cart-open"); render(); },
    close: function () { document.body.classList.remove("cart-open"); },
    telegramUrl: function () { return "https://t.me/" + TG_USER + "?text=" + encodeURIComponent(orderText()); },
    orderText: orderText,
    count: count
  };
  window.Cart = Cart;

  function bump() {
    document.querySelectorAll(".cart-count").forEach(function (el) {
      el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump");
    });
  }

  function render() {
    var c = count();
    document.querySelectorAll(".cart-count").forEach(function (el) { el.textContent = c; el.hidden = !c; });
    var body = document.getElementById("cart-body");
    if (!body) return;
    if (!items.length) {
      body.innerHTML = '<div class="cart-empty"><div class="cart-empty-ico">🧸</div><p>' + window.t("cart.empty") + '</p><a class="btn btn-primary" href="catalog.html">' + window.t("cta.catalog") + "</a></div>";
      document.getElementById("cart-foot").hidden = true;
      return;
    }
    document.getElementById("cart-foot").hidden = false;
    body.innerHTML = items.map(function (i, idx) {
      var p = window.findProduct(i.id);
      return '<div class="cart-item">' +
        '<img src="' + p.img + '" alt="" data-art="' + p.cat + '" data-color="' + p.color + '">' +
        '<div class="ci-info"><div class="ci-name">' + window.L(p.name) + '</div>' +
        '<div class="ci-meta">' + window.t("cart.size") + ": " + window.sizeLabel(i.size) + "</div>" +
        '<div class="ci-row"><div class="qty"><button data-cq="' + idx + '" data-d="-1" aria-label="−">−</button><span>' + i.qty + '</span><button data-cq="' + idx + '" data-d="1" aria-label="+">+</button></div>' +
        '<b>' + window.formatSum(p.price * i.qty) + "</b></div></div>" +
        '<button class="ci-del" data-del="' + idx + '" aria-label="' + window.t("cart.remove") + '">×</button></div>';
    }).join("");
    document.getElementById("cart-total").textContent = window.formatSum(total());
    document.getElementById("cart-tg").href = Cart.telegramUrl();
  }

  function mount() {
    var el = document.createElement("div");
    el.innerHTML =
      '<div class="cart-backdrop" data-cart-close></div>' +
      '<aside class="cart-drawer" aria-label="Cart">' +
      '<div class="cart-head"><h3 data-i18n="cart.title"></h3><button class="icon-btn" data-cart-close aria-label="close">×</button></div>' +
      '<div class="cart-body" id="cart-body"></div>' +
      '<div class="cart-foot" id="cart-foot">' +
      '<div class="cart-total"><span data-i18n="cart.total"></span><b id="cart-total"></b></div>' +
      '<a class="btn btn-tg btn-block" id="cart-tg" target="_blank" rel="noopener"><svg class="i"><use href="#i-tg"/></svg><span data-i18n="cart.tg"></span></a>' +
      '<div class="cart-2"><a class="btn btn-ghost" href="tel:' + PHONE + '"><svg class="i"><use href="#i-phone"/></svg><span data-i18n="cart.call"></span></a>' +
      '<button class="btn btn-ghost" id="cart-copy"><span data-i18n="cart.copy"></span></button></div>' +
      '<p class="cart-note" data-i18n="cart.note"></p></div></aside>';
    while (el.firstChild) document.body.appendChild(el.firstChild);

    document.addEventListener("click", function (e) {
      var t = e.target.closest("[data-cart-open],[data-cart-close],[data-cq],[data-del],#cart-copy");
      if (!t) return;
      if (t.hasAttribute("data-cart-open")) { e.preventDefault(); Cart.open(); }
      else if (t.hasAttribute("data-cart-close")) Cart.close();
      else if (t.dataset.cq) { var i = +t.dataset.cq; Cart.set(i, items[i].qty + (+t.dataset.d)); }
      else if (t.dataset.del) Cart.set(+t.dataset.del, 0);
      else if (t.id === "cart-copy") {
        var done = function () { window.toast && window.toast(window.t("cart.copied")); };
        if (navigator.clipboard) navigator.clipboard.writeText(orderText()).then(done, done); else done();
      }
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") Cart.close(); });
    document.addEventListener("langchange", render);
    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();
})();
