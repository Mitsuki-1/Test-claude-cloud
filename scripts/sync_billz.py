#!/usr/bin/env python3
"""
Синхронизация каталога с BILLZ 2.0 (api-admin.billz.ai).

Запускается в GitHub Actions (.github/workflows/pages.yml) раз в час.
Результат — js/data/billz.js: window.BILLZ = { synced_at, products: [...] }.
Если товаров нет, сайт показывает товары из js/products.js.

В BILLZ магазина нет категорий, а названия — турецкие («Tulum», «2 li Takım», «10'lu Set»),
поэтому тип товара, категория сайта и русское/узбекское название определяются по названию.

Переменные окружения:
  BILLZ_SECRET_TOKEN      — секретный ключ API из кабинета BILLZ (GitHub → Settings → Secrets)
  BILLZ_SHOP_IDS          — необязательно: id магазинов через запятую, чьи цены и остатки брать
  BILLZ_SHOW_OUT_OF_STOCK — "1", чтобы показывать товары с нулевым остатком (по умолчанию скрываются)
  BILLZ_SHOW_NO_PHOTO     — "1", чтобы показывать товары без фото (по умолчанию скрываются)
  BILLZ_FIXTURE           — путь к JSON-ответу /v2/products (для проверки без API)
  BILLZ_OUT               — куда писать результат (по умолчанию js/data/billz.js)
"""
import collections
import html
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone

HOST = "https://api-admin.billz.ai"
OUT = os.environ.get("BILLZ_OUT") or os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "js", "data", "billz.js")
PAGE_LIMIT = 100

# Сетка сайта (как window.SIZES в js/products.js): ключ, рост до (см)
SIZES = [("0-3m", 62), ("3-6m", 68), ("6-9m", 74), ("9-12m", 80), ("12-18m", 86), ("18-24m", 92),
         ("2-3y", 98), ("3-4y", 104), ("4-5y", 110), ("5-6y", 116), ("6-7y", 122), ("7-8y", 128)]
KEYS = [k for k, _ in SIZES]
MONTH_KEYS = [k for k in KEYS if k.endswith("m")]
YEAR_KEYS = [k for k in KEYS if k.endswith("y")]
TYPICAL_MONTHS = {0, 1, 3, 6, 9, 12, 18, 24, 36}

