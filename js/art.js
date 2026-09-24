/*
 * Запасные иллюстрации: если фото не загрузилось (нет интернета, битая ссылка),
 * вместо него показывается мягкая иллюстрация одежды в цветах бренда.
 */
(function () {
  var S = "#3B2A20";
  var SHAPES = {
    bodysuits: '<path d="M70 40 L95 30 Q110 48 125 30 L150 40 L170 70 L150 80 L145 72 L145 130 Q145 150 128 158 L118 170 L102 170 L92 158 Q75 150 75 130 L75 72 L70 80 L50 70 Z" fill="#fff" fill-opacity=".85" stroke="' + S + '" stroke-opacity=".25" stroke-width="2"/><circle cx="104" cy="162" r="2.5" fill="' + S + '" fill-opacity=".3"/><circle cx="116" cy="162" r="2.5" fill="' + S + '" fill-opacity=".3"/>',
    dresses: '<path d="M88 30 L100 40 Q110 46 120 40 L132 30 L140 70 L130 76 Q160 130 172 170 L48 170 Q60 130 90 76 L80 70 Z" fill="#fff" fill-opacity=".85" stroke="' + S + '" stroke-opacity=".25" stroke-width="2"/><path d="M90 76 Q110 86 130 76" fill="none" stroke="' + S + '" stroke-opacity=".3" stroke-width="2"/>',
    sets: '<path d="M60 36 L88 28 Q110 44 132 28 L160 36 L178 66 L158 74 L154 66 L154 104 L66 104 L66 66 L62 74 L42 66 Z" fill="#fff" fill-opacity=".85" stroke="' + S + '" stroke-opacity=".25" stroke-width="2"/><path d="M74 112 L146 112 L150 176 L118 176 L110 136 L102 176 L70 176 Z" fill="#fff" fill-opacity=".7" stroke="' + S + '" stroke-opacity=".25" stroke-width="2"/>',
    pajamas: '<path d="M60 36 L88 28 Q110 44 132 28 L160 36 L178 66 L158 74 L154 66 L154 110 L66 110 L66 66 L62 74 L42 66 Z" fill="#fff" fill-opacity=".85" stroke="' + S + '" stroke-opacity=".25" stroke-width="2"/><path d="M112 62 a10 10 0 1 0 8 14 a8 8 0 1 1 -8 -14z" fill="' + S + '" fill-opacity=".25"/><circle cx="90" cy="88" r="2" fill="' + S + '" fill-opacity=".3"/><circle cx="134" cy="92" r="2" fill="' + S + '" fill-opacity=".3"/>',
    newborn: '<path d="M70 70 Q70 30 110 30 Q150 30 150 70 Z" fill="#fff" fill-opacity=".85" stroke="' + S + '" stroke-opacity=".25" stroke-width="2"/><rect x="66" y="68" width="88" height="14" rx="7" fill="#fff" stroke="' + S + '" stroke-opacity=".25" stroke-width="2"/><path d="M62 110 q0 -14 16 -14 h12 q16 0 16 14 v34 q0 18 -22 18 q-22 0 -22 -18z" fill="#fff" fill-opacity=".85" stroke="' + S + '" stroke-opacity=".25" stroke-width="2"/><path d="M114 110 q0 -14 16 -14 h12 q16 0 16 14 v34 q0 18 -22 18 q-22 0 -22 -18z" fill="#fff" fill-opacity=".85" stroke="' + S + '" stroke-opacity=".25" stroke-width="2"/>',
    discharge: '<path d="M60 60 Q110 20 160 60 L166 150 Q110 184 54 150 Z" fill="#fff" fill-opacity=".85" stroke="' + S + '" stroke-opacity=".25" stroke-width="2"/><circle cx="110" cy="72" r="20" fill="#fff" stroke="' + S + '" stroke-opacity=".25" stroke-width="2"/><path d="M84 118 q26 14 52 0" fill="none" stroke="' + S + '" stroke-opacity=".3" stroke-width="2"/><path d="M100 118 l10 8 l10 -8 l-10 -6z" fill="' + S + '" fill-opacity=".25"/>',
    kid: '<circle cx="110" cy="62" r="24" fill="#fff" fill-opacity=".85" stroke="' + S + '" stroke-opacity=".25" stroke-width="2"/><path d="M70 170 Q72 100 110 96 Q148 100 150 170Z" fill="#fff" fill-opacity=".85" stroke="' + S + '" stroke-opacity=".25" stroke-width="2"/><circle cx="102" cy="60" r="2.5" fill="' + S + '" fill-opacity=".4"/><circle cx="118" cy="60" r="2.5" fill="' + S + '" fill-opacity=".4"/><path d="M102 70 q8 6 16 0" fill="none" stroke="' + S + '" stroke-opacity=".4" stroke-width="2"/>'
  };

  window.artSVG = function (kind, color) {
    var shape = SHAPES[kind] || SHAPES.kid;
    var bg = color || "#EFE3CF";
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220" preserveAspectRatio="xMidYMid slice">' +
      '<rect width="220" height="220" fill="' + bg + '"/>' +
      '<circle cx="180" cy="36" r="46" fill="#fff" fill-opacity=".25"/><circle cx="30" cy="196" r="60" fill="#fff" fill-opacity=".18"/>' +
      '<g transform="translate(0,6)">' + shape + "</g></svg>");
  };

  // Любой <img data-art="kind" data-color="#..."> при ошибке загрузки получает иллюстрацию
  document.addEventListener("error", function (e) {
    var img = e.target;
    if (!img || img.tagName !== "IMG" || img.dataset.fallen) return;
    img.dataset.fallen = "1";
    img.src = window.artSVG(img.dataset.art, img.dataset.color);
    img.classList.add("is-art");
  }, true);
})();
