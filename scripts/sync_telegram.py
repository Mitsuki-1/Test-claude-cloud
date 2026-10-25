#!/usr/bin/env python3
"""
Забирает фото из публичного Telegram-канала Caramell (t.me/s/Caramelluz).

Запускается в GitHub Actions раз в час. Скачивает фото последних постов
в assets/tg/, старые удаляет, и пишет js/data/telegram.js:
  window.TG_PHOTOS = [{ src, post, date, text, prices }]
Сайт использует эти фото в галерее, плитках категорий и для товаров,
у которых нет своего фото (по совпадению цены в тексте поста).

Переменные окружения:
  TG_CHANNEL   — имя канала (по умолчанию Caramelluz)
  TG_MAX       — сколько фото хранить (по умолчанию 48)
  TG_FIXTURE   — путь к сохранённому HTML t.me/s/... (для локальной проверки)
"""
import html
import json
import os
import re
import sys
import time
import urllib.request
from html.parser import HTMLParser

ROOT = os.path.join(os.path.dirname(__file__), "..")
CHANNEL = os.environ.get("TG_CHANNEL", "Caramelluz")
MAX = int(os.environ.get("TG_MAX", "48"))
IMG_DIR = os.path.join(ROOT, "assets", "tg")
OUT = os.path.join(ROOT, "js", "data", "telegram.js")
UA = "Mozilla/5.0 (compatible; CaramellSiteSync/1.0)"


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
    """Разбирает ленту t.me/s/<channel>: посты, их текст, дату и фото."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.posts, self.cur, self.text_depth, self.depth = [], None, 0, 0

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        cls = a.get("class") or ""
        self.depth += 1
        if tag == "div" and "tgme_widget_message " in cls + " " and a.get("data-post"):
            self.cur = {"post": a["data-post"].split("/")[-1], "photos": [], "text": "", "date": ""}
            self.posts.append(self.cur)
        if not self.cur:
            return
        if tag == "a" and "tgme_widget_message_photo_wrap" in cls:
            m = re.search(r"background-image:url\('([^']+)'\)", a.get("style") or "")
            if m:
                self.cur["photos"].append(m.group(1))
        if tag == "div" and "tgme_widget_message_text" in cls and not self.text_depth:
            self.text_depth = self.depth
        if tag == "br" and self.text_depth:
            self.cur["text"] += "\n"
        if tag == "time" and a.get("datetime"):
            self.cur["date"] = a["datetime"]

    def handle_endtag(self, tag):
        if self.text_depth and self.depth == self.text_depth:
            self.text_depth = 0
        self.depth -= 1

    def handle_data(self, data):
        if self.cur and self.text_depth:
            self.cur["text"] += data


def prices(text):
    """'460 000 сум', '460.000', '460000' -> [460000]"""
    out = []
    for m in re.finditer(r"(\d{2,3})[\s., ]?(\d{3})(?!\d)", text):
        n = int(m.group(1) + m.group(2))
        if 30000 <= n <= 5000000 and n not in out:
            out.append(n)
    return out


def collect():
    fixture = os.environ.get("TG_FIXTURE")
    if fixture:
        with open(fixture, encoding="utf-8") as f:
            p = Parser(); p.feed(f.read()); return p.posts
    posts, before = [], None
    for _ in range(8):  # до ~160 последних постов
        url = "https://t.me/s/%s" % CHANNEL + ("?before=%s" % before if before else "")
        p = Parser(); p.feed(get(url))
        if not p.posts:
            break
        posts = p.posts + posts
        before = min(int(x["post"]) for x in p.posts if x["post"].isdigit())
        if sum(len(x["photos"]) for x in posts) >= MAX:
            break
    return posts


def main():
    posts = collect()
    posts.sort(key=lambda x: int(x["post"]) if x["post"].isdigit() else 0, reverse=True)
    items = []
    for post in posts:
        text = html.unescape(post["text"]).strip()
        for i, url in enumerate(post["photos"]):
            items.append({"url": url, "post": post["post"], "n": i, "date": post["date"][:10],
                          "text": re.sub(r"\n{3,}", "\n\n", text)[:600], "prices": prices(text)})
            if len(items) >= MAX:
                break
        if len(items) >= MAX:
            break

    if not items:
        print("Telegram: фото не найдены — оставляю прежние данные")
        return 0

    os.makedirs(IMG_DIR, exist_ok=True)
    keep, out = set(), []
    for it in items:
        name = "%s_%d.jpg" % (it["post"], it["n"])
        path = os.path.join(IMG_DIR, name)
        keep.add(name)
        if not os.path.exists(path) and not os.environ.get("TG_FIXTURE"):
            try:
                data = get(it["url"], binary=True)
            except Exception as e:
                print("  пропуск %s: %s" % (it["url"], e)); keep.discard(name); continue
            with open(path, "wb") as f:
                f.write(data)
        out.append({"src": "assets/tg/" + name, "post": "https://t.me/%s/%s" % (CHANNEL, it["post"]),
                    "date": it["date"], "text": it["text"], "prices": it["prices"]})

    for f in os.listdir(IMG_DIR):
        if f.endswith(".jpg") and f not in keep:
            os.remove(os.path.join(IMG_DIR, f))

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        f.write("/* Сгенерировано scripts/sync_telegram.py из t.me/%s — не редактируйте вручную. */\n" % CHANNEL)
        f.write("window.TG_PHOTOS = " + json.dumps(out, ensure_ascii=False, indent=1) + ";\n")
    print("Telegram: %d фото из %d постов" % (len(out), len({o['post'] for o in out})))
    return 0


if __name__ == "__main__":
    sys.exit(main())