# Тип товара по названию (после tr_fold): (regex, категория сайта, название RU, название UZ). Порядок важен.
PIECES = r"(?<!\d)(\d{1,2})\s*['’`]?\s*(?:l[iu]|li|lu)\b|(?<!\d)(\d)\s*(?=takim)"
TYPES = [
    (r"uyku\s*tulum|uyku\s*seti|sleeping", "pajamas", "Спальный мешок", "Uyqu qopi"),
    (r"pijama|pajama|gecelik|uyku", "pajamas", "Пижама", "Pijama"),
    (r"emzirme", "accessories", "Для кормления", "Emizish uchun"),
    (r"emzik", "accessories", "Соска", "So‘rg‘ich"),
    (r"ana\s*kucag", "accessories", "Шезлонг-переноска", "Tashuvchi beshik"),
    (r"canta", "accessories", "Сумка для мамы", "Ona uchun sumka"),
    (r"havlu", "accessories", "Полотенце", "Sochiq"),
    (r"bornoz", "accessories", "Халат", "Xalat"),
    (r"ayakkabi", "accessories", "Обувь", "Poyabzal"),
    (r"biberon", "accessories", "Бутылочка", "Shishacha"),
    (r"oyuncak|cingirak|armut", "accessories", "Игрушка", "O‘yinchoq"),
    (r"corap(?!li)", "newborn", "Носочки", "Paypoqchalar"),  # «5 li Soket Çorap» — носки, а не набор на выписку
    (r"mendil", "newborn", "Платочки", "Ro‘molchalar"),
    (r"(?<!\d)(5|6|7|8|9|10|11|12)\s*['’`]?\s*l[iu]\b|hastane|cikis", "discharge", "Набор на выписку", "Chiqish to‘plami"),
    (r"kundak", "blankets", "Конверт-пелёнка", "Yo‘rgak-konvert"),
    (r"battaniye|blanket|pled", "blankets", "Плед", "Ko‘rpacha"),
    (r"elbise|dress", "dresses", "Платье", "Ko‘ylak"),
    (r"etek|tunik", "dresses", "Юбка", "Yubka"),
    (r"kozmonot", "overalls", "Тёплый комбинезон", "Issiq kombinezon"),
    (r"salopet|solopet", "overalls", "Полукомбинезон", "Kombinezon-shim"),
    (r"romper|babygrow", "overalls", "Песочник", "Qumlik kiyim"),
    (r"zibin", "newborn", "Распашонка", "Ko‘ylakcha"),
    (r"body\s*pantolon", "sets", "Комплект с боди", "Bodili to‘plam"),  # боди + штанишки (+ шапочка)
    (r"body", "bodysuits", "Боди", "Bodi"),
    (r"tulum", "overalls", "Комбинезон", "Kombinezon"),
    (r"patik", "newborn", "Пинетки", "Pinetkalar"),
    (r"sapka|bere\b|bone\b", "newborn", "Шапочка", "Shapkacha"),
    (r"eldiven", "newborn", "Рукавички", "Qo‘lqopchalar"),
    (r"bandana", "newborn", "Бандана", "Bandana"),
    (r"onluk", "newborn", "Нагрудник", "Ko‘krakcha"),
    (r"muslin", "newborn", "Муслиновая пелёнка", "Muslin yo‘rgak"),
    (r"esofman", "sets", "Спортивный костюм", "Sport kostyumi"),
    (r"takim|set\b|(?<!\d)[234]\s*['’`]?\s*l[iu]\b", "sets", "Комплект", "To‘plam"),
    (r"pantolon|tayt", "sets", "Брюки", "Shim"),
    (r"sort\b|short", "sets", "Шорты", "Shortik"),
    (r"mont|ceket|kaban", "sets", "Куртка", "Kurtka"),
    (r"yelek|jile", "sets", "Жилет", "Nimcha"),
    (r"hirka|kazak|sweat|kardigan", "sets", "Кофта", "Kofta"),
    (r"gomlek", "sets", "Рубашка", "Ko‘ylak"),
    (r"t-?shirt|tisort|bluz|atlet", "sets", "Футболка", "Futbolka"),
]
# Запасные правила для русских и узбекских названий
CAT_RULES = [
    ("discharge", r"выписк|chiqish|tug.?ruqxona"),
    ("blankets", r"konvert|конверт|плед|ko.?rpa|одеял|пелён|пелен|yo.?rgak"),
    ("pajamas", r"пижам|pijama|спальн|uyqu|ночн"),
    ("dresses", r"плать|сарафан|ko.?ylak|yubka|юбк|dress"),
    ("bodysuits", r"боди|bodi"),
    ("overalls", r"комбинезон|kombinezon|слип|slip|песочник|человечек"),
    ("newborn", r"новорожд|chaqaloq|распашон|царапк|шапоч|shapka|пинетк|носоч|ползунк|polzunk"),
    ("sets", r"костюм|kostyum|комплект|to.?plam|набор|кофт|футболк|брюк|шорт|свитер|кардиган"),
]
GIRL = r"девоч|qiz\b|\bkiz\b|girl|принцесс|malika"
BOY = r"мальч|o.?g.?il|\berkek\b|boy\b|принц(?!есс)|shahzoda"
GIRL_COLOR = r"pembe|pink|lila|pudra|powder|somon|fusya|gul\s*kurusu|gulkurusu"
BOY_COLOR = r"mavi|blue|lacivert|\blaci\b|indigo"
SIZE_ATTR = r"размер|o.?lcham|size|рост|beden"
COLOR_ATTR = r"цвет|rang|color|renk"
BRAND_ATTR = r"бренд|brand|marka"
JUNK_BRAND = {"", "/", "-", "v1", "v2", "v3", "mix"}
# Написание бренда в BILLZ (поле, атрибут «Бренд» или само название) -> имя для сайта и фильтра по брендам
BRANDS = [
    ("Leo King", r"leo\s*king"), ("U.S. Polo", r"u\.?\s*s\.?\s*polo|\bpolo\b"), ("Sweet Me", r"swe+t\s*me+"),
    ("Monna Rossa", r"mon+a\s*ros+a"), ("Free Sure", r"free\s*sure"), ("BiStyle", r"\bbi\s*style"),
    ("Pamina", r"pamina"), ("Nipperland", r"nipperland"), ("Atelier Babbi", r"atelier|babbi"),
    ("M&Y Collection", r"m\s*&\s*y\b"), ("Puggi", r"\bpug+i\b"), ("Noynoy", r"noynoy"), ("Bebus", r"bebus"),
    ("Cumino", r"cumino"), ("Caramell", r"caramel+"),
]


