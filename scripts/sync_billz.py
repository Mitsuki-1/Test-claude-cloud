#!/usr/bin/env python3
"""
Синхронизация каталога с BILLZ 2.0 (api-admin.billz.ai).

Запускается в GitHub Actions (.github/workflows/pages.yml) раз в час.
Результат — js/data/billz.js: window.BILLZ = { synced_at, products: [...] }.
Сайт берёт товары оттуда; если файл пустой — показывает товары из js/products.js.

Переменные окружения:
  BILLZ_SECRET_TOKEN   — секретный ключ API из кабинета BILLZ (GitHub → Settings → Secrets)
  BILLZ_SHOP_IDS       — необязательно: id магазинов через запятую, чьи цены/остатки брать
  BILLZ_SHOW_OUT_OF_STOCK — "1", чтобы показывать товары с нулевым остатком (по умолчанию скрываются)
  BILLZ_FIXTURE        — путь к JSON-ответу /v2/products (для локальной проверки без API)
"""
import html
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone

HOST = "https://api-admin.billz.ai"
OUT = os.path.join(os.path.dirname(__file__), "..", "js", "data", "billz.js")
PAGE_LIMIT = 100

# Турецкая сетка сайта (как в js/products.js): ключ, рост от/до
SIZES = [("0-3m", 50, 62), ("3-6m", 62, 68), ("6-9m", 68, 74), ("9-12m", 74, 80),
         ("12-18m", 80, 86), ("18-24m", 86, 92), ("2-3y", 92, 98), ("3-4y", 98, 104),
         ("4-5y", 104, 110), ("5-6y", 110, 116), ("6-7y", 116, 122), ("7-8y", 122, 128)]

# Категории сайта по ключевым словам в категории/названии товара BILLZ (порядок важен)
CAT_RULES = [
    ("discharge", r"выписк|chiqish|tug.?ruqxona|konvert|конверт|плед|ko.?rpa"),
    ("pajamas", r"пижам|pijama|спальн|uyqu|ночн"),
    ("dresses", r"плать|сарафан|ko.?ylak|yubka|юбк|dress"),
    ("bodysuits", r"боди|bodi|комбинезон|kombinezon|слип|slip|песочник|ползунк|polzunk|человечек"),
    ("newborn", r"новорожд|chaqaloq|распашон|царапк|шапоч|shapka|пинетк|носоч"),
    ("sets", r"костюм|kostyum|комплект|to.?plam|набор|кофт|футболк|брюк|шорт|свитер|кардиган"),
]
GIRL = r"девоч|qiz|girl|принцесс|malika"
BOY = r"мальч|o.?g.?il|boy|принц\b|shahzoda"
SIZE_ATTR = r"размер|o.?lcham|size|рост|beden"
COLORS = {"discharge": "#F5DCE2", "pajamas": "#E4ECF8", "dresses": "#F5DCE2",
          "bodysuits": "#EAF0F8", "newborn": "#F4ECE1", "sets": "#EAF0F8"}


def request(method, path, token=None, body=None, params=None):
    url = HOST + path
    if params:
        url += "?" + "&".join("%s=%s" % (k, urllib.request.quote(str(v))) for k, v in params.items())
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
                raise RuntimeError("BILLZ %s %s -> HTTP %s: %s" % (method, path, e.code, e.read()[:300]))
        except urllib.error.URLError:
            if attempt == 3:
                raise
        time.sleep(2 ** attempt)


def login(secret):
    resp = request("POST", "/v1/auth/login", body={"secret_token": secret})
    data = resp.get("data") or {}
    if not data.get("access_token"):
        raise RuntimeError("BILLZ: не удалось войти — проверьте BILLZ_SECRET_TOKEN")
    return data["access_token"]


def fetch_products(token):
    out, page = [], 1
    while True:
        resp = request("GET", "/v2/products", token=token, params={"page": page, "limit": PAGE_LIMIT})
        items = resp.get("products") or []
        out.extend(items)
        count = resp.get("count") or 0
        if not items or len(out) >= count or page > 200:
            return out
        page += 1


