#!/usr/bin/env python3
"""
Синхронизация каталога с BILLZ 2.0 (api-admin.billz.ai).

Запускается в GitHub Actions (.github/workflows/pages.yml) раз в час.
Результат — js/data/billz.js: window.BILLZ = { synced_at, products: [...] }.
Если товаров нет, сайт показывает товары из js/products.js.

Переменные окружения:
  BILLZ_SECRET_TOKEN      — секретный ключ API из кабинета BILLZ (GitHub → Settings → Secrets)
  BILLZ_SHOP_IDS          — необязательно: id магазинов через запятую, чьи цены и остатки брать
  BILLZ_SHOW_OUT_OF_STOCK — "1", чтобы показывать товары с нулевым остатком (по умолчанию скрываются)
  BILLZ_FIXTURE           — путь к JSON-ответу /v2/products (для проверки без API)
  BILLZ_OUT               — куда писать результат (по умолчанию js/data/billz.js)
"""
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

# Категория сайта по ключевым словам в категориях и названии (порядок важен)
CAT_RULES = [
    ("discharge", r"выписк|chiqish|tug.?ruqxona|konvert|конверт|плед|ko.?rpa"),
    ("pajamas", r"пижам|pijama|спальн|uyqu|ночн"),
    ("dresses", r"плать|сарафан|ko.?ylak|yubka|юбк|dress"),
    ("bodysuits", r"боди|bodi|комбинезон|kombinezon|слип|slip|песочник|ползунк|polzunk|человечек"),
    ("newborn", r"новорожд|chaqaloq|распашон|царапк|шапоч|shapka|пинетк|носоч"),
    ("sets", r"костюм|kostyum|комплект|to.?plam|набор|кофт|футболк|брюк|шорт|свитер|кардиган"),
]
GIRL = r"девоч|qiz|girl|принцесс|malika"
BOY = r"мальч|o.?g.?il|boy|принц(?!есс)|shahzoda"
SIZE_ATTR = r"размер|o.?lcham|size|рост|beden"
COLORS = {"discharge": "#F5DCE2", "pajamas": "#E4ECF8", "dresses": "#F5DCE2",
          "bodysuits": "#EAF0F8", "newborn": "#F4ECE1", "sets": "#EAF0F8"}


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
    while page <= 500:
        resp = request("GET", "/v2/products", token=token, params={"page": page, "limit": PAGE_LIMIT})
        body = resp.get("data") if isinstance(resp.get("data"), dict) else resp
        items = body.get("products") or []
        out.extend(items)
        count = body.get("count") or 0
        if not items or (count and len(out) >= count) or len(items) < PAGE_LIMIT:
            break
        page += 1
    return out


def size_key(value):
    """'56-62' / '62' / '3-6 мес' / '0-3 ay' / '2-3 года' / '4 yaş' / '3-6' -> ключ сетки сайта, иначе исходная строка."""
    raw = (value or "").strip()
    v = raw.lower().replace("–", "-").replace("—", "-")
    nums = [float(n.replace(",", ".")) for n in re.findall(r"\d+(?:[.,]\d+)?", v)]
    if not nums:
        return raw

    def by_months(m):
        for k in KEYS:
            lo, hi = (int(x) for x in k[:-1].split("-"))
            if m <= hi * (1 if k.endswith("m") else 12):
                return k
        return KEYS[-1]

    if re.search(r"мес|\boy\b|\bay\b|month|\bm\b", v):
        return by_months(nums[-1])
    if re.search(r"год|лет|yosh|ya[sş]|year|\by\b", v):
        return by_months(nums[-1] * 12) if nums[-1] < 2 else next((k for k in YEAR_KEYS if nums[-1] <= int(k[:-1].split("-")[1])), YEAR_KEYS[-1])
    if len(nums) == 2 and nums[1] <= 24:  # без единиц: 3-6 → месяцы, 2-3 → годы
        pair = "%d-%d" % (nums[0], nums[1])
        if pair + "m" in MONTH_KEYS:
            return pair + "m"
        if pair + "y" in YEAR_KEYS:
            return pair + "y"
        return raw
    h = (nums[0] + nums[-1]) / 2
    if 44 <= h <= 140:  # рост в см
        return next((k for k, top in SIZES if h <= top), KEYS[-1])
    return raw


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


def transform(raw, shops, show_oos):
    groups = {}
    for p in raw:
        groups.setdefault(p.get("parent_id") or p.get("id"), []).append(p)

    products = []
    for gid, variants in groups.items():
        base = next((v for v in variants if v.get("id") == gid), variants[0])
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
            for a in v.get("product_attributes") or []:
                if re.search(SIZE_ATTR, a.get("attribute_name") or "", re.I):
                    k = size_key(a.get("attribute_value"))
                    if k and k not in sizes:
                        sizes.append(k)
        if not prices:
            continue

        full = clean(base.get("name"))
        name = clean(re.sub(r"\s*[/|,(-]?\s*(размер|o.?lcham)?\s*\d+\s*-\s*\d+\s*(мес|ay|oy|см|лет|года?)?\)?\s*$", "", full, flags=re.I)) or full
        cats = " ".join(c.get("name") or "" for c in base.get("categories") or [])
        hay = (cats + " " + full).lower()
        cat = next((c for c, rx in CAT_RULES if re.search(rx, hay)), "sets")
        g = "girl" if re.search(GIRL, hay) else "boy" if re.search(BOY, hay) else "unisex"

        photos = sorted(base.get("photos") or [], key=lambda x: (not x.get("is_main"), x.get("sequence") or 0))
        img = base.get("main_image_url_full") or base.get("main_image_url") or (photos[0].get("photo_url") if photos else "")
        if not img:
            img = next((v.get("main_image_url_full") or v.get("main_image_url") for v in variants
                        if v.get("main_image_url_full") or v.get("main_image_url")), "")

        sizes.sort(key=lambda k: KEYS.index(k) if k in KEYS else 99)
        desc = clean(base.get("description"))
        item = {
            "id": "b" + re.sub(r"[^a-zA-Z0-9]", "", str(base.get("sku") or gid))[:24],
            "cat": cat, "g": g, "price": int(min(prices)), "sizes": sizes or ["One size"],
            "color": COLORS[cat], "img": img,
            "name": {"ru": name, "uz": name}, "desc": {"ru": desc, "uz": desc},
        }
        if olds:
            item["old"] = int(min(olds))
            item["badge"] = "sale"
        products.append(item)

    seen = {}
    for p in products:
        n = seen.get(p["id"], 0)
        seen[p["id"]] = n + 1
        if n:
            p["id"] += "_" + str(n)
    return products


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
        f.write("window.BILLZ = " + json.dumps(payload, ensure_ascii=False, indent=1) + ";\n")


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    shops = {s.strip() for s in os.environ.get("BILLZ_SHOP_IDS", "").split(",") if s.strip()}
    show_oos = os.environ.get("BILLZ_SHOW_OUT_OF_STOCK") == "1"
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
    products = transform(raw, shops, show_oos)
    print("BILLZ: получено %d позиций, на сайте %d товаров" % (len(raw), len(products)))
    if not products and not fixture:
        print("Нет товаров с ценой и остатком — файл не перезаписан")
        return 0
    write(products)
    return 0


if __name__ == "__main__":
    sys.exit(main())
