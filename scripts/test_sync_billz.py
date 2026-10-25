#!/usr/bin/env python3
"""Проверка sync_billz.py на тестовом ответе API: python scripts/test_sync_billz.py"""
import json
import os
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import sync_billz as sb  # noqa: E402

FIXTURE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fixtures", "billz_products.json")


def load():
    with open(FIXTURE, encoding="utf-8") as f:
        return json.load(f)["products"]


def by_id(products):
    return {p["id"]: p for p in products}


class SizeKeyTest(unittest.TestCase):
    def test_sizes(self):
        cases = {
            # рост
            "56-62": "0-3m", "62-68": "3-6m", "68-74": "6-9m", "74-80": "9-12m", "86": "12-18m", "50-56": "0-3m",
            "80-90": "12-18m", "92-98": "2-3y", "104": "3-4y", "120-120": "6-7y",
            # месяцы и годы с единицами
            "3-6 мес": "3-6m", "0-3 ay": "0-3m", "9-12 oy": "9-12m", "6-12 AY": "9-12m", "0-6 Ay": "3-6m",
            "2-3 года": "2-3y", "4 yaş": "3-4y", "5-6 лет": "5-6y", "1 год": "9-12m", "1-3Y": "2-3y",
            # без единиц (как в BILLZ магазина)
            "6-9": "6-9m", "6_9": "6-9m", "12–18": "12-18m", "2-3": "2-3y", "0-1": "0-3m", "24-36": "2-3y",
            "6": "3-6m", "9": "6-9m", "18": "12-18m", "4": "3-4y",
            # мусор
            "-": None, "/": None, "V1": None, "MIX": None, "XL": None, "One size": "One size",
        }
        for value, key in cases.items():
            self.assertEqual(sb.size_key(value), key, value)


class DescribeTest(unittest.TestCase):
    def test_turkish_names(self):
        cases = {
            "Tulum": ("bodysuits", "Комбинезон"),
            "2 li Takım": ("sets", "Комплект (2 шт.)"),
            "3'lü Takım": ("sets", "Комплект (3 шт.)"),
            "10 lu Set/Tulum lu": ("discharge", "Набор на выписку (10 шт.)"),
            "Şapka": ("newborn", "Шапочка"),
            "ÇORAP": ("newborn", "Носочки"),
            "Elbise": ("dresses", "Платье"),
            "Battaniye": ("discharge", "Плед"),
            "Uyku Tulumu": ("pajamas", "Спальный мешок"),
            "Emzirme Sütyeni": ("accessories", "Для кормления"),
            "Body": ("bodysuits", "Боди"),
            "Salopet": ("bodysuits", "Полукомбинезон"),
            "Ç.Pantolon": ("sets", "Брюки"),
            "Önlük": ("newborn", "Нагрудник"),
            "Пижама для мальчика": ("pajamas", "Пижама для мальчика"),
        }
        for name, (cat, ru) in cases.items():
            got = sb.describe(name)
            self.assertEqual((got[0], got[1]), (cat, ru), name)


