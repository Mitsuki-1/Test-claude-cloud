#!/usr/bin/env python3
"""
Забирает фото из публичного Telegram-канала Caramell (t.me/s/Caramelluz).

Запускается в GitHub Actions раз в час. Скачивает фото последних постов
в assets/tg/, старые удаляет, и пишет js/data/telegram.js:
  window.TG_PHOTOS = [{ src, post, date, text, prices, video }]
Канал публикует в основном видео, поэтому если фото меньше TG_MAX, список
добирается обложками видео: сначала из постов с ценой, потом самыми свежими.

Переменные окружения:
  TG_CHANNEL   — имя канала (по умолчанию Caramelluz)
  TG_MAX       — сколько фото хранить (по умолчанию 48)
  TG_PAGES     — сколько страниц ленты (по 20 постов) просматривать (по умолчанию 25)
  TG_FIXTURE   — путь к сохранённому HTML t.me/s/... (для проверки без сети; файлы не скачиваются и не удаляются)
"""
import html
import json
import os
import re
import sys
import time
import urllib.request
from html.parser import HTMLParser

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
CHANNEL = os.environ.get("TG_CHANNEL", "Caramelluz")
MAX = int(os.environ.get("TG_MAX", "48"))
PAGES = int(os.environ.get("TG_PAGES", "25"))
IMG_DIR = os.path.join(ROOT, "assets", "tg")
OUT = os.path.join(ROOT, "js", "data", "telegram.js")
UA = "Mozilla/5.0 (compatible; CaramellSiteSync/1.0)"
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}
BG = re.compile(r"background-image:url\('([^']+)'\)")
# Посты не про товар (поздравления, опросы, адреса) — их картинки не берём
JUNK = re.compile(r"muborak|поздравл|праздник|бренд|brend|📍|адрес|manzil|mo.?ljal|ориентир|розыгрыш|konkurs", re.I)


def get(url, binary=False):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "ru,uz;q=0.9"})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                data = r.read()
                return data if binary else data.decode("utf-8", "replace")
        except Exception:
            if attempt == 3:
                raise
            time.sleep(2 ** attempt)


class Parser(HTMLParser):
    """Разбирает ленту t.me/s/<channel>: посты, их текст, дату, фото и обложки видео."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.posts, self.cur, self.text_depth, self.depth = [], None, 0, 0

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID:
            self.handle_endtag(tag)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        cls = (a.get("class") or "").split()
        if tag not in VOID:
            self.depth += 1
        if tag == "div" and "tgme_widget_message" in cls and a.get("data-post"):
            self.cur = {"post": a["data-post"].split("/")[-1], "photos": [], "thumbs": [], "text": "", "date": ""}
            self.posts.append(self.cur)
        if not self.cur:
            return
        m = BG.search(a.get("style") or "")
        if m and tag == "a" and "tgme_widget_message_photo_wrap" in cls:
            self.cur["photos"].append(m.group(1))
        if m and tag == "i" and "tgme_widget_message_video_thumb" in cls:
            self.cur["thumbs"].append(m.group(1))
        if tag == "div" and "tgme_widget_message_text" in cls and not self.text_depth:
            self.text_depth = self.depth
        if tag == "br" and self.text_depth:
            self.cur["text"] += "\n"
        if tag == "time" and a.get("datetime") and not self.cur["date"]:
            self.cur["date"] = a["datetime"]

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        if self.text_depth and self.depth == self.text_depth:
            self.text_depth = 0
        self.depth -= 1

    def handle_data(self, data):
        if self.cur and self.text_depth:
            self.cur["text"] += data


def prices(text):
    """'460 000 сум', '460.000', '460000' -> [460000]"""
    out = []
    for m in re.finditer(r"(?<!\d)(\d{2,3})[\s.,  ]?(\d{3})(?!\d)", text):
        n = int(m.group(1) + m.group(2))
        if 30000 <= n <= 5000000 and n not in out:
            out.append(n)
    return out


def collect():
    fixture = os.environ.get("TG_FIXTURE")
    if fixture:
        with open(fixture, encoding="utf-8") as f:
            p = Parser()
            p.feed(f.read())
            return p.posts
    posts, before = [], None
    for _ in range(PAGES):
        p = Parser()
        p.feed(get("https://t.me/s/%s" % CHANNEL + ("?before=%s" % before if before else "")))
        ids = [int(x["post"]) for x in p.posts if x["post"].isdigit()]
        if not ids:
            break
        posts.extend(p.posts)
        before = min(ids)
        if sum(len(x["photos"]) for x in posts) >= MAX:
            break
    return posts


def pick(posts):
    """Фото — в приоритете; если их мало, добираем обложками видео (сначала посты с ценами)."""
    posts = sorted({x["post"]: x for x in posts}.values(), key=lambda x: int(x["post"]) if x["post"].isdigit() else 0, reverse=True)
    posts = [p for p in posts if not JUNK.search(p["text"])]

    def entry(post, url, n, video):
        text = re.sub(r"\n{3,}", "\n\n", html.unescape(post["text"]).strip())
        return {"url": url, "post": post["post"], "name": "%s_%s%d.jpg" % (post["post"], "v" if video else "", n),
                "date": post["date"][:10], "text": text[:600], "prices": prices(text), "video": video}

    photos = [entry(p, u, i, False) for p in posts for i, u in enumerate(p["photos"])]
    thumbs = [entry(p, u, i, True) for p in posts for i, u in enumerate(p["thumbs"])]
    thumbs.sort(key=lambda e: not e["prices"])  # стабильная сортировка: посты с ценой вперёд, внутри — свежие
    chosen = (photos + thumbs)[:MAX]
    chosen.sort(key=lambda e: int(e["post"]) if e["post"].isdigit() else 0, reverse=True)
    return chosen


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    fixture = os.environ.get("TG_FIXTURE")
    items = pick(collect())
    if not items:
        print("Telegram: фото не найдены — оставляю прежние данные")
        return 0

    os.makedirs(IMG_DIR, exist_ok=True)
    keep, out = set(), []
    for it in items:
        path = os.path.join(IMG_DIR, it["name"])
        if not os.path.exists(path) and not fixture:
            try:
                data = get(it["url"], binary=True)
            except Exception as e:
                print("  пропуск %s: %s" % (it["url"], e))
                continue
            with open(path, "wb") as f:
                f.write(data)
        keep.add(it["name"])
        out.append({"src": "assets/tg/" + it["name"], "post": "https://t.me/%s/%s" % (CHANNEL, it["post"]),
                    "date": it["date"], "text": it["text"], "prices": it["prices"], "video": it["video"]})

    if not fixture:
        for f in os.listdir(IMG_DIR):
            if f.endswith(".jpg") and f not in keep:
                os.remove(os.path.join(IMG_DIR, f))

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8", newline="\n") as f:
        f.write("/* Сгенерировано scripts/sync_telegram.py из t.me/%s — не редактируйте вручную. */\n" % CHANNEL)
        f.write("window.TG_PHOTOS = " + json.dumps(out, ensure_ascii=False, indent=1) + ";\n")
    n_photo = sum(1 for o in out if not o["video"])
    print("Telegram: %d фото и %d обложек видео из %d постов" % (n_photo, len(out) - n_photo, len({o["post"] for o in out})))
    return 0


if __name__ == "__main__":
    sys.exit(main())