def request(method, path, token=None, body=None, params=None):
    url = HOST + path + ("?" + urllib.parse.urlencode(params) if params else "")
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Content-Type", "application/json")
    req.add_header("Accept", "application/json")
    if token:
        req.add_header("Authorization", "Bearer " + token)
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.loads(r.read().decode())
        except urllib.error.HTTPError as e:
            if e.code < 500 or attempt == 3:
                raise RuntimeError("BILLZ %s %s -> HTTP %s: %s" % (method, path, e.code, e.read()[:300].decode("utf-8", "replace")))
        except urllib.error.URLError:
            if attempt == 3:
                raise
        time.sleep(2 ** attempt)


def login(secret):
    resp = request("POST", "/v1/auth/login", body={"secret_token": secret})
    token = (resp.get("data") or {}).get("access_token") or resp.get("access_token")
    if not token:
        raise RuntimeError("BILLZ: в ответе на вход нет access_token — проверьте BILLZ_SECRET_TOKEN")
    return token


def fetch_products(token):
    out, page = [], 1
    while page <= 1000:
        resp = request("GET", "/v2/products", token=token, params={"page": page, "limit": PAGE_LIMIT})
        body = resp.get("data") if isinstance(resp.get("data"), dict) else resp
        items = body.get("products") or []
        out.extend(items)
        count = body.get("count") or 0
        if not items or (count and len(out) >= count) or len(items) < PAGE_LIMIT:
            break
        page += 1
    return out


def tr_fold(s):
    """Турецкие буквы → латиница без диакритики, нижний регистр: 'Şapka Çorap Önlük' → 'sapka corap onluk'."""
    s = (s or "").replace("İ", "i").replace("I", "ı").lower()
    return s.translate(str.maketrans("ışçğüöâî", "iscguoai", "̇"))


def by_months(m):
    for k in KEYS:
        hi = int(k[:-1].split("-")[1])
        if m <= hi * (1 if k.endswith("m") else 12):
            return k
    return KEYS[-1]


def size_key(value):
    """'56-62' / '6_9' / '3-6 мес' / '6-12 AY' / '2-3 года' / '4 yaş' / '6' -> ключ сетки сайта; мусор ('-', 'V1', 'MIX') -> None."""
    v = tr_fold(value).replace("–", "-").replace("—", "-").replace("_", "-").replace("*", "-").strip()
    if not v or re.match(r"^v\d", v):
        return None
    nums = [float(n.replace(",", ".")) for n in re.findall(r"\d+(?:[.,]\d+)?", v)]
    if not nums:
        return "One size" if re.search(r"one\s*size|standart|std", v) else None
    if re.search(r"мес|(?<![a-z])oy\b|(?<![a-z])ay\b|month|(?<![a-z])m\b", v):
        return by_months(nums[-1])
    if re.search(r"год|лет|yosh|yas|year|(?<![a-z])y\b", v):
        return by_months(nums[-1] * 12) if nums[-1] < 2 else next((k for k in YEAR_KEYS if nums[-1] <= int(k[:-1].split("-")[1])), YEAR_KEYS[-1])
    if len(nums) >= 2 and nums[-1] <= 36:  # без единиц: 3-6 → месяцы, 2-3 → годы, 1-3 / 24-36 → по верхней границе в месяцах
        pair = "%d-%d" % (nums[0], nums[-1])
        if pair + "m" in MONTH_KEYS:
            return pair + "m"
        if pair + "y" in YEAR_KEYS:
            return pair + "y"
        return by_months(nums[-1])
    if len(nums) == 1 and nums[0] <= 36:  # одно число: 3, 6, 9, 12, 18, 24 — месяцы; 2, 4, 5, 7, 8 — годы
        n = nums[0]
        return by_months(n) if n in TYPICAL_MONTHS else next((k for k in YEAR_KEYS if n <= int(k[:-1].split("-")[1])), YEAR_KEYS[-1])
    h = (nums[0] + nums[-1]) / 2
    if 44 <= h <= 140:  # рост в см
        return next((k for k, top in SIZES if h <= top), KEYS[-1])
    return None