class TransformTest(unittest.TestCase):
    def test_groups_variants_and_hides_empty_stock(self):
        p = by_id(sb.transform(load(), set()))
        vyp = p["bCRVYP01"]
        self.assertEqual(vyp["sizes"], ["0-3m"])  # 62-68 без остатка скрыт
        self.assertEqual((vyp["cat"], vyp["g"], vyp["price"]), ("discharge", "girl", 460000))
        self.assertEqual(vyp["img"], "https://cdn.billz.ai/p1_full.jpg")
        self.assertTrue(vyp["desc"]["ru"].startswith("Вязаный комбинезон, боди и шапочка Арт. CR-VYP-01"))
        self.assertNotIn("bCRDRESS9", p)
        self.assertNotIn("badge", vyp)
        self.assertNotIn("stock", vyp)  # остатки не публикуются

    def test_promo_price_becomes_sale(self):
        body = by_id(sb.transform(load(), set()))["bCRBODY3"]
        self.assertEqual((body["price"], body["old"], body["badge"]), (199000, 259000, "sale"))
        self.assertEqual(body["sizes"], ["3-6m", "6-9m"])
        self.assertEqual(body["cat"], "bodysuits")

    def test_turkish_products(self):
        p = by_id(sb.transform(load(), set()))
        t = p["bTRTULUM"]
        self.assertEqual((t["cat"], t["g"], t["sizes"], t["name"]["ru"], t["name"]["uz"]),
                         ("bodysuits", "girl", ["6-9m", "9-12m"], "Комбинезон Caramell · розовый", "Kombinezon Caramell · pushti"))
        self.assertIn("Tulum", t["desc"]["ru"])
        s = p["bTRTAKIM3"]
        self.assertEqual((s["cat"], s["g"], s["sizes"], s["name"]["ru"]), ("sets", "boy", ["9-12m"], "Комплект (3 шт.) Leo King · голубой"))
        self.assertEqual((p["bTRSET10"]["cat"], p["bTRSET10"]["name"]["ru"]), ("discharge", "Набор на выписку (10 шт.)"))
        self.assertEqual((p["bTREMZ"]["cat"], p["bTREMZ"]["g"]), ("accessories", "unisex"))
        self.assertEqual((p["bTRUYKU"]["cat"], p["bTRUYKU"]["sizes"]), ("pajamas", ["3-6m"]))  # размер из названия

    def test_sku_model_color_groups_sizes(self):
        p = by_id(sb.transform(load(), set()))
        grey = p["bTE1313GRI"]
        self.assertEqual((grey["sizes"], grey["price"], grey["img"]), (["3-6m", "6-9m"], 185000, "https://cdn.billz.ai/te1313.jpg"))
        self.assertEqual(grey["name"]["ru"], "Комбинезон · серый")
        self.assertIn("Арт. TE1313.GRI", grey["desc"]["ru"])
        self.assertEqual((p["bTE1313MAVI"]["sizes"], p["bTE1313MAVI"]["g"]), (["6-9m"], "boy"))  # другой цвет — отдельная карточка

    def test_type_learned_from_model_prefix(self):
        k = by_id(sb.transform(load(), set()))["bTKE2052EKRU"]
        self.assertEqual((k["cat"], k["name"]["ru"], k["sizes"]), ("sets", "Комплект · молочный", ["2-3y"]))

    def test_hits_from_config(self):
        hits = [["kozmonot", "monna rossa"], ["3li takim", "v1", "polo"]]
        p = by_id(sb.transform(load(), set(), hits=hits))
        self.assertEqual(p["bUSB3236"].get("badge"), "hit")  # «3 lü takim» = «3li takim»
        self.assertEqual(p["b25931"].get("badge"), "hit")
        self.assertIsNone(p["bUSB3257"].get("badge"))  # 2li — не хит
        self.assertEqual(p["bCRBODY3"]["badge"], "sale")  # скидка не перебивается
        self.assertEqual(sb.load_hits()[0], ["kozmonot", "monna rossa"])

    def test_hide_without_photo(self):
        p = by_id(sb.transform(load(), set(), show_no_photo=False))
        self.assertNotIn("bTRSAPKA", p)
        self.assertNotIn("bCRPJ7", p)
        self.assertIn("bTRTULUM", p)

    def test_shop_filter(self):
        p = by_id(sb.transform(load(), {"s1"}))
        self.assertNotIn("bCRPJ7", p)  # есть только в s2
        self.assertIn("bCRVYP01", p)

    def test_show_out_of_stock(self):
        p = by_id(sb.transform(load(), set(), True))
        self.assertIn("bCRDRESS9", p)
        self.assertEqual(p["bCRVYP01"]["sizes"], ["0-3m", "3-6m"])


class WriteTest(unittest.TestCase):
    def test_writes_once_then_skips_unchanged(self):
        out = os.path.join(tempfile.mkdtemp(), "billz.js")
        sb.OUT = out
        with open(out, "w", encoding="utf-8") as f:
            f.write("window.BILLZ = null;\n")
        products = sb.transform(load(), set())
        sb.write(products)
        first = os.path.getmtime(out)
        with open(out, encoding="utf-8") as f:
            s = f.read()
        self.assertIn('"bCRVYP01"', s)
        self.assertEqual(json.loads(s[s.index("{"):s.rindex("}") + 1])["products"], products)
        os.utime(out, (first - 100, first - 100))
        sb.write(products)
        self.assertEqual(os.path.getmtime(out), first - 100)


if __name__ == "__main__":
    unittest.main(verbosity=2)
