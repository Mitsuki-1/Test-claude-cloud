#!/usr/bin/env python3
"""Проверка sync_billz.py на тестовом ответе API: python scripts/test_sync_billz.py"""
import json
import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import sync_billz as sb  # noqa: E402

FIXTURE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fixtures", "billz_products.json")


def load():
    with open(FIXTURE, encoding="utf-8") as f:
        return json.load(f)["products"]


class SizeKeyTest(unittest.TestCase):
    def test_sizes(self):
        cases = {
            "56-62": "0-3m", "62-68": "3-6m", "68-74": "6-9m", "74-80": "9-12m", "86": "12-18m",
            "3-6 мес": "3-6m", "0-3 ay": "0-3m", "9-12 oy": "9-12m", "6-9": "6-9m",
            "2-3 года": "2-3y", "4 yaş": "3-4y", "5-6 лет": "5-6y", "1 год": "9-12m", "2-3": "2-3y",
            "One size": "One size", "XL": "XL",
        }
        for value, key in cases.items():
            self.assertEqual(sb.size_key(value), key, value)


class TransformTest(unittest.TestCase):
    def by_sku(self, products):
        return {p["id"]: p for p in products}

    def test_groups_variants_and_hides_empty_stock(self):
        p = self.by_sku(sb.transform(load(), set(), False))
        self.assertEqual(set(p), {"bCRVYP01", "bCRBODY3", "bCRPJ7", "bCRHAT"})
        vyp = p["bCRVYP01"]
        self.assertEqual(vyp["sizes"], ["0-3m"])  # 62-68 без остатка скрыт
        self.assertEqual((vyp["cat"], vyp["g"], vyp["price"]), ("discharge", "girl", 460000))
        self.assertEqual(vyp["img"], "https://cdn.billz.ai/p1_full.jpg")
        self.assertEqual(vyp["desc"]["ru"], "Вязаный комбинезон, боди и шапочка")
        self.assertNotIn("badge", vyp)

    def test_promo_price_becomes_sale(self):
        body = self.by_sku(sb.transform(load(), set(), False))["bCRBODY3"]
        self.assertEqual((body["price"], body["old"], body["badge"]), (199000, 259000, "sale"))
        self.assertEqual(body["sizes"], ["3-6m", "6-9m"])
        self.assertEqual(body["cat"], "bodysuits")

    def test_category_gender_and_one_size(self):
        p = self.by_sku(sb.transform(load(), set(), False))
        self.assertEqual((p["bCRPJ7"]["cat"], p["bCRPJ7"]["g"], p["bCRPJ7"]["sizes"]), ("pajamas", "boy", ["2-3y", "3-4y"]))
        self.assertEqual((p["bCRHAT"]["cat"], p["bCRHAT"]["sizes"], p["bCRHAT"]["img"]), ("newborn", ["One size"], "https://cdn.billz.ai/p5.jpg"))

    def test_shop_filter(self):
        p = self.by_sku(sb.transform(load(), {"s1"}, False))
        self.assertNotIn("bCRPJ7", p)  # есть только в s2
        self.assertIn("bCRVYP01", p)

    def test_show_out_of_stock(self):
        p = self.by_sku(sb.transform(load(), set(), True))
        self.assertIn("bCRDRESS9", p)
        self.assertEqual(p["bCRVYP01"]["sizes"], ["0-3m", "3-6m"])


class WriteTest(unittest.TestCase):
    def test_writes_once_then_skips_unchanged(self):
        import tempfile
        out = os.path.join(tempfile.mkdtemp(), "billz.js")
        sb.OUT = out
        with open(out, "w", encoding="utf-8") as f:
            f.write("window.BILLZ = null;\n")
        products = sb.transform(load(), set(), False)
        sb.write(products)
        first = os.path.getmtime(out)
        with open(out, encoding="utf-8") as f:
            self.assertIn('"bCRVYP01"', f.read())
        os.utime(out, (first - 100, first - 100))
        sb.write(products)
        self.assertEqual(os.path.getmtime(out), first - 100)


if __name__ == "__main__":
    unittest.main(verbosity=2)
