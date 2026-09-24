/* Переводы RU / UZ (латиница). Ключи используются в data-i18n="..." и в JS через t("key"). */
(function () {
  var D = {
    ru: {
      sum: "сум",
      "nav.home": "Главная", "nav.catalog": "Каталог", "nav.moms": "Мамам", "nav.wholesale": "Оптом", "nav.contacts": "Контакты",
      "nav.cart": "Корзина",
      "cta.catalog": "Смотреть каталог", "cta.telegram": "Написать в Telegram", "cta.call": "Позвонить",

      "hero.kicker": "Официальный магазин в Узбекистане",
      "hero.title": "Одежда из Турции, в которой детям <em>уютно</em>",
      "hero.sub": "Caramell — мягкий хлопок, нежные цвета и продуманные детали для малышей от 0 до 8 лет. Высокое качество по доступной цене.",
      "hero.scroll": "Листайте",

      "trust.tr": "Товары из Турции", "trust.tr.s": "Прямые поставки от фабрики",
      "trust.off": "Официальный магазин", "trust.off.s": "Оригинальная продукция Caramell",
      "trust.price": "Доступная цена", "trust.price.s": "Турецкое качество без переплат",
      "trust.opt": "Опт и розница", "trust.opt.s": "Для мам и для магазинов",
      "trust.del": "Доставка по Узбекистану", "trust.del.s": "Ташкент и все регионы",

      "cats.kicker": "Коллекции", "cats.title": "Всё для малыша — в одном месте",
      "cat.all": "Все", "cat.newborn": "Новорождённым", "cat.bodysuits": "Боди и комбинезоны", "cat.sets": "Костюмы и комплекты",
      "cat.dresses": "Платья", "cat.discharge": "На выписку", "cat.pajamas": "Пижамы и сон",

      "hits.kicker": "Выбор мам", "hits.title": "Хиты продаж", "hits.all": "Весь каталог →",
      "badge.hit": "Хит", "badge.new": "Новинка", "badge.sale": "Скидка",

      "look.kicker": "#caramelluz", "look.title": "Наши маленькие модели",
      "look.sub": "Отмечайте нас в Instagram и Telegram — лучшие фото попадут сюда.",

      "why.kicker": "Почему Caramell", "why.title": "Одежда, которую приятно дарить и носить",
      "why.1": "Натуральные ткани", "why.1.s": "Хлопок, интерлок, муслин — сертифицированные ткани, безопасные для нежной кожи.",
      "why.2": "Продуманные детали", "why.2.s": "Кнопки-запах, швы наружу, мягкие резинки — переодевать легко и быстро.",
      "why.3": "Держит вид после стирок", "why.3.s": "Цвета не выцветают, ткань не катается. Проверено тысячами мам.",

      "opt.kicker": "Для бизнеса", "opt.title": "Оптом — для магазинов и реселлеров",
      "opt.sub": "Работаем с магазинами детской одежды по всему Узбекистану. Свежие коллекции каждый сезон прямо из Турции.",
      "opt.1": "Оптовые цены от фабрики", "opt.2": "Размерные ряды и серии", "opt.3": "Фото и контент для ваших соцсетей", "opt.4": "Доставка в регионы",
      "opt.cta": "Получить оптовый прайс",

      "rev.kicker": "Отзывы", "rev.title": "Что говорят мамы",
      "rev.1": "Брали набор на выписку — все в роддоме спрашивали, где купили. Ткань очень мягкая, после стирки как новая.",
      "rev.1.a": "Малика, Ташкент",
      "rev.2": "Размеры соответствуют, всё пришло быстро. Боди беру уже третий раз, сын вырастает — берём новые.",
      "rev.2.a": "Дильноза, Самарканд",
      "rev.3": "Заказываю оптом для своего магазина в Фергане. Качество стабильное, покупатели возвращаются.",
      "rev.3.a": "Шахноза, Фергана",

      "momsT.kicker": "Раздел для мам", "momsT.title": "Полезные инструменты для мам",
      "momsT.sub": "Подберите размер за 10 секунд, соберите сумку в роддом и найдите идеальный подарок.",
      "momsT.1": "Калькулятор размера", "momsT.2": "Чек-лист в роддом", "momsT.3": "Подбор подарка", "momsT.4": "Советы по уходу",
      "momsT.cta": "Открыть раздел",

      "contact.kicker": "Мы на связи", "contact.title": "Заказать просто",
      "contact.sub": "Напишите в Telegram или позвоните — поможем с размером и оформим доставку.",
      "contact.phone": "Телефон", "contact.tg": "Telegram для заказов", "contact.channel": "Наш канал", "contact.links": "Все ссылки",
      "footer.tag": "Магазин одежды для младенцев и детей. Товары из Турции. Официальный магазин в Узбекистане.",
      "footer.rights": "Все права защищены.",

      /* Каталог */
      "cat.page.title": "Каталог", "cat.page.sub": "Турецкая одежда для малышей от 0 до 8 лет. Выберите размер и оформите заказ в Telegram.",
      "f.search": "Поиск: боди, пижама, платье…", "f.gender": "Для кого", "g.all": "Все", "g.girl": "Девочкам", "g.boy": "Мальчикам", "g.unisex": "Унисекс",
      "f.size": "Размер", "f.sizeAll": "Любой", "f.sort": "Сортировка",
      "s.pop": "Популярные", "s.cheap": "Сначала дешевле", "s.exp": "Сначала дороже", "s.new": "Новинки",
      "f.found": "Найдено", "f.none": "Ничего не нашлось. Попробуйте сбросить фильтры.", "f.reset": "Сбросить",
      "p.add": "В корзину", "p.more": "Подробнее", "p.size": "Выберите размер", "p.qty": "Количество",
      "p.pickSize": "Сначала выберите размер", "p.added": "Добавлено в корзину", "p.opt": "Опт от 5 серий — цена по запросу",
      "p.sizes": "Размеры",

      /* Корзина */
      "cart.title": "Корзина", "cart.empty": "Корзина пуста. Загляните в каталог — там много мягкого и красивого.",
      "cart.total": "Итого", "cart.tg": "Оформить в Telegram", "cart.call": "Заказать по телефону", "cart.copy": "Скопировать заказ",
      "cart.copied": "Заказ скопирован — вставьте его в чат", "cart.note": "Менеджер подтвердит наличие и стоимость доставки.",
      "cart.msg": "Здравствуйте! Хочу заказать на сайте Caramell:", "cart.size": "размер", "cart.pcs": "шт.", "cart.remove": "Удалить",

      /* Мамам */
      "moms.title": "Мамам", "moms.sub": "Полезные инструменты и советы от Caramell — чтобы готовиться к встрече с малышом и одевать его с удовольствием.",
      "size.title": "Калькулятор размера", "size.sub": "Введите хотя бы один параметр. Точнее всего — по росту.",
      "size.age": "Возраст (месяцев)", "size.h": "Рост (см)", "size.w": "Вес (кг)", "size.go": "Подобрать размер",
      "size.res": "Ваш размер Caramell", "size.tip.up": "Малыш близко к верхней границе — советуем взять на размер больше:",
      "size.tip.ok": "Идеально по сетке. Для вещей «на вырост» можно взять следующий:",
      "size.need": "Введите возраст, рост или вес", "size.show": "Показать вещи этого размера",
      "size.table": "Размерная сетка", "size.col.size": "Размер", "size.col.h": "Рост, см", "size.col.w": "Вес, кг",

      "check.title": "Чек-лист: сумка в роддом", "check.sub": "Отмечайте собранное — список сохранится на этом устройстве.",
      "check.done": "собрано", "check.reset": "Очистить", "check.buy": "купить",
      "cg.baby": "Для малыша", "cg.mom": "Для мамы", "cg.docs": "Документы", "cg.out": "На выписку",
      "ci.b1": "Боди или распашонки — 4–5 шт.", "ci.b2": "Ползунки или слипы — 4–5 шт.", "ci.b3": "Шапочки — 2 шт.", "ci.b4": "Рукавички-царапки и носочки",
      "ci.b5": "Подгузники для новорождённых (1–2 размер)", "ci.b6": "Влажные салфетки без запаха", "ci.b7": "Пелёнки — 3–4 шт.", "ci.b8": "Детский крем под подгузник",
      "ci.m1": "Халат и ночная сорочка для кормления", "ci.m2": "Тапочки и носки", "ci.m3": "Бюстгальтер для кормления и вкладыши", "ci.m4": "Послеродовые прокладки и бельё",
      "ci.m5": "Гигиена: зубная щётка, расчёска, полотенце", "ci.m6": "Зарядка для телефона", "ci.m7": "Вода и перекус",
      "ci.d1": "Паспорт", "ci.d2": "Обменная карта", "ci.d3": "Направление / договор с роддомом", "ci.d4": "Полис / медицинские документы",
      "ci.o1": "Комплект на выписку", "ci.o2": "Конверт или плед по сезону", "ci.o3": "Автокресло для малыша", "ci.o4": "Одежда для мамы по погоде",

      "gift.title": "Подбор подарка", "gift.sub": "Три вопроса — и мы соберём готовый набор.",
      "gift.q1": "Для кого подарок?", "gift.q2": "Возраст малыша", "gift.q3": "Бюджет",
      "gift.a.new": "Новорождённый", "gift.a.baby": "до 1 года", "gift.a.tod": "1–3 года", "gift.a.kid": "3–8 лет",
      "gift.b1": "до 300 000", "gift.b2": "300–600 000", "gift.b3": "600 000+",
      "gift.go": "Подобрать", "gift.res": "Готовые наборы", "gift.set": "Набор", "gift.addAll": "Добавить набор в корзину",
      "gift.none": "Не нашли подходящий набор — напишите нам, соберём вручную.", "gift.again": "Изменить ответы",
      "gift.step": "Шаг",

      "tips.title": "Советы по уходу",
      "tip1.t": "Как стирать детскую одежду", "tip1.b": "Стирайте новые вещи перед первой ноской. Выбирайте гипоаллергенный гель без отдушек, режим 30–40 °C, двойное полоскание. Выворачивайте вещи наизнанку — так принты и кружево дольше остаются как новые. Кондиционер для первых месяцев лучше не использовать.",
      "tip2.t": "Какие ткани лучше для малыша", "tip2.b": "Для новорождённых — 100% хлопок, интерлок и рибана: мягкие, тянутся и дышат. Муслин — для жары, он лёгкий и быстро сохнет. Футер с начёсом — для прохладных вечеров. Избегайте жёсткой синтетики у самой кожи.",
      "tip3.t": "Как одевать по погоде в Ташкенте", "tip3.b": "Правило: на малыша на один слой больше, чем на себя. Летом (+35 °C) — муслиновый песочник и панамка, прогулки до 11:00 и после 18:00. Весной и осенью — боди + костюм из футера. Зимой — термослой, флис и тёплый комбинезон; шапочку не снимайте даже в машине, пока не прогреется салон.",
      "tip4.t": "Первый гардероб: сколько чего нужно", "tip4.b": "На первые 3 месяца: 6–8 боди, 5–6 ползунков или слипов, 2–3 шапочки, 2 пары царапок, 4–5 пар носочков, 1–2 тёплых комбинезона по сезону и нарядный комплект на выписку. Малыши быстро растут — не покупайте много одного размера.",
      "tip5.t": "Как выбрать размер на вырост", "tip5.b": "Ориентируйтесь на рост, а не на возраст. Если малыш у верхней границы размера — берите следующий. Для боди и слипов допустимо +1 размер, для нарядных вещей лучше точный — они нужны «здесь и сейчас».",
      "tip6.t": "Безопасность детской одежды", "tip6.b": "Проверяйте, что пуговицы и декор прочно пришиты, нет длинных шнурков у шеи. Для сна — одежда без капюшонов и крупного декора. Бирки лучше срезать, если они колются."
    },

    uz: {
      sum: "so‘m",
      "nav.home": "Bosh sahifa", "nav.catalog": "Katalog", "nav.moms": "Onalarga", "nav.wholesale": "Ulgurji", "nav.contacts": "Aloqa",
      "nav.cart": "Savat",
      "cta.catalog": "Katalogni ko‘rish", "cta.telegram": "Telegramda yozish", "cta.call": "Qo‘ng‘iroq qilish",

      "hero.kicker": "O‘zbekistondagi rasmiy do‘kon",
      "hero.title": "Bolalarga <em>qulay</em> bo‘lgan Turkiya kiyimlari",
      "hero.sub": "Caramell — yumshoq paxta, nozik ranglar va 0 dan 8 yoshgacha bo‘lgan bolalar uchun puxta o‘ylangan detallar. Yuqori sifat, hamyonbop narx.",
      "hero.scroll": "Pastga",

      "trust.tr": "Turkiya mahsulotlari", "trust.tr.s": "Fabrikadan to‘g‘ridan-to‘g‘ri",
      "trust.off": "Rasmiy do‘kon", "trust.off.s": "Original Caramell mahsulotlari",
      "trust.price": "Hamyonbop narx", "trust.price.s": "Ortiqcha to‘lovsiz turk sifati",
      "trust.opt": "Ulgurji va chakana", "trust.opt.s": "Onalar va do‘konlar uchun",
      "trust.del": "O‘zbekiston bo‘ylab yetkazish", "trust.del.s": "Toshkent va barcha viloyatlar",

      "cats.kicker": "Kolleksiyalar", "cats.title": "Chaqaloq uchun hammasi — bir joyda",
      "cat.all": "Barchasi", "cat.newborn": "Chaqaloqlarga", "cat.bodysuits": "Bodi va kombinezonlar", "cat.sets": "Kostyum va to‘plamlar",
      "cat.dresses": "Ko‘ylaklar", "cat.discharge": "Tug‘ruqxonadan chiqish", "cat.pajamas": "Pijama va uyqu",

      "hits.kicker": "Onalar tanlovi", "hits.title": "Eng ko‘p sotilganlar", "hits.all": "Butun katalog →",
      "badge.hit": "Xit", "badge.new": "Yangi", "badge.sale": "Chegirma",

      "look.kicker": "#caramelluz", "look.title": "Bizning kichik modellarimiz",
      "look.sub": "Instagram va Telegramda bizni belgilang — eng yaxshi suratlar shu yerga tushadi.",

      "why.kicker": "Nega Caramell", "why.title": "Sovg‘a qilish va kiyish yoqimli kiyimlar",
      "why.1": "Tabiiy matolar", "why.1.s": "Paxta, interlok, muslin — nozik teri uchun xavfsiz sertifikatlangan matolar.",
      "why.2": "Puxta detallar", "why.2.s": "Qoplama tugmalar, tashqi choklar, yumshoq rezinkalar — kiyintirish oson va tez.",
      "why.3": "Yuvilgandan keyin ham chiroyli", "why.3.s": "Ranglar o‘chmaydi, mato g‘ijimlanmaydi. Minglab onalar sinab ko‘rgan.",

      "opt.kicker": "Biznes uchun", "opt.title": "Ulgurji — do‘konlar va reselerlar uchun",
      "opt.sub": "O‘zbekiston bo‘ylab bolalar kiyimi do‘konlari bilan ishlaymiz. Har mavsumda Turkiyadan yangi kolleksiyalar.",
      "opt.1": "Fabrika ulgurji narxlari", "opt.2": "O‘lcham qatorlari va seriyalar", "opt.3": "Ijtimoiy tarmoqlaringiz uchun foto va kontent", "opt.4": "Viloyatlarga yetkazib berish",
      "opt.cta": "Ulgurji narxlarni olish",

      "rev.kicker": "Fikrlar", "rev.title": "Onalar nima deydi",
      "rev.1": "Tug‘ruqxonadan chiqish to‘plamini oldik — hamma qayerdan olganimizni so‘radi. Mato juda yumshoq, yuvilgandan keyin ham yangidek.",
      "rev.1.a": "Malika, Toshkent",
      "rev.2": "O‘lchamlar to‘g‘ri keladi, hammasi tez yetib keldi. Bodini uchinchi marta olyapman, o‘g‘lim o‘syapti — yangilarini olamiz.",
      "rev.2.a": "Dilnoza, Samarqand",
      "rev.3": "Farg‘onadagi do‘konim uchun ulgurji buyurtma qilaman. Sifat barqaror, xaridorlar qaytib keladi.",
      "rev.3.a": "Shahnoza, Farg‘ona",

      "momsT.kicker": "Onalar bo‘limi", "momsT.title": "Onalar uchun foydali vositalar",
      "momsT.sub": "10 soniyada o‘lchamni tanlang, tug‘ruqxonaga sumka yig‘ing va ideal sovg‘ani toping.",
      "momsT.1": "O‘lcham kalkulyatori", "momsT.2": "Tug‘ruqxona ro‘yxati", "momsT.3": "Sovg‘a tanlash", "momsT.4": "Parvarish maslahatlari",
      "momsT.cta": "Bo‘limni ochish",

      "contact.kicker": "Biz aloqadamiz", "contact.title": "Buyurtma berish oson",
      "contact.sub": "Telegramda yozing yoki qo‘ng‘iroq qiling — o‘lchamni tanlashda yordam beramiz va yetkazib berishni rasmiylashtiramiz.",
      "contact.phone": "Telefon", "contact.tg": "Buyurtmalar uchun Telegram", "contact.channel": "Kanalimiz", "contact.links": "Barcha havolalar",
      "footer.tag": "Chaqaloqlar va bolalar kiyim do‘koni. Turkiya mahsulotlari. O‘zbekistondagi rasmiy do‘kon.",
      "footer.rights": "Barcha huquqlar himoyalangan.",

      "cat.page.title": "Katalog", "cat.page.sub": "0 dan 8 yoshgacha bolalar uchun turk kiyimlari. O‘lchamni tanlang va Telegramda buyurtma bering.",
      "f.search": "Qidiruv: bodi, pijama, ko‘ylak…", "f.gender": "Kim uchun", "g.all": "Barchasi", "g.girl": "Qizlarga", "g.boy": "O‘g‘il bolalarga", "g.unisex": "Uniseks",
      "f.size": "O‘lcham", "f.sizeAll": "Istalgan", "f.sort": "Saralash",
      "s.pop": "Ommabop", "s.cheap": "Avval arzonroq", "s.exp": "Avval qimmatroq", "s.new": "Yangilar",
      "f.found": "Topildi", "f.none": "Hech narsa topilmadi. Filtrlarni tozalab ko‘ring.", "f.reset": "Tozalash",
      "p.add": "Savatga", "p.more": "Batafsil", "p.size": "O‘lchamni tanlang", "p.qty": "Soni",
      "p.pickSize": "Avval o‘lchamni tanlang", "p.added": "Savatga qo‘shildi", "p.opt": "5 seriyadan ulgurji — narx so‘rov bo‘yicha",
      "p.sizes": "O‘lchamlar",

      "cart.title": "Savat", "cart.empty": "Savat bo‘sh. Katalogga kiring — u yerda yumshoq va chiroyli narsalar ko‘p.",
      "cart.total": "Jami", "cart.tg": "Telegramda rasmiylashtirish", "cart.call": "Telefon orqali buyurtma", "cart.copy": "Buyurtmani nusxalash",
      "cart.copied": "Buyurtma nusxalandi — uni chatga qo‘ying", "cart.note": "Menejer mavjudligini va yetkazib berish narxini tasdiqlaydi.",
      "cart.msg": "Assalomu alaykum! Caramell saytidan buyurtma bermoqchiman:", "cart.size": "o‘lcham", "cart.pcs": "dona", "cart.remove": "O‘chirish",

      "moms.title": "Onalarga", "moms.sub": "Caramell’dan foydali vositalar va maslahatlar — chaqaloq bilan uchrashuvga tayyorlanish va uni zavq bilan kiyintirish uchun.",
      "size.title": "O‘lcham kalkulyatori", "size.sub": "Kamida bitta parametrni kiriting. Eng aniqi — bo‘y bo‘yicha.",
      "size.age": "Yoshi (oy)", "size.h": "Bo‘yi (sm)", "size.w": "Vazni (kg)", "size.go": "O‘lchamni tanlash",
      "size.res": "Sizning Caramell o‘lchamingiz", "size.tip.up": "Chaqaloq yuqori chegaraga yaqin — bir o‘lcham kattasini olishni maslahat beramiz:",
      "size.tip.ok": "Jadvalga mos. «O‘sishga» olish uchun keyingisini tanlash mumkin:",
      "size.need": "Yoshi, bo‘yi yoki vaznini kiriting", "size.show": "Shu o‘lchamdagi kiyimlarni ko‘rsatish",
      "size.table": "O‘lchamlar jadvali", "size.col.size": "O‘lcham", "size.col.h": "Bo‘yi, sm", "size.col.w": "Vazni, kg",

      "check.title": "Ro‘yxat: tug‘ruqxona sumkasi", "check.sub": "Yig‘ilganlarini belgilang — ro‘yxat shu qurilmada saqlanadi.",
      "check.done": "yig‘ildi", "check.reset": "Tozalash", "check.buy": "sotib olish",
      "cg.baby": "Chaqaloq uchun", "cg.mom": "Ona uchun", "cg.docs": "Hujjatlar", "cg.out": "Chiqish uchun",
      "ci.b1": "Bodi yoki ko‘ylakchalar — 4–5 dona", "ci.b2": "Polzunki yoki sliplar — 4–5 dona", "ci.b3": "Shapkachalar — 2 dona", "ci.b4": "Qo‘lqopchalar va paypoqchalar",
      "ci.b5": "Chaqaloq tagliklari (1–2 o‘lcham)", "ci.b6": "Hidsiz nam salfetkalar", "ci.b7": "Yo‘rgaklar — 3–4 dona", "ci.b8": "Taglik ostiga bolalar kremi",
      "ci.m1": "Xalat va emizish uchun tungi ko‘ylak", "ci.m2": "Shippak va paypoq", "ci.m3": "Emizish uchun byustgalter va qistirmalar", "ci.m4": "Tug‘ruqdan keyingi prokladkalar va ichki kiyim",
      "ci.m5": "Gigiyena: tish cho‘tkasi, taroq, sochiq", "ci.m6": "Telefon quvvatlagichi", "ci.m7": "Suv va yengil ovqat",
      "ci.d1": "Pasport", "ci.d2": "Almashinuv kartasi", "ci.d3": "Yo‘llanma / tug‘ruqxona bilan shartnoma", "ci.d4": "Tibbiy hujjatlar",
      "ci.o1": "Chiqish to‘plami", "ci.o2": "Mavsumga mos konvert yoki pled", "ci.o3": "Chaqaloq avtokreslosi", "ci.o4": "Ona uchun ob-havoga mos kiyim",

      "gift.title": "Sovg‘a tanlash", "gift.sub": "Uchta savol — va biz tayyor to‘plam yig‘amiz.",
      "gift.q1": "Sovg‘a kim uchun?", "gift.q2": "Chaqaloq yoshi", "gift.q3": "Byudjet",
      "gift.a.new": "Yangi tug‘ilgan", "gift.a.baby": "1 yoshgacha", "gift.a.tod": "1–3 yosh", "gift.a.kid": "3–8 yosh",
      "gift.b1": "300 000 gacha", "gift.b2": "300–600 000", "gift.b3": "600 000+",
      "gift.go": "Tanlash", "gift.res": "Tayyor to‘plamlar", "gift.set": "To‘plam", "gift.addAll": "To‘plamni savatga qo‘shish",
      "gift.none": "Mos to‘plam topilmadi — bizga yozing, qo‘lda yig‘ib beramiz.", "gift.again": "Javoblarni o‘zgartirish",
      "gift.step": "Qadam",

      "tips.title": "Parvarish maslahatlari",
      "tip1.t": "Bolalar kiyimini qanday yuvish kerak", "tip1.b": "Yangi kiyimlarni birinchi kiyishdan oldin yuving. Hidsiz gipoallergen geldan foydalaning, 30–40 °C rejim, ikki marta chayish. Kiyimlarni teskari ag‘daring — shunda naqsh va dantellar uzoqroq yangidek turadi. Birinchi oylarda konditsionerdan foydalanmagan ma’qul.",
      "tip2.t": "Chaqaloq uchun qaysi matolar yaxshi", "tip2.b": "Yangi tug‘ilganlar uchun — 100% paxta, interlok va ribana: yumshoq, cho‘ziluvchan va havo o‘tkazadi. Muslin — issiq kunlar uchun, yengil va tez quriydi. Ichi tukli futer — salqin kechalar uchun. Teriga tegib turadigan qattiq sintetikadan qoching.",
      "tip3.t": "Toshkent ob-havosiga qarab kiyintirish", "tip3.b": "Qoida: chaqaloqqa o‘zingizdan bir qavat ko‘proq. Yozda (+35 °C) — muslin qumlik kiyimi va panama, sayrlar 11:00 gacha va 18:00 dan keyin. Bahor va kuzda — bodi + futer kostyum. Qishda — termo qavat, flis va issiq kombinezon.",
      "tip4.t": "Birinchi kiyimlar: nimadan qancha kerak", "tip4.b": "Birinchi 3 oy uchun: 6–8 bodi, 5–6 polzunki yoki slip, 2–3 shapkacha, 2 juft qo‘lqopcha, 4–5 juft paypoqcha, mavsumga mos 1–2 issiq kombinezon va chiqish uchun bayramona to‘plam. Chaqaloqlar tez o‘sadi — bitta o‘lchamdan ko‘p olmang.",
      "tip5.t": "O‘sishga o‘lcham qanday tanlanadi", "tip5.b": "Yoshga emas, bo‘yga qarang. Agar chaqaloq o‘lchamning yuqori chegarasida bo‘lsa — keyingisini oling. Bodi va sliplar uchun +1 o‘lcham mumkin, bayramona kiyimlar uchun aniq o‘lcham yaxshiroq.",
      "tip6.t": "Bolalar kiyimi xavfsizligi", "tip6.b": "Tugmalar va bezaklar mahkam tikilganini, bo‘yin atrofida uzun bog‘ichlar yo‘qligini tekshiring. Uyqu uchun — kapyushonsiz va katta bezaksiz kiyim. Yorliqlar sanchilsa, ularni kesib tashlang."
    }
  };

  // Названия размеров
  var SZ = {
    ru: { m: "мес", y: "лет", y2: "года" },
    uz: { m: "oy", y: "yosh", y2: "yosh" }
  };

  var lang = "ru";
  try { lang = localStorage.getItem("caramell_lang") || "ru"; } catch (e) {}
  if (!D[lang]) lang = "ru";

  window.getLang = function () { return lang; };
  window.t = function (key) { return (D[lang] && D[lang][key]) || D.ru[key] || key; };
  window.sizeLabel = function (key) {
    var m = /^(\d+)-(\d+)([my])$/.exec(key);
    if (!m) return key;
    var s = SZ[lang];
    var unit = m[3] === "m" ? s.m : (+m[2] <= 4 ? s.y2 : s.y);
    return m[1] + "–" + m[2] + " " + unit;
  };
  // ["0-3m","9-12m"] → "0–12 мес"; ["9-12m","2-3y"] → "9 мес – 3 года"
  window.sizeRange = function (keys) {
    if (keys.length === 1) return window.sizeLabel(keys[0]);
    var a = /^(\d+)-(\d+)([my])$/.exec(keys[0]), b = /^(\d+)-(\d+)([my])$/.exec(keys[keys.length - 1]);
    if (!a || !b) return keys.join(", ");
    var s = SZ[lang];
    var unitOf = function (n, u) { return u === "m" ? s.m : (+n <= 4 ? s.y2 : s.y); };
    if (a[3] === b[3]) return a[1] + "–" + b[2] + " " + unitOf(b[2], b[3]);
    return a[1] + " " + unitOf(a[1], a[3]) + " – " + b[2] + " " + unitOf(b[2], b[3]);
  };
  window.L = function (obj) { return obj ? (obj[lang] || obj.ru) : ""; };

  window.applyI18n = function (root) {
    root = root || document;
    root.querySelectorAll("[data-i18n]").forEach(function (el) { el.innerHTML = window.t(el.dataset.i18n); });
    root.querySelectorAll("[data-i18n-ph]").forEach(function (el) { el.placeholder = window.t(el.dataset.i18nPh); });
    document.documentElement.lang = lang === "uz" ? "uz" : "ru";
    document.querySelectorAll("[data-lang]").forEach(function (b) { b.classList.toggle("is-on", b.dataset.lang === lang); });
  };

  window.setLang = function (l) {
    if (!D[l]) return;
    lang = l;
    try { localStorage.setItem("caramell_lang", l); } catch (e) {}
    window.applyI18n();
    document.dispatchEvent(new CustomEvent("langchange"));
  };
})();
