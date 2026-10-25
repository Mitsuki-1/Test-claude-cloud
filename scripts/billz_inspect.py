#!/usr/bin/env python3
"""
Диагностика структуры каталога BILLZ: какие поля, атрибуты, категории и магазины приходят из API.
Печатает только названия и счётчики (без цен, остатков и ключа) — логи публичного репозитория видны всем.
Запуск: Actions → Inspect BILLZ catalog → Run workflow (или локально с BILLZ_SECRET_TOKEN).
"""
import collections
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import sync_billz as sb  # noqa: E402


def top(counter, n=40):
    return ", ".join("%s (%d)" % (k, v) for k, v in counter.most_common(n))


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    secret = os.environ.get("BILLZ_SECRET_TOKEN", "").strip()
    if not secret:
        print("BILLZ_SECRET_TOKEN не задан")
        return 1
    raw = sb.fetch_products(sb.login(secret))
    C = collections.Counter
    keys, attrs, cats, shops, first, parents = C(), C(), C(), C(), C(), C()
    attr_vals = collections.defaultdict(C)
    has_parent = with_img = with_photos = with_desc = 0
    price_keys, stock_keys, cat_keys = C(), C(), C()
    for p in raw:
        keys.update(k for k, v in p.items() if v not in (None, "", [], {}))
        if p.get("parent_id"):
            has_parent += 1
            parents[p["parent_id"]] += 1
        with_img += bool(p.get("main_image_url") or p.get("main_image_url_full"))
        with_photos += bool(p.get("photos"))
        with_desc += bool((p.get("description") or "").strip())
        for a in p.get("product_attributes") or []:
            attrs[a.get("attribute_name")] += 1
            if len(attr_vals[a.get("attribute_name")]) < 400:
                attr_vals[a.get("attribute_name")][str(a.get("attribute_value"))] += 1
        for c in p.get("categories") or []:
            cats[c.get("name")] += 1
            cat_keys.update(c.keys())
        for r in p.get("shop_prices") or []:
            price_keys.update(r.keys())
        for r in p.get("shop_measurement_values") or []:
            stock_keys.update(r.keys())
            shops["%s | %s" % (r.get("shop_id"), r.get("shop_name") or "")] += 1
        first[((p.get("name") or "").split() or [""])[0].lower()] += 1

    print("Позиций:", len(raw))
    print("С parent_id:", has_parent, "| разных parent_id:", len(parents), "| вариантов на родителя (топ):", C(parents.values()).most_common(8))
    print("С main_image:", with_img, "| с photos:", with_photos, "| с описанием:", with_desc)
    print("\nПоля товара (сколько раз непустые):", top(keys, 80))
    print("\nПоля shop_prices:", top(price_keys))
    print("Поля shop_measurement_values:", top(stock_keys))
    print("Поля categories:", top(cat_keys))
    print("\nМагазины (shop_id | имя):", top(shops))
    print("\nКатегории:", top(cats, 80))
    print("\nАтрибуты:", top(attrs))
    for name, _ in attrs.most_common(8):
        print("  «%s» значения:" % name, top(attr_vals[name], 40))
    print("\nПервое слово названия:", top(first, 80))
    return 0


if __name__ == "__main__":
    sys.exit(main())