def clean(text):
    text = re.sub(r"<[^>]+>", " ", html.unescape(text or ""))
    return re.sub(r"\s+", " ", text).strip()


def for_shops(rows, shops):
    rows = rows or []
    return [r for r in rows if str(r.get("shop_id")) in shops] if shops else rows


def num(x):
    try:
        return float(x or 0)
    except (TypeError, ValueError):
        return 0.0


def attr(variants, rx):
    for v in variants:
        for a in v.get("product_attributes") or []:
            if re.search(rx, a.get("attribute_name") or "", re.I) and clean(str(a.get("attribute_value") or "")):
                return clean(str(a.get("attribute_value")))
    return ""


def known_brand(text):
    folded = tr_fold(text)
    return next((name for name, rx in BRANDS if re.search(rx, folded)), "")


def brand_of(base, variants):
    """Бренд из поля или атрибута BILLZ, иначе — из названия ('battaniye Sweetme / pudra'); '' — не указан."""
    b = clean(base.get("brand_name")) or attr(variants, BRAND_ATTR)
    if b.lower() in JUNK_BRAND:
        b = ""
    if b:
        return known_brand(b) or (b if b[:1].isupper() else b.title())
    return known_brand(clean(base.get("name")))


UNKNOWN = collections.Counter()

# Артикул магазина: МОДЕЛЬ.ЦВЕТ.РАЗМЕР, например TE1313.GRI.68-74 или TKE2733.LACIVERT.98
SKU_RX = re.compile(r"^\s*([A-Za-z]{1,6}\d{2,7}[A-Za-z]?)\.([^.]+)\.([^.]*)\.?\s*$")
COLOR_NAMES = {
    "mavi": ("голубой", "havorang"), "blue": ("голубой", "havorang"), "bebemavi": ("голубой", "havorang"),
    "bej": ("бежевый", "bej"), "bij": ("бежевый", "bej"), "beige": ("бежевый", "bej"),
    "gri": ("серый", "kulrang"), "grey": ("серый", "kulrang"), "gray": ("серый", "kulrang"),
    "grimelanj": ("серый меланж", "kulrang melanj"), "ekru": ("молочный", "sutrang"), "ecru": ("молочный", "sutrang"),
    "lacivert": ("тёмно-синий", "to‘q ko‘k"), "laci": ("тёмно-синий", "to‘q ko‘k"), "navy": ("тёмно-синий", "to‘q ko‘k"),
    "indigo": ("индиго", "indigo"), "gulkurusu": ("пыльная роза", "chang atirgul"),
    "pembe": ("розовый", "pushti"), "pink": ("розовый", "pushti"), "pudra": ("пудровый", "pudra"), "powder": ("пудровый", "pudra"),
    "beyaz": ("белый", "oq"), "white": ("белый", "oq"), "yesil": ("зелёный", "yashil"), "green": ("зелёный", "yashil"),
    "mint": ("мятный", "yalpiz"), "kahve": ("коричневый", "jigarrang"), "brown": ("коричневый", "jigarrang"),
    "sari": ("жёлтый", "sariq"), "yellow": ("жёлтый", "sariq"), "kirmizi": ("красный", "qizil"), "red": ("красный", "qizil"),
    "lila": ("сиреневый", "nafarmon"), "mor": ("фиолетовый", "binafsha"), "purple": ("фиолетовый", "binafsha"),
    "somon": ("лососевый", "losos"), "krem": ("кремовый", "krem"), "cream": ("кремовый", "krem"),
    "tas": ("цвет камня", "tosh rang"), "vizon": ("норковый", "norka rang"), "fume": ("дымчатый", "tutunrang"),
    "siyah": ("чёрный", "qora"), "black": ("чёрный", "qora"), "nar": ("гранатовый", "anor rang"),
    "haki": ("хаки", "xaki"), "turuncu": ("оранжевый", "to‘q sariq"), "mercan": ("коралловый", "marjon"),
}
NAME_SIZE = re.compile(r"(\d{1,3}\s*[-–_]\s*\d{1,3}\s*(?:ay|aylik|мес|oy|yas|yaş|года?|лет)?|\d{1,2}\s*(?:ay|aylik|мес|oy|yas|yaş|года?|лет)\b)", re.I)
TRAILING_SIZE = re.compile(r"\s*[/|,(-]?\s*(размер|o.?lcham|beden)?\s*\d+\s*[-–_]\s*\d+\s*(мес|ay|oy|см|лет|года?|yas|yaş)?\)?\s*$", re.I)
PIECES_SUFFIX = re.compile(r" \(\d+ (шт\.|dona)\)$")


