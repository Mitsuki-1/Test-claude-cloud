/* Общие элементы: иконки, шапка, подвал, мобильное меню, анимации появления, тосты. */
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

  var SPRITE =
    '<svg width="0" height="0" style="position:absolute" aria-hidden="true">' +
    '<symbol id="i-tg" viewBox="0 0 24 24"><path fill="currentColor" d="M21.9 4.3 18.6 20c-.2 1.1-.9 1.4-1.8.9l-5-3.7-2.4 2.3c-.3.3-.5.5-1 .5l.4-5.1 9.2-8.3c.4-.4-.1-.6-.6-.2L6 13.6l-4.9-1.5c-1.1-.3-1.1-1.1.2-1.6l19.2-7.4c.9-.3 1.7.2 1.4 1.2z"/></symbol>' +
    '<symbol id="i-phone" viewBox="0 0 24 24"><path fill="currentColor" d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2z"/></symbol>' +
    '<symbol id="i-bag" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M5 8h14l-1.2 11.1A2 2 0 0 1 15.8 21H8.2a2 2 0 0 1-2-1.9L5 8zm4 0V6.5a3 3 0 0 1 6 0V8"/></symbol>' +
    '<symbol id="i-link" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></symbol>' +
    '<symbol id="i-menu" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M4 7h16M4 12h16M4 17h10"/></symbol>' +
    '<symbol id="i-arrow" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m-5-5 5 5-5 5"/></symbol>' +
    '<symbol id="i-check" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" d="m5 12.5 4.5 4.5L19 7.5"/></symbol>' +
    "</svg>";

  var page = document.body.dataset.page || "";

  function navLink(href, key, id) {
    return '<a href="' + href + '" class="' + (page === id ? "is-active" : "") + '" data-i18n="' + key + '"></a>';
  }

  var HEADER =
    '<header class="site-header' + (page === "home" ? " is-over" : "") + '">' +
    '<div class="container header-in">' +
    '<a href="index.html" class="logo" aria-label="Caramell"><span class="logo-word">Caramell</span><span class="logo-sub">UZBEKISTAN</span></a>' +
    '<nav class="main-nav">' +
    navLink("index.html", "nav.home", "home") + navLink("catalog.html", "nav.catalog", "catalog") + navLink("moms.html", "nav.moms", "moms") +
    '<a href="index.html#wholesale" data-i18n="nav.wholesale"></a><a href="#contacts" data-i18n="nav.contacts"></a></nav>' +
    '<div class="header-act">' +
    '<div class="lang"><button data-lang="ru">RU</button><button data-lang="uz">UZ</button></div>' +
    '<a class="icon-btn hide-sm" href="tel:' + CONTACT.phone + '" aria-label="phone"><svg class="i"><use href="#i-phone"/></svg></a>' +
    '<button class="icon-btn cart-btn" data-cart-open aria-label="cart"><svg class="i"><use href="#i-bag"/></svg><span class="cart-count" hidden>0</span></button>' +
    '<button class="icon-btn menu-btn" aria-label="menu"><svg class="i"><use href="#i-menu"/></svg></button>' +
    "</div></div></header>";

  var FOOTER =
    '<footer class="site-footer" id="contacts"><div class="container">' +
    '<div class="footer-grid">' +
    '<div><div class="logo logo-light"><span class="logo-word">Caramell</span><span class="logo-sub">UZBEKISTAN</span></div>' +
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
    '<div class="toast" id="toast" role="status"></div>';

  window.toast = function (msg) {
    var el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.classList.remove("show"); }, 2200);
  };

  window.observeReveal = function (root) {
    var els = (root || document).querySelectorAll(".reveal:not(.in)");
    if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (e) { io.observe(e); });
  };

  function mount() {
    document.body.insertAdjacentHTML("afterbegin", SPRITE + HEADER);
    document.body.insertAdjacentHTML("beforeend", FOOTER);

    var header = document.querySelector(".site-header");
    var onScroll = function () { header.classList.toggle("is-solid", window.scrollY > 40 || document.body.classList.contains("menu-open")); };
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

    window.applyI18n();
    document.dispatchEvent(new CustomEvent("langchange"));
    window.observeReveal();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();
})();
