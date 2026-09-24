/* Общие элементы: иконки, шапка, подвал, мобильная навигация, анимации, тосты. */
(function () {
  var CONTACT = {
    phone: "+998777039494",
    phoneText: "+998 (77) 703 94 94",
    tg: "https://t.me/Caramell_Uzbekistan",
    tgUser: "@Caramell_Uzbekistan",
    channel: "https://t.me/Caramelluz",
    taplink: "https://taplink.cc/caramell_uzbekistan"
  };
  window.CONTACT = CONTACT;

  var S = function (id, body) { return '<symbol id="' + id + '" viewBox="0 0 24 24">' + body + "</symbol>"; };
  var STROKE = 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
  var SPRITE =
    '<svg width="0" height="0" style="position:absolute" aria-hidden="true">' +
    S("i-tg", '<path fill="currentColor" d="M21.9 4.3 18.6 20c-.2 1.1-.9 1.4-1.8.9l-5-3.7-2.4 2.3c-.3.3-.5.5-1 .5l.4-5.1 9.2-8.3c.4-.4-.1-.6-.6-.2L6 13.6l-4.9-1.5c-1.1-.3-1.1-1.1.2-1.6l19.2-7.4c.9-.3 1.7.2 1.4 1.2z"/>') +
    S("i-phone", '<path fill="currentColor" d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2z"/>') +
    S("i-bag", '<path ' + STROKE + ' d="M5 8h14l-1.2 11.1A2 2 0 0 1 15.8 21H8.2a2 2 0 0 1-2-1.9L5 8zm4 0V6.5a3 3 0 0 1 6 0V8"/>') +
    S("i-link", '<path ' + STROKE + ' d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>') +
    S("i-menu", '<path ' + STROKE + ' d="M4 7h16M4 12h16M4 17h10"/>') +
    S("i-arrow", '<path ' + STROKE + ' d="M5 12h14m-5-5 5 5-5 5"/>') +
    S("i-check", '<path fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" d="m5 12.5 4.5 4.5L19 7.5"/>') +
    S("i-heart", '<path ' + STROKE + ' d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z"/>') +
    S("i-play", '<path fill="currentColor" d="M8 5.5v13a1 1 0 0 0 1.5.9l10.4-6.5a1 1 0 0 0 0-1.8L9.5 4.6A1 1 0 0 0 8 5.5z"/>') +
    S("i-pin", '<path ' + STROKE + ' d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3" ' + STROKE + '/>') +
    S("i-clock", '<circle cx="12" cy="12" r="8.5" ' + STROKE + '/><path ' + STROKE + ' d="M12 7.5V12l3 2"/>') +
    S("i-home", '<path ' + STROKE + ' d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z"/>') +
    S("i-grid", '<path ' + STROKE + ' d="M4.5 4.5h6v6h-6zm9 0h6v6h-6zm-9 9h6v6h-6zm9 0h6v6h-6z"/>') +
    S("i-sound", '<path ' + STROKE + ' d="M4 9.5h3.5L12 5.5v13l-4.5-4H4zM16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/>') +
    S("i-mute", '<path ' + STROKE + ' d="M4 9.5h3.5L12 5.5v13l-4.5-4H4zM16.5 9.5l5 5m0-5-5 5"/>') +
    '<symbol id="i-logo" viewBox="0 0 48 48"><path fill="currentColor" d="M24 15.5c-1-4-4.4-6.6-8.3-6.3-4.6.3-8 4.2-7.6 8.8.5 6.4 8.8 12.9 15.9 17.6 7.1-4.7 15.4-11.2 15.9-17.6.4-4.6-3-8.5-7.6-8.8-3.9-.3-7.3 2.3-8.3 6.3z"/></symbol>' +
    "</svg>";

  var page = document.body.dataset.page || "";
  var LOGO = '<svg class="logo-mark"><use href="#i-logo"/></svg><span class="logo-text"><span class="logo-word">Caramell</span><span class="logo-sub">UZBEKISTAN</span></span>';

  function navLink(href, key, id) {
    return '<a href="' + href + '" class="' + (page === id ? "is-active" : "") + '" data-i18n="' + key + '"></a>';
  }

  var TOPBAR =
    '<div class="topbar"><div class="topbar-track">' +
    ['top.1', 'top.2', 'top.3', 'top.1', 'top.2', 'top.3'].map(function (k, i) { return '<span data-i18n="' + k + '"' + (i > 2 ? ' aria-hidden="true"' : "") + "></span>"; }).join("") +
    '<a href="tel:' + CONTACT.phone + '">📞 ' + CONTACT.phoneText + "</a></div></div>";

  var HEADER =
    '<div class="scroll-progress" aria-hidden="true"><i></i></div>' +
    '<header class="site-header' + (page === "home" ? " is-over" : "") + '">' + TOPBAR +
    '<div class="container header-in">' +
    '<a href="index.html" class="logo" aria-label="Caramell">' + LOGO + "</a>" +
    '<nav class="main-nav">' +
    navLink("index.html", "nav.home", "home") + navLink("catalog.html", "nav.catalog", "catalog") + navLink("moms.html", "nav.moms", "moms") +
    '<a href="index.html#wholesale" data-i18n="nav.wholesale"></a><a href="#contacts" data-i18n="nav.contacts"></a></nav>' +
    '<div class="header-act">' +
    '<div class="lang"><button data-lang="ru">RU</button><button data-lang="uz">UZ</button></div>' +
    '<a class="icon-btn hide-sm" href="tel:' + CONTACT.phone + '" aria-label="phone"><svg class="i"><use href="#i-phone"/></svg></a>' +
    '<a class="icon-btn hide-sm" href="catalog.html?cat=fav" aria-label="favorites"><svg class="i"><use href="#i-heart"/></svg><span class="fav-count" hidden>0</span></a>' +
    '<button class="icon-btn cart-btn" data-cart-open aria-label="cart"><svg class="i"><use href="#i-bag"/></svg><span class="cart-count" hidden>0</span></button>' +
    '<button class="icon-btn menu-btn" aria-label="menu"><svg class="i"><use href="#i-menu"/></svg></button>' +
    "</div></div></header>";

  function tab(href, icon, key, id, extra) {
    return '<a href="' + href + '" class="' + (page === id ? "is-active" : "") + '"' + (extra || "") + '><span class="tab-ico"><svg class="i"><use href="#' + icon + '"/></svg>' +
      (icon === "i-heart" ? '<span class="fav-count" hidden></span>' : icon === "i-bag" ? '<span class="cart-count" hidden></span>' : "") +
      '</span><span data-i18n="' + key + '"></span></a>';
  }

  var TABBAR =
    '<nav class="tabbar" aria-label="mobile">' +
    tab("index.html", "i-home", "nav.home", "home") +
    tab("catalog.html", "i-grid", "nav.catalog", "catalog") +
    tab("catalog.html?cat=fav", "i-heart", "fav.title", "fav") +
    tab("#", "i-bag", "nav.cart", "cart", " data-cart-open") +
    tab(CONTACT.tg, "i-tg", "nav.tg", "tg", ' target="_blank" rel="noopener"') +
    "</nav>";

  var FOOTER =
    '<footer class="site-footer" id="contacts"><div class="container">' +
    '<div class="footer-big" aria-hidden="true">Caramell</div>' +
    '<div class="footer-grid">' +
    '<div><div class="logo logo-light">' + LOGO + "</div>" +
    '<p class="footer-tag" data-i18n="footer.tag"></p></div>' +
    '<div class="footer-col"><h4 data-i18n="contact.phone"></h4><a href="tel:' + CONTACT.phone + '">' + CONTACT.phoneText + "</a>" +
    '<h4 data-i18n="contact.tg"></h4><a href="' + CONTACT.tg + '" target="_blank" rel="noopener">' + CONTACT.tgUser + "</a></div>" +
    '<div class="footer-col"><h4 data-i18n="contact.channel"></h4><a href="' + CONTACT.channel + '" target="_blank" rel="noopener">t.me/Caramelluz</a>' +
    '<h4 data-i18n="contact.links"></h4><a href="' + CONTACT.taplink + '" target="_blank" rel="noopener">taplink.cc/caramell_uzbekistan</a></div>' +
    '<div class="footer-col"><h4>Caramell</h4>' + navLink("catalog.html", "nav.catalog", "") + navLink("moms.html", "nav.moms", "") +
    '<a href="index.html#wholesale" data-i18n="nav.wholesale"></a></div>' +
    "</div>" +
    '<div class="footer-bottom"><span>© ' + new Date().getFullYear() + ' Caramell Uzbekistan. <span data-i18n="footer.rights"></span></span><span>🇹🇷 Made in Türkiye · 🇺🇿 Official in Uzbekistan</span></div>' +
    "</div></footer>" +
    '<a class="float-tg" href="' + CONTACT.tg + '" target="_blank" rel="noopener" aria-label="Telegram"><svg class="i"><use href="#i-tg"/></svg></a>' +
    TABBAR +
    '<div class="toast" id="toast" role="status"></div>';

  window.toast = function (msg) {
    var el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.classList.remove("show"); }, 2200);
  };

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.reducedMotion = reduced;

  window.flyToCart = function (from) {
    if (reduced || !from) return;
    var targets = Array.prototype.filter.call(document.querySelectorAll("[data-cart-open]"), function (el) { return el.offsetParent !== null; });
    var to = targets[targets.length - 1];
    if (!to) return;
    var a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
    var g = document.createElement("div");
    g.className = "fly-ghost";
    if (from.tagName === "IMG") g.style.backgroundImage = "url('" + from.currentSrc + "')";
    var s = Math.min(a.width, a.height, 140);
    g.style.cssText += ";left:" + (a.left + a.width / 2 - s / 2) + "px;top:" + (a.top + a.height / 2 - s / 2) + "px;width:" + s + "px;height:" + s + "px";
    document.body.appendChild(g);
    var dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
    g.animate([
      { transform: "translate(0,0) scale(1)", opacity: 1 },
      { transform: "translate(" + dx * 0.5 + "px," + (dy * 0.5 - 120) + "px) scale(.55)", opacity: 1, offset: 0.55 },
      { transform: "translate(" + dx + "px," + dy + "px) scale(.12)", opacity: .2 }
    ], { duration: 850, easing: "cubic-bezier(.5,0,.3,1)" }).onfinish = function () { g.remove(); };
  };

  window.observeReveal = function (root) {
    var els = (root || document).querySelectorAll(".reveal:not(.in)");
    if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (!en.isIntersecting) return;
        var sib = en.target.parentElement ? Array.prototype.indexOf.call(en.target.parentElement.children, en.target) : 0;
        en.target.style.transitionDelay = Math.min(sib, 6) * 70 + "ms";
        en.target.classList.add("in");
        io.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (e) { io.observe(e); });
  };

  function magnetic() {
    if (reduced || !window.matchMedia("(hover: hover)").matches) return;
    document.addEventListener("pointermove", function (e) {
      var b = e.target.closest(".btn-primary, .btn-glass");
      document.querySelectorAll(".is-mag").forEach(function (m) { if (m !== b) { m.style.transform = ""; m.classList.remove("is-mag"); } });
      if (!b) return;
      var r = b.getBoundingClientRect();
      b.classList.add("is-mag");
      b.style.transform = "translate(" + (e.clientX - r.left - r.width / 2) * 0.18 + "px," + (e.clientY - r.top - r.height / 2) * 0.3 + "px)";
    });
  }

  function mount() {
    document.body.insertAdjacentHTML("afterbegin", SPRITE + HEADER);
    document.body.insertAdjacentHTML("beforeend", FOOTER);

    var header = document.querySelector(".site-header");
    var bar = document.querySelector(".scroll-progress i");
    var onScroll = function () {
      header.classList.toggle("is-solid", window.scrollY > 40 || document.body.classList.contains("menu-open"));
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = "scaleX(" + (h > 0 ? window.scrollY / h : 0) + ")";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    document.querySelector(".menu-btn").addEventListener("click", function () {
      document.body.classList.toggle("menu-open");
      onScroll();
    });
    document.querySelectorAll(".main-nav a").forEach(function (a) {
      a.addEventListener("click", function () { document.body.classList.remove("menu-open"); onScroll(); });
    });
    document.addEventListener("click", function (e) {
      var b = e.target.closest("[data-lang]");
      if (b) window.setLang(b.dataset.lang);
    });
    if (page === "catalog" && /cat=fav/.test(location.search)) {
      document.querySelectorAll('.tabbar a[href="catalog.html?cat=fav"]').forEach(function (a) { a.classList.add("is-active"); });
      document.querySelectorAll('.tabbar a[href="catalog.html"]').forEach(function (a) { a.classList.remove("is-active"); });
    }

    magnetic();
    window.applyI18n();
    document.dispatchEvent(new CustomEvent("langchange"));
    window.Fav && window.Fav.sync();
    window.observeReveal();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();
})();
