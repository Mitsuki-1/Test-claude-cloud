#!/usr/bin/env python3
"""Проверка sync_telegram.py без сети и ffmpeg: python scripts/test_sync_telegram.py"""
import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import sync_telegram as st  # noqa: E402

FIXTURE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fixtures", "tg_feed.html")

FFMPEG_OUT = """frame:0    pts:0       pts_time:0
lavfi.signalstats.YAVG=60.0
lavfi.signalstats.SATAVG=10.0
lavfi.blur=6.0
frame:1    pts:500     pts_time:1.5
lavfi.signalstats.YAVG=150.0
lavfi.signalstats.SATAVG=55.0
lavfi.blur=2.5
frame:2    pts:1000    pts_time:2.0
lavfi.signalstats.YAVG=148.0
lavfi.signalstats.SATAVG=54.0
lavfi.blur=2.6
frame:3    pts:2000    pts_time:6.0
lavfi.signalstats.YAVG=138.0
lavfi.signalstats.SATAVG=40.0
lavfi.blur=3.0
frame:4    pts:2600    pts_time:9.0
lavfi.signalstats.YAVG=240.0
lavfi.signalstats.SATAVG=70.0
lavfi.blur=2.0
frame:5    pts:2700    pts_time:9.5
lavfi.signalstats.YAVG=140.0
lavfi.signalstats.SATAVG=80.0
lavfi.blur=1.0
"""


def posts():
    with open(FIXTURE, encoding="utf-8") as f:
        return st.parse(f.read())


class ParseTest(unittest.TestCase):
    def test_posts_media_and_text(self):
        p = {x["post"]: x for x in posts()}
        self.assertEqual(set(p), {"100", "101", "102", "103"})
        self.assertEqual(p["100"]["photos"], ["https://cdn4.telesco.pe/file/photo100.jpg"])
        self.assertEqual(p["100"]["text"], "Нежный комплект для выписки 🎀\n\nЦена: 460 000 сум")
        self.assertEqual(p["100"]["date"][:10], "2026-10-06")
        self.assertEqual(p["101"]["videos"], ["https://cdn4.telesco.pe/file/video101.mp4?token=abc"])
        self.assertEqual(p["102"]["videos"], [])  # «Media is too big» — файла нет
        self.assertEqual(p["102"]["thumbs"], ["https://cdn4.telesco.pe/file/thumb102.jpg"])
        self.assertEqual(st.prices(p["100"]["text"]), [460000])

    def test_reels_are_latest_downloadable(self):
        self.assertEqual([x["post"] for x in st.pick_reels(posts(), 7)], ["103", "101"])
        self.assertEqual([x["post"] for x in st.pick_reels(posts(), 1)], ["103"])

    def test_collection_is_latest_brand_announcement(self):
        brand, post = st.find_collection(posts())
        self.assertEqual((brand, post["post"]), ("Atelier Babbi", "102"))
        brand, post = st.find_collection([x for x in posts() if x["post"] != "102"])
        self.assertEqual((brand, post["post"]), ("Leo King", "101"))

    def test_junk_posts(self):
        p = {x["post"]: x for x in posts()}
        self.assertTrue(st.JUNK.search(p["103"]["text"]))
        self.assertFalse(st.JUNK.search(p["101"]["text"]))


class FrameTest(unittest.TestCase):
    def test_parse_stats(self):
        f = st.parse_stats(FFMPEG_OUT)
        self.assertEqual(len(f), 6)
        self.assertEqual(f[1], {"t": 1.5, "y": 150.0, "sat": 55.0, "blur": 2.5})

    def test_best_moments_skip_edges_dark_overexposed_and_close_frames(self):
        best = st.best_moments(st.parse_stats(FFMPEG_OUT), k=2, gap=3.0, edge=0.6)
        # 9.5 — последний кадр (край), 0 — тёмный и край, 9.0 — пересвет, 2.0 — слишком близко к 1.5
        self.assertEqual([b["t"] for b in best], [1.5, 6.0])


if __name__ == "__main__":
    unittest.main(verbosity=2)