def parse_sku(sku):
    m = SKU_RX.match(str(sku or ""))
    return (m.group(1).upper(), m.group(2).strip(), m.group(3).strip()) if m else None


def color_name(color):
    return COLOR_NAMES.get(re.sub(r"[^a-z]", "", tr_fold(color)))


def describe(name, cats=""):
    """Категория, русское/узбекское название и признак «тип распознан» по исходному (обычно турецкому) названию."""
    folded = tr_fold(cats + " " + name)
    m = re.search(PIECES, folded)
    pieces = int(m.group(1) or m.group(2)) if m else 0
    for rx, cat, ru, uz in TYPES:
        if re.search(rx, folded):
            if pieces > 1:
                ru, uz = "%s (%d шт.)" % (ru, pieces), "%s (%d dona)" % (uz, pieces)
            return cat, ru, uz, True
    low = (cats + " " + name).lower()
    cat = next((c for c, rx in CAT_RULES if re.search(rx, low)), None)
    if cat:
        return cat, name, name, True
    return "accessories", name, name, False


def group_key(p, parents=()):
    if p.get("parent_id"):
        return "p:" + str(p["parent_id"])
    if p.get("is_variative") or str(p.get("id")) in parents:
        return "p:" + str(p.get("id"))
    s = parse_sku(p.get("sku"))
    if s:  # одна модель одного цвета в разных размерах — одна карточка
        return "s:%s.%s" % (s[0], tr_fold(s[1]))
    return "i:" + str(p.get("id"))


def image_of(p):
    photos = sorted(p.get("photos") or [], key=lambda x: (not x.get("is_main"), x.get("sequence") or 0))
    return p.get("main_image_url_full") or p.get("main_image_url") or (photos[0].get("photo_url") if photos else "")


def variant_size(v):
    found = None
    for a in v.get("product_attributes") or []:
        if re.search(SIZE_ATTR, a.get("attribute_name") or "", re.I):
            found = size_key(str(a.get("attribute_value") or "")) or found
    if not found:
        s = parse_sku(v.get("sku"))
        found = size_key(s[2]) if s and s[2] else None
    if not found:
        m = NAME_SIZE.search(v.get("name") or "")
        found = size_key(m.group(1)) if m else None
    return found


def hit_key(text):
    """'3 lü Takım / V1 / u.s.polo' -> '3litakim/v1/uspolo' — для сравнения со списком хитов."""
    s = re.sub(r"[\s'’`.]", "", tr_fold(text))
    return re.sub(r"(\d)l[iu]", r"\1li", s)


def load_config():
    try:
        with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "site_config.json"), encoding="utf-8") as f:
            return json.load(f)
    except (OSError, ValueError):
        return {}


def load_hits():
    return load_config().get("hits") or []


def model_of(sku_parts):
    return re.match(r"[A-Z]+", sku_parts[0]).group(0) if sku_parts else ""