def size_key(value):
    """'62-68' / '56' / '3-6 мес' / '0-3 ay' / '2-3 года' / '4 yosh' -> ключ сетки сайта или исходная строка."""
    v = value.strip().lower().replace("–", "-").replace("—", "-")
    nums = [float(n.replace(",", ".")) for n in re.findall(r"\d+(?:[.,]\d+)?", v)]
    if not nums:
        return value.strip()
    if re.search(r"мес|oy\b|ay\b|month|\bm\b", v):
        months = nums[-1]
        for k, lo, hi in SIZES:
            a = {"m": 1}.get(k[-1], 12)
            top = int(k[:-1].split("-")[1]) * a
            if months <= top:
                return k
    if re.search(r"год|лет|yosh|yas|year|\by\b", v):
        years = nums[-1]
        for k, lo, hi in SIZES:
            if k.endswith("y") and years <= int(k[:-1].split("-")[1]):
                return k
        return SIZES[-1][0]
    h = (nums[0] + nums[-1]) / 2 if len(nums) > 1 else nums[0]
    if 44 <= h <= 140:  # рост в см
        for k, lo, hi in SIZES:
            if h <= hi:
                return k
        return SIZES[-1][0]
    return value.strip()


def clean(text):
    text = re.sub(r"<[^>]+>", " ", html.unescape(text or ""))
    return re.sub(r"\s+", " ", text).strip()


def pick_shop(rows, shops, key):
    rows = rows or []
    if shops:
        rows = [r for r in rows if r.get("shop_id") in shops] or []
    return rows


def transform(raw, shops, show_oos):
    groups = {}
    for p in raw:
        key = p.get("parent_id") or p.get("id")
        groups.setdefault(key, []).append(p)

    products = []
    for gid, variants in groups.items():
        base = next((v for v in variants if v.get("id") == gid), variants[0])
        sizes, stock_total, prices, olds = [], 0, [], []
        for v in variants:
            stock = sum(float(r.get("active_measurement_value") or 0) for r in pick_shop(v.get("shop_measurement_values"), shops, "stock"))
            price_rows = pick_shop(v.get("shop_prices"), shops, "price")
            retail = [float(r["retail_price"]) for r in price_rows if r.get("retail_price")]
            promo = [float(r["promo_price"]) for r in price_rows if r.get("promo_price")]
            if not retail:
                continue
            stock_total += max(stock, 0)
            if stock <= 0 and not show_oos:
                continue
            if promo and min(promo) < min(retail):
                prices.append(min(promo)); olds.append(min(retail))
            else:
                prices.append(min(retail))
            for a in v.get("product_attributes") or []:
                if re.search(SIZE_ATTR, (a.get("attribute_name") or ""), re.I):
                    k = size_key(a.get("attribute_value") or "")
                    if k and k not in sizes:
                        sizes.append(k)
        if not prices:
            continue

        name = clean(re.sub(r"\s*[/|,]?\s*(размер|o.?lcham)?\s*\d+\s*-\s*\d+\s*(мес|ay|oy|см)?\s*$", "", base.get("name") or "", flags=re.I)) or clean(base.get("name"))
        cats = " ".join(c.get("name") or "" for c in base.get("categories") or [])
        hay = (cats + " " + name).lower()
        cat = next((c for c, rx in CAT_RULES if re.search(rx, hay)), "sets")
        g = "girl" if re.search(GIRL, hay) else "boy" if re.search(BOY, hay) else "unisex"

        photos = sorted(base.get("photos") or [], key=lambda x: (not x.get("is_main"), x.get("sequence") or 0))
        img = base.get("main_image_url_full") or base.get("main_image_url") or (photos[0]["photo_url"] if photos else "")
        if not img:
            img = next((v.get("main_image_url_full") or v.get("main_image_url") for v in variants if v.get("main_image_url")), "")

        sizes.sort(key=lambda k: next((i for i, s in enumerate(SIZES) if s[0] == k), 99))
        price = min(prices)
        item = {
            "id": "b" + re.sub(r"[^a-zA-Z0-9]", "", str(base.get("sku") or gid))[:24],
            "cat": cat, "g": g, "price": int(price), "sizes": sizes or ["One size"],
            "color": COLORS[cat], "img": img,
            "name": {"ru": name, "uz": name},
            "desc": {"ru": clean(base.get("description")), "uz": clean(base.get("description"))},
            "stock": int(stock_total), "billz": True,
        }
        if olds:
            item["old"] = int(min(olds)); item["badge"] = "sale"
        products.append(item)

    # уникальные id
    seen = {}
    for p in products:
        n = seen.get(p["id"], 0); seen[p["id"]] = n + 1
        if n:
            p["id"] += "_" + str(n)
    return products


def write(products):
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    payload = {"synced_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"), "products": products}
    with open(OUT, "w", encoding="utf-8") as f:
        f.write("/* Сгенерировано scripts/sync_billz.py — не редактируйте вручную. */\n")
        f.write("window.BILLZ = " + json.dumps(payload, ensure_ascii=False, indent=1) + ";\n")


def main():
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
        print("Нет товаров с ценой/остатком — файл не перезаписан")
        return 0
    write(products)
    return 0


if __name__ == "__main__":
    sys.exit(main())
