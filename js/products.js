/*
 * Каталог Caramell Uzbekistan.
 * Товары c101–c104 — реальные позиции и цены из Telegram-канала t.me/Caramelluz
 * (посты за сентябрь 2026). Остальные позиции — иллюстративные, по образу тех же
 * категорий, что продаёт магазин (вязаные комплекты, боди, костюмы, платья, пижамы) —
 * замените на свои фото и цены по мере появления новых постов в канале.
 *   price — цена в сумах, old — старая цена (для скидки, необязательно)
 *   img   — путь к фото, например "assets/img/body-01.jpg" (или ссылка)
 *   sizes — ключи размеров из SIZES ниже
 *   badge — "hit" | "new" | "sale" | undefined
 */
(function () {
  var U = function (id) {
    return "https://images.unsplash.com/photo-" + id + "?auto=format&fit=crop&w=700&q=70";
  };

  // Турецкая размерная сетка: рост (см), вес (кг), возраст (мес)
  window.SIZES = [
    { key: "0-3m",   h: [50, 62],   w: [2.5, 6],  a: [0, 3] },
    { key: "3-6m",   h: [62, 68],   w: [6, 8],    a: [3, 6] },
    { key: "6-9m",   h: [68, 74],   w: [8, 9.5],  a: [6, 9] },
    { key: "9-12m",  h: [74, 80],   w: [9.5, 11], a: [9, 12] },
    { key: "12-18m", h: [80, 86],   w: [11, 12.5],a: [12, 18] },
    { key: "18-24m", h: [86, 92],   w: [12.5, 14],a: [18, 24] },
    { key: "2-3y",   h: [92, 98],   w: [14, 15.5],a: [24, 36] },
    { key: "3-4y",   h: [98, 104],  w: [15.5, 17],a: [36, 48] },
    { key: "4-5y",   h: [104, 110], w: [17, 19],  a: [48, 60] },
    { key: "5-6y",   h: [110, 116], w: [19, 21],  a: [60, 72] },
    { key: "6-7y",   h: [116, 122], w: [21, 24],  a: [72, 84] },
    { key: "7-8y",   h: [122, 128], w: [24, 27],  a: [84, 96] }
  ];

  window.CATEGORIES = ["newborn", "bodysuits", "sets", "dresses", "discharge", "pajamas"];

  var BABY = ["0-3m", "3-6m", "6-9m", "9-12m"];
  var TODDLER = ["9-12m", "12-18m", "18-24m", "2-3y"];
  var KIDS = ["2-3y", "3-4y", "4-5y", "5-6y", "6-7y", "7-8y"];

  window.PRODUCTS = [
    { id: "c101", cat: "discharge", g: "boy", price: 460000, sizes: ["0-3m"], color: "#E4ECF8", img: U("1519689680058-324335c77eba"),
      name: { ru: "Нежный и тёплый комплект для выписки, 3 предмета", uz: "Chiqish uchun mayin va issiq to‘plam, 3 dona" },
      desc: { ru: "Вязаный комбинезон, базовый комбинезон и шапочка. Размер 0–1 мес. Вязаный плед в тон — 395 000 сум отдельно.", uz: "To‘qilgan kombinezon, asosiy kombinezon va shapkacha. O‘lcham 0–1 oy. Bir xil rangdagi to‘qilgan ko‘rpacha — alohida 395 000 so‘m." } },
    { id: "c102", cat: "discharge", g: "girl", price: 460000, badge: "hit", sizes: ["0-3m"], color: "#F5DCE2", img: U("1515488042361-ee00e0ddd4e4"),
      name: { ru: "Комплект для выписки «Маленькая принцесса», 3 предмета", uz: "«Kichkina malika» chiqish to‘plami, 3 dona" },
      desc: { ru: "Вязаный комбинезон, базовое боди и шапочка. Размер 0–1 мес. Вязаный плед в тон — 395 000 сум отдельно.", uz: "To‘qilgan kombinezon, asosiy bodi va shapkacha. O‘lcham 0–1 oy. Bir xil rangdagi to‘qilgan ko‘rpacha — alohida 395 000 so‘m." } },
    { id: "c103", cat: "discharge", g: "unisex", price: 395000, sizes: ["0-3m"], color: "#EAF0F8", img: U("1522771930-78848d9293e8"),
      name: { ru: "Вязаный плед для новорождённого", uz: "Chaqaloq uchun to‘qilgan ko‘rpacha" },
      desc: { ru: "Мягкий вязаный плед-конверт — дополняет любой комплект на выписку. Доставка по всему Узбекистану.", uz: "Yumshoq to‘qilgan konvert-ko‘rpacha — chiqish to‘plamiga mos keladi. O‘zbekiston bo‘ylab yetkazib berish." } },
    { id: "c104", cat: "bodysuits", g: "unisex", price: 235000, badge: "new", sizes: BABY, color: "#EAF0F8", img: U("1544126592-807ade215a0b"),
      name: { ru: "Комбинезон Caramell", uz: "Caramell kombinezoni" },
      desc: { ru: "Мягкий и удобный комбинезон на каждый день. Размеры 56–80 (56-62, 62-68, 68-74, 74-80).", uz: "Har kungi mayin va qulay kombinezon. O‘lchamlar 56–80 (56-62, 62-68, 68-74, 74-80)." } },

    { id: "c201", cat: "newborn", g: "unisex", price: 189000, badge: "hit", sizes: ["0-3m", "3-6m"], color: "#F4ECE1", img: U("1555252333-9f8e92e65df9"),
      name: { ru: "Комплект новорождённого, 3 предмета", uz: "Chaqaloq to‘plami, 3 dona" },
      desc: { ru: "Распашонка, ползунки и шапочка. Швы наружу — ничего не натирает.", uz: "Ko‘ylakcha, polzunki va shapkacha. Choklari tashqarida — hech narsa ishqalamaydi." } },
    { id: "c202", cat: "newborn", g: "unisex", price: 129000, sizes: ["0-3m", "3-6m"], color: "#E6EDE0", img: U("1544126592-807ade215a0b"),
      name: { ru: "Шапочка и рукавички-царапки", uz: "Shapkacha va tirnalishga qarshi qo‘lqop" },
      desc: { ru: "Тонкий хлопок, мягкая резинка. Защищают от царапин в первые недели.", uz: "Yupqa paxta, yumshoq rezinka. Birinchi haftalarda tirnalishdan himoya qiladi." } },
    { id: "c203", cat: "newborn", g: "girl", price: 239000, badge: "new", sizes: ["0-3m", "3-6m"], color: "#F6DCDC", img: U("1566004100631-35d015d6a491"),
      name: { ru: "Комплект «Зайка», 4 предмета", uz: "«Quyoncha» to‘plami, 4 dona" },
      desc: { ru: "Пудровый комплект с ушками на шапочке. Кнопки по всей длине.", uz: "Shapkachasida quloqchali pudra rang to‘plam. Butun uzunligi bo‘ylab tugmalar." } },
    { id: "c204", cat: "newborn", g: "boy", price: 239000, sizes: ["0-3m", "3-6m"], color: "#D8E3EA", img: U("1596870230751-ebdfce98ec42"),
      name: { ru: "Комплект «Мишка», 4 предмета", uz: "«Ayiqcha» to‘plami, 4 dona" },
      desc: { ru: "Тёплый хлопок с начёсом, аппликация-мишка. Для прохладных дней.", uz: "Ichi tukli issiq paxta, ayiqcha applikatsiyasi. Salqin kunlar uchun." } },

    { id: "c301", cat: "bodysuits", g: "unisex", price: 219000, old: 259000, badge: "sale", sizes: BABY, color: "#EDE6DA", img: U("1522771739844-6a9f6d5f14af"),
      name: { ru: "Набор боди с длинным рукавом, 3 шт.", uz: "Uzun yengli bodi to‘plami, 3 dona" },
      desc: { ru: "Базовые боди на каждый день: молочный, беж и полоска. Кнопки-запах.", uz: "Har kungi asosiy bodilar: sutrang, bej va yo‘l-yo‘l. Qoplama tugmalar." } },
    { id: "c302", cat: "bodysuits", g: "girl", price: 169000, badge: "hit", sizes: BABY, color: "#F3D9D3", img: U("1519689680058-324335c77eba"),
      name: { ru: "Комбинезон с рюшами «Роза»", uz: "Burmali kombinezon «Atirgul»" },
      desc: { ru: "Слип на кнопках с рюшами на плечах. Мягкий хлопок-рибана.", uz: "Yelkasida burmali tugmali slip. Yumshoq paxta-ribana." } },
    { id: "c303", cat: "bodysuits", g: "boy", price: 169000, sizes: BABY, color: "#D9E2D4", img: U("1515488042361-ee00e0ddd4e4"),
      name: { ru: "Комбинезон «Динозаврик»", uz: "«Dinozavrcha» kombinezoni" },
      desc: { ru: "Весёлый принт, кнопки до пяточки — легко переодевать.", uz: "Quvnoq naqsh, tovongacha tugma — kiyintirish oson." } },
    { id: "c304", cat: "bodysuits", g: "unisex", price: 149000, badge: "new", sizes: TODDLER, color: "#EFE3CF", img: U("1544126592-807ade215a0b"),
      name: { ru: "Песочник муслиновый", uz: "Muslin qumlik kiyimi" },
      desc: { ru: "Дышащий муслин для жаркого ташкентского лета.", uz: "Toshkentning issiq yozi uchun havo o‘tkazuvchi muslin." } },

    { id: "c401", cat: "sets", g: "girl", price: 279000, badge: "hit", sizes: TODDLER, color: "#F2D5CF", img: U("1503454537195-1dcabb73ffb9"),
      name: { ru: "Костюм «Цветочный сад»: туника + легинсы", uz: "«Gulzor» kostyumi: tunika + leggins" },
      desc: { ru: "Нежный цветочный принт, эластичный пояс. Хлопок 95%.", uz: "Nozik gulli naqsh, elastik belbog‘. 95% paxta." } },
    { id: "c402", cat: "sets", g: "boy", price: 279000, sizes: TODDLER, color: "#D6DEE6", img: U("1471286174890-9c112ffca5b4"),
      name: { ru: "Костюм «Капитан»: футболка + шорты", uz: "«Kapitan» kostyumi: futbolka + shortik" },
      desc: { ru: "Морской стиль, мягкий трикотаж, шорты на резинке.", uz: "Dengiz uslubi, yumshoq trikotaj, rezinkali shortik." } },
    { id: "c403", cat: "sets", g: "unisex", price: 349000, badge: "new", sizes: KIDS, color: "#E4E9DC", img: U("1476703993599-0035a21b17a9"),
      name: { ru: "Спортивный костюм с капюшоном", uz: "Kapyushonli sport kostyumi" },
      desc: { ru: "Футер трёхнитка, для прогулок весной и осенью.", uz: "Uch ipli futer, bahor va kuzgi sayrlar uchun." } },
    { id: "c404", cat: "sets", g: "boy", price: 319000, sizes: KIDS, color: "#E6DDD0", img: U("1504151932400-72d4384f04b3"),
      name: { ru: "Комплект «Джентльмен»: рубашка + брюки", uz: "«Jentlmen» to‘plami: ko‘ylak + shim" },
      desc: { ru: "Для праздников и фотосессий. Рубашка из хлопка-поплина.", uz: "Bayramlar va fotosessiyalar uchun. Paxta-poplin ko‘ylak." } },
    { id: "c405", cat: "sets", g: "girl", price: 299000, old: 359000, badge: "sale", sizes: KIDS, color: "#F5E1D8", img: U("1518831959646-742c3a14ebf7"),
      name: { ru: "Костюм с кардиганом «Карамелька»", uz: "Kardiganli kostyum «Karamelcha»" },
      desc: { ru: "Вязаный кардиган, футболка и юбка — тройка на все случаи.", uz: "To‘qilgan kardigan, futbolka va yubka — har qanday vaziyat uchun." } },

    { id: "c501", cat: "dresses", g: "girl", price: 259000, badge: "hit", sizes: TODDLER, color: "#F6DCDC", img: U("1543342384-1f1350e27861"),
      name: { ru: "Платье муслиновое с воротничком", uz: "Yoqali muslin ko‘ylak" },
      desc: { ru: "Воздушное платье + трусики-блумеры в комплекте.", uz: "Havodor ko‘ylak + to‘plamda blumer ichtoncha." } },
    { id: "c502", cat: "dresses", g: "girl", price: 389000, badge: "new", sizes: KIDS, color: "#EFD9E3", img: U("1560506840-ec148e82a604"),
      name: { ru: "Нарядное платье «Принцесса» из фатина", uz: "Fatindan bayramona ko‘ylak «Malika»" },
      desc: { ru: "Пышная юбка, хлопковая подкладка — не колется.", uz: "Hajmdor yubka, paxta astar — sanchimaydi." } },
    { id: "c503", cat: "dresses", g: "girl", price: 229000, sizes: KIDS, color: "#EAE3D2", img: U("1502781252888-9143ba7f074e"),
      name: { ru: "Летний сарафан в горошек", uz: "No‘xat naqshli yozgi sarafan" },
      desc: { ru: "Лёгкий хлопок, завязки на плечах, карман-сердечко.", uz: "Yengil paxta, yelkada bog‘ich, yurakcha cho‘ntak." } },

    { id: "c601", cat: "pajamas", g: "unisex", price: 179000, badge: "hit", sizes: TODDLER, color: "#E5E9EF", img: U("1607453998774-d533f65dac99"),
      name: { ru: "Пижама «Звёздная ночь»", uz: "«Yulduzli tun» pijamasi" },
      desc: { ru: "Мягкий интерлок, манжеты не давят. Светится принт-звёздочки.", uz: "Yumshoq interlok, manjetlar siqmaydi. Yulduzcha naqsh." } },
    { id: "c602", cat: "pajamas", g: "girl", price: 199000, sizes: KIDS, color: "#F3DDE0", img: U("1492725764893-90b379c2b6e7"),
      name: { ru: "Пижама «Единорог»", uz: "«Yagona shox» pijamasi" },
      desc: { ru: "Кофта с длинным рукавом и штаны, 100% хлопок.", uz: "Uzun yengli kofta va shim, 100% paxta." } },
    { id: "c603", cat: "pajamas", g: "boy", price: 199000, sizes: KIDS, color: "#D9E4DC", img: U("1476703993599-0035a21b17a9"),
      name: { ru: "Пижама «Космос»", uz: "«Koinot» pijamasi" },
      desc: { ru: "Ракеты и планеты — засыпать интереснее.", uz: "Raketalar va sayyoralar — uxlash qiziqroq." } },
    { id: "c604", cat: "pajamas", g: "unisex", price: 159000, badge: "new", sizes: BABY, color: "#EFE8DC", img: U("1555252333-9f8e92e65df9"),
      name: { ru: "Спальный мешок муслиновый", uz: "Muslin uyqu qopi" },
      desc: { ru: "Безопасный сон без одеяла, молния снизу для смены подгузника.", uz: "Ko‘rpasiz xavfsiz uyqu, taglik almashtirish uchun pastda molniya." } }
  ];

  window.findProduct = function (id) {
    for (var i = 0; i < window.PRODUCTS.length; i++) if (window.PRODUCTS[i].id === id) return window.PRODUCTS[i];
    return null;
  };

  // Карточка товара (используется на главной, в каталоге и в подборе подарка)
  window.productCard = function (p) {
    var badge = p.badge ? '<span class="badge badge-' + p.badge + '">' + window.t("badge." + p.badge) + "</span>" : "";
    var old = p.old ? '<s>' + window.formatSum(p.old) + "</s>" : "";
    var sizes = window.sizeRange(p.sizes);
    return '<article class="card reveal" data-open="' + p.id + '">' +
      '<div class="card-img"><img loading="lazy" src="' + p.img + '" alt="' + window.L(p.name).replace(/"/g, "&quot;") + '" data-art="' + p.cat + '" data-color="' + p.color + '">' + badge +
      '<button class="card-quick" data-open="' + p.id + '" aria-label="' + window.t("p.add") + '"><svg class="i"><use href="#i-bag"/></svg></button></div>' +
      '<div class="card-body"><div class="card-sizes">' + sizes + '</div><h3 class="card-title">' + window.L(p.name) + '</h3>' +
      '<div class="card-price">' + window.formatSum(p.price) + old + "</div></div></article>";
  };

  window.formatSum = function (n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " " + (window.t ? window.t("sum") : "сум");
  };
})();