def sku_gender(model, models):
    """В артикулах магазина пары моделей: TKE/TKK, TE/TK, BE/BK… — E (erkek) для мальчиков, K (kız) для девочек."""
    if len(model) >= 2 and model[-1] == "E" and model[:-1] + "K" in models:
        return "boy"
    if len(model) >= 2 and model[-1] == "K" and model[:-1] + "E" in models:
        return "girl"
    return "unisex"


def transform(raw, shops, show_oos=False, show_no_photo=True, hits=(), default_brand="", overrides=None):
    hit_rules = [[hit_key(w) for w in rule] for rule in hits]
    overrides = overrides or {}
    groups = collections.OrderedDict()
    parents = {str(p["parent_id"]) for p in raw if p.get("parent_id")}
    models = {model_of(parse_sku(p.get("sku"))) for p in raw} - {""}
    for p in raw:
        groups.setdefault(group_key(p, parents), []).append(p)

    products, pending = [], []
    for gid, variants in groups.items():
        pid = gid[2:]
        base = next((v for v in variants if str(v.get("id")) == pid), None) or next((v for v in variants if image_of(v)), variants[0])
        sizes, prices, olds = [], [], []
        for v in variants:
            stock = sum(num(r.get("active_measurement_value")) for r in for_shops(v.get("shop_measurement_values"), shops))
            price_rows = for_shops(v.get("shop_prices"), shops)
            retail = [num(r.get("retail_price")) for r in price_rows if num(r.get("retail_price")) > 0]
            promo = [num(r.get("promo_price")) for r in price_rows if num(r.get("promo_price")) > 0]
            if not retail:
                continue
            if stock <= 0 and not show_oos:
                continue
            if promo and min(promo) < min(retail):
                prices.append(min(promo))
                olds.append(min(retail))
            else:
                prices.append(min(retail))
            k = variant_size(v)
            if k and k not in sizes:
                sizes.append(k)
        if not prices:
            continue

        img = image_of(base) or next((image_of(v) for v in variants if image_of(v)), "")
        if not img and not show_no_photo:
            continue

        sku_parts = parse_sku(base.get("sku"))
        sku = "%s.%s" % sku_parts[:2] if gid.startswith("s:") else str(base.get("sku") or pid)
        full = clean(base.get("name"))
        original = clean(TRAILING_SIZE.sub("", full)) or full
        cats = " ".join(c.get("name") or "" for c in base.get("categories") or [])
        cat, ru, uz, known = describe(original, cats)
        color = attr(variants, COLOR_ATTR) or (sku_parts[1] if sku_parts else "")

        model = model_of(sku_parts)
        brand = brand_of(base, variants)
        hay = tr_fold(cats + " " + full).replace("ё", "е")
        g = "girl" if cat == "dresses" or re.search(GIRL, hay) else "boy" if re.search(BOY, hay) else sku_gender(model, models)
        if g == "unisex" and cat != "accessories":
            fc = tr_fold(color)
            g = "girl" if re.search(GIRL_COLOR, fc) else "boy" if re.search(BOY_COLOR, fc) else "unisex"

        sizes.sort(key=lambda k: KEYS.index(k) if k in KEYS else 99)
        desc = clean(base.get("description"))
        item = {
            "id": "b" + re.sub(r"[^a-zA-Z0-9]", "", sku)[:24],
            "cat": cat, "brand": brand or default_brand, "g": g, "price": int(min(prices)), "sizes": sizes or ["One size"], "img": img,
            "name": {"ru": ru, "uz": uz},
            "desc": {"ru": ((desc + " ") if desc else "") + "Арт. %s · %s" % (sku, original),
                     "uz": ((desc + " ") if desc else "") + "Art. %s · %s" % (sku, original)},
        }
        if olds:
            item["old"] = int(min(olds))
            item["badge"] = "sale"
        else:
            key = hit_key(full + " " + brand)
            if any(all(w in key for w in rule) for rule in hit_rules):
                item["badge"] = "hit"
        products.append(item)
        pending.append((item, known, model, brand, color_name(color)))

    # Тип для товаров, у которых вместо названия артикул: по буквам модели (TE…, TKE…) у остальных товаров
    votes = collections.defaultdict(collections.Counter)
    for item, known, model, _, _ in pending:
        if known and model:
            votes[model][(item["cat"], PIECES_SUFFIX.sub("", item["name"]["ru"]), PIECES_SUFFIX.sub("", item["name"]["uz"]))] += 1
    for item, known, model, brand, cname in pending:
        if not known:
            best = votes[model].most_common(1) if model else []
            if best and best[0][1] >= 3:
                item["cat"], item["name"]["ru"], item["name"]["uz"] = best[0][0]
                if item["cat"] == "dresses":
                    item["g"] = "girl"
            else:
                UNKNOWN[(tr_fold(item["name"]["ru"]).split() or [""])[0]] += 1
        fix = overrides.get(item["id"]) or {}  # ручные правки из site_config.json → product_overrides
        item["cat"] = fix.get("cat", item["cat"])
        item["name"]["ru"], item["name"]["uz"] = fix.get("ru", item["name"]["ru"]), fix.get("uz", item["name"]["uz"])
        if brand and brand.lower() not in item["name"]["ru"].lower():
            item["name"]["ru"] += " " + brand
            item["name"]["uz"] += " " + brand
        if cname:
            item["name"]["ru"] += " · " + cname[0]
            item["name"]["uz"] += " · " + cname[1]

    seen = {}
    for p in products:
        n = seen.get(p["id"], 0)
        seen[p["id"]] = n + 1
        if n:
            p["id"] += "_" + str(n)
    return products


