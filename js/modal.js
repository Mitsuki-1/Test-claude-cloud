/* Карточка товара во всплывающем окне: выбор размера, количество, добавление в корзину. */
(function () {
  var cur = null, size = null, qty = 1;

  function mount() {
    var m = document.createElement("div");
    m.className = "modal";
    m.id = "pmodal";
    m.setAttribute("role", "dialog");
    m.setAttribute("aria-modal", "true");
    m.innerHTML = '<div class="modal-bg" data-close></div><div class="modal-box"><button class="icon-btn modal-close" data-close aria-label="close">×</button><div class="modal-img"></div><div class="modal-info"></div></div>';
    document.body.appendChild(m);

    m.addEventListener("click", function (e) {
      var t = e.target;
      if (t.closest("[data-close]")) return close();
      var sb = t.closest("[data-size]");
      if (sb) { size = sb.dataset.size; draw(); return; }
      var qb = t.closest("[data-mq]");
      if (qb) { qty = Math.max(1, qty + (+qb.dataset.mq)); draw(); return; }
      if (t.closest("#m-add")) {
        if (!size) {
          var so = m.querySelector(".size-opts");
          so.classList.remove("shake"); void so.offsetWidth; so.classList.add("shake");
          window.toast(window.t("p.pickSize"));
          return;
        }
        window.Cart.add(cur.id, size, qty);
        window.toast(window.t("p.added") + " ✓");
        close();
      }
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    document.addEventListener("click", function (e) {
      var o = e.target.closest("[data-open]");
      if (o && !e.target.closest(".modal")) { e.preventDefault(); open(o.dataset.open); }
    });
    document.addEventListener("langchange", function () { if (cur) draw(); });
  }

  function draw() {
    var m = document.getElementById("pmodal");
    var p = cur;
    m.querySelector(".modal-img").innerHTML = '<img src="' + p.img.replace("w=700", "w=1100") + '" alt="" data-art="' + p.cat + '" data-color="' + p.color + '">';
    m.querySelector(".modal-info").innerHTML =
      (p.badge ? '<span class="badge badge-' + p.badge + '" style="position:static;align-self:flex-start">' + window.t("badge." + p.badge) + "</span>" : "") +
      "<h2>" + window.L(p.name) + "</h2>" +
      '<div class="modal-price">' + window.formatSum(p.price) + (p.old ? "<s>" + window.formatSum(p.old) + "</s>" : "") + "</div>" +
      '<p class="desc">' + window.L(p.desc) + "</p>" +
      '<div><div class="lbl">' + window.t("p.size") + '</div><div class="size-opts">' +
      p.sizes.map(function (s) { return '<button data-size="' + s + '" class="' + (s === size ? "is-on" : "") + '">' + window.sizeLabel(s) + "</button>"; }).join("") +
      "</div></div>" +
      '<div><div class="lbl">' + window.t("p.qty") + '</div><div class="modal-actions"><div class="qty"><button data-mq="-1">−</button><span>' + qty + '</span><button data-mq="1">+</button></div>' +
      '<button class="btn btn-primary" id="m-add"><svg class="i"><use href="#i-bag"/></svg>' + window.t("p.add") + "</button></div></div>" +
      '<div class="opt-note">📦 ' + window.t("p.opt") + "</div>";
  }

  function open(id) {
    cur = window.findProduct(id);
    if (!cur) return;
    qty = 1;
    size = cur.sizes.length === 1 ? cur.sizes[0] : (window.preferredSize && cur.sizes.indexOf(window.preferredSize) > -1 ? window.preferredSize : null);
    draw();
    document.getElementById("pmodal").classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function close() {
    var m = document.getElementById("pmodal");
    if (!m || !m.classList.contains("open")) return;
    m.classList.remove("open");
    document.body.style.overflow = "";
    cur = null;
  }

  window.openProduct = open;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();
})();
