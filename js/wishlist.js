/* Избранное: сердечко на карточке, хранится в localStorage. */
(function () {
  var KEY = "caramell_fav";
  var ids = [];
  try { ids = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { ids = []; }
  ids = ids.filter(function (id) { return window.findProduct(id); });

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch (e) {}
    sync();
    document.dispatchEvent(new CustomEvent("favchange"));
  }

  function sync() {
    document.querySelectorAll(".fav-count").forEach(function (el) { el.textContent = ids.length; el.hidden = !ids.length; });
    document.querySelectorAll("[data-fav]").forEach(function (b) {
      var on = ids.indexOf(b.dataset.fav) > -1;
      b.classList.toggle("is-fav", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  window.Fav = {
    has: function (id) { return ids.indexOf(id) > -1; },
    list: function () { return ids.slice(); },
    toggle: function (id) {
      var i = ids.indexOf(id);
      if (i > -1) ids.splice(i, 1); else ids.push(id);
      save();
      return i < 0;
    },
    sync: sync
  };

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-fav]");
    if (!b) return;
    e.preventDefault();
    e.stopPropagation();
    var on = window.Fav.toggle(b.dataset.fav);
    b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop");
    window.toast && window.toast(window.t(on ? "fav.add" : "fav.rm"));
  }, true);
})();