def report(products):
    c = collections.Counter
    print("  по категориям:", dict(c(p["cat"] for p in products).most_common()))
    print("  по полу:", dict(c(p["g"] for p in products).most_common()))
    print("  по брендам:", dict(c(p["brand"] for p in products).most_common()))
    print("  с размерами из сетки:", sum(1 for p in products if p["sizes"] != ["One size"]),
          "| со скидкой:", sum(1 for p in products if p.get("badge") == "sale"),
          "| хитов:", sum(1 for p in products if p.get("badge") == "hit"))
    print("  нераспознанные названия (первое слово, топ):", UNKNOWN.most_common(25))


def unchanged(products):
    try:
        with open(OUT, encoding="utf-8") as f:
            s = f.read()
        old = json.loads(s[s.index("{"):s.rindex("}") + 1])
        return old.get("products") == products
    except (OSError, ValueError, AttributeError):
        return False


def write(products):
    if unchanged(products):
        print("Каталог не изменился — файл не перезаписан")
        return
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    payload = {"synced_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"), "products": products}
    with open(OUT, "w", encoding="utf-8", newline="\n") as f:
        f.write("/* Сгенерировано scripts/sync_billz.py — не редактируйте вручную. */\n")
        f.write("window.BILLZ = " + json.dumps(payload, ensure_ascii=False, separators=(",", ":")).replace('{"id"', '\n{"id"') + ";\n")


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    shops = {s.strip() for s in os.environ.get("BILLZ_SHOP_IDS", "").split(",") if s.strip()}
    show_oos = os.environ.get("BILLZ_SHOW_OUT_OF_STOCK") == "1"
    show_no_photo = os.environ.get("BILLZ_SHOW_NO_PHOTO") == "1"
    fixture = os.environ.get("BILLZ_FIXTURE")
    if fixture:
        with open(fixture, encoding="utf-8") as f:
            raw = json.load(f).get("products") or []
    else:
        secret = os.environ.get("BILLZ_SECRET_TOKEN", "").strip()
        if not secret:
            print("BILLZ_SECRET_TOKEN не задан — синхронизация пропущена, сайт использует js/products.js")
            return 0
        raw = fetch_products(login(secret))
    cfg = load_config()
    products = transform(raw, shops, show_oos, show_no_photo, cfg.get("hits") or [],
                         cfg.get("default_brand") or "", cfg.get("product_overrides") or {})
    print("BILLZ: получено %d позиций, на сайте %d товаров" % (len(raw), len(products)))
    report(products)
    if not products and not fixture:
        print("Нет товаров с ценой и остатком — файл не перезаписан")
        return 0
    write(products)
    return 0


if __name__ == "__main__":
    sys.exit(main())
