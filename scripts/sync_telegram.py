#!/usr/bin/env python3
"""
Забирает медиа из публичного Telegram-канала Caramell (t.me/s/Caramelluz).

Запускается в GitHub Actions раз в час и пишет js/data/telegram.js:
  window.TG_PHOTOS     — фото постов, лучшие кадры из видео и обложки видео
                         [{ src, post, date, text, prices, kind: photo|frame|thumb, score, kids }]
  window.TG_REELS      — последние ролики для блока «Смотрите вживую» [{ src, post, date, text, poster }]
  window.TG_COLLECTION — последняя анонсированная коллекция { brand, post, date, text, img, video }

Публичная лента отдаёт файл только у небольших видео (у больших — «Media is too big»),
поэтому ролики и кадры берутся из тех постов, где файл доступен.
Кадры выбираются через ffmpeg (в GitHub Actions он есть): самые насыщенные, хорошо
освещённые и резкие моменты. Без ffmpeg ролики сохраняются как есть, а кадры остаются прежними.

Настройки — scripts/site_config.json: reels_count, kids_posts (посты со съёмкой детей),
skip_frames (неудачные кадры), featured_frames (лучшие кадры в порядке показа).
Переменные окружения: TG_CHANNEL, TG_PAGES (страниц ленты по 20 постов, по умолчанию 25).
"""
import html
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.request
from html.parser import HTMLParser

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..")
CHANNEL = os.environ.get("TG_CHANNEL", "Caramelluz")
PAGES = int(os.environ.get("TG_PAGES", "25"))
IMG_DIR = os.path.join(ROOT, "assets", "tg")
REEL_DIR = os.path.join(ROOT, "assets", "reels")
OUT = os.path.join(ROOT, "js", "data", "telegram.js")
UA = "Mozilla/5.0 (compatible; CaramellSiteSync/1.0)"
FFMPEG = shutil.which("ffmpeg")

MAX_PHOTOS = 24       # фото постов
MAX_THUMBS = 16       # обложки видео из постов с ценой (для подбора фото товара по цене)
FRAME_POSTS = 40      # из скольких свежих скачиваемых видео брать кадры
FRAMES_PER_VIDEO = 2
KIDS_FRAMES = 4       # кандидатов из роликов с детьми (лучшие отбираются вручную в featured_frames)

VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}
BG = re.compile(r"background-image:url\('([^']+)'\)")
# Посты не про товар (поздравления, опросы, адреса) — их картинки не берём
JUNK = re.compile(r"muborak|поздравл|праздник|бренд|brend|📍|адрес|manzil|mo.?ljal|ориентир|розыгрыш|konkurs|пожелани|taklif", re.I)
COLLECTION = re.compile(r"коллекц|collection|kolleksiy|новые комплекты|yangi komplekt|новинк", re.I)
BRANDS = [("Atelier Babbi", r"atelier\s*bab+[iy]"), ("Leo King", r"leo\s*king"), ("U.S. Polo", r"u\.?\s*s\.?\s*polo"),
          ("Monna Rosa", r"mon+a\s*ros+a"), ("Sweet Me", r"swee?t\s*me"), ("Baby Theatre", r"baby\s*theat"),
          ("Pamina", r"pamina"), ("Katamino", r"katamino"), ("BiStyle", r"bi\s*style"), ("Nipperland", r"nipperland"),
          ("Caramell", r"caramell")]


def load_config():
    try:
        with open(os.path.join(HERE, "site_config.json"), encoding="utf-8") as f:
            return json.load(f)
    except (OSError, ValueError):
        return {}


def get(url, binary=False):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "ru,uz;q=0.9"})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                data = r.read()
                return data if binary else data.decode("utf-8", "replace")
        except Exception:
            if attempt == 3:
                raise
            time.sleep(2 ** attempt)


class Parser(HTMLParser):
    """Разбирает ленту t.me/s/<channel>: посты, текст, дату, фото, обложки и файлы видео."""

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
            self.cur = {"post": a["data-post"].split("/")[-1], "photos": [], "thumbs": [], "videos": [], "text": "", "date": ""}
            self.posts.append(self.cur)
        if not self.cur:
            return
        m = BG.search(a.get("style") or "")
        if m and tag == "a" and "tgme_widget_message_photo_wrap" in cls:
            self.cur["photos"].append(m.group(1))
        if m and tag == "i" and "tgme_widget_message_video_thumb" in cls:
            self.cur["thumbs"].append(m.group(1))
        if tag == "video" and a.get("src") and a["src"] not in self.cur["videos"]:
            self.cur["videos"].append(a["src"])
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


def parse(html_text):
    p = Parser()
    p.feed(html_text)
    for post in p.posts:
        post["text"] = re.sub(r"\n{3,}", "\n\n", html.unescape(post["text"]).strip())
    return p.posts


def prices(text):
    """'460 000 сум', '460.000', '460000' -> [460000]"""
    out = []
    for m in re.finditer(r"(?<!\d)(\d{2,3})[\s.,  ]?(\d{3})(?!\d)", text):
        n = int(m.group(1) + m.group(2))
        if 30000 <= n <= 5000000 and n not in out:
            out.append(n)
    return out


def pid(post):
    return int(post["post"]) if str(post["post"]).isdigit() else 0


def collect(pages):
    posts, before = {}, None
    for _ in range(pages):
        page = parse(get("https://t.me/s/%s" % CHANNEL + ("?before=%s" % before if before else "")))
        ids = [pid(x) for x in page if pid(x)]
        if not ids:
            break
        for x in page:
            posts[x["post"]] = x
        before = min(ids)
    return sorted(posts.values(), key=pid, reverse=True)


def fetch_post(post_id):
    """Пост по id (нужен для старых постов со съёмкой детей): ссылка на видео живёт несколько часов."""
    for x in parse(get("https://t.me/s/%s?before=%d" % (CHANNEL, int(post_id) + 1))):
        if x["post"] == str(post_id):
            return x
    return None


def pick_reels(posts, count):
    """Последние посты с доступным файлом видео, от новых к старым."""
    return [p for p in sorted(posts, key=pid, reverse=True) if p["videos"]][:count]


def find_collection(posts):
    """Последний пост-анонс коллекции с узнаваемым брендом."""
    for p in sorted(posts, key=pid, reverse=True):
        if not COLLECTION.search(p["text"]):
            continue
        for brand, rx in BRANDS:
            if re.search(rx, p["text"], re.I):
                return brand, p
    return None, None


# ---------- ffmpeg ----------

def run(args, timeout=300):
    return subprocess.run(args, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=timeout, text=True, encoding="utf-8", errors="replace")


def parse_stats(text):
    """Вывод ffmpeg metadata=print → [{t, y, sat, blur}]."""
    frames, cur = [], None
    for line in text.splitlines():
        m = re.search(r"pts_time:([\d.]+)", line)
        if m:
            cur = {"t": float(m.group(1)), "y": 128.0, "sat": 0.0, "blur": 0.0}
            frames.append(cur)
            continue
        if cur is None:
            continue
        m = re.search(r"lavfi\.(signalstats\.YAVG|signalstats\.SATAVG|blur)=([\d.]+)", line)
        if m:
            cur[{"signalstats.YAVG": "y", "signalstats.SATAVG": "sat", "blur": "blur"}[m.group(1)]] = float(m.group(2))
    return frames


def frame_score(f):
    """Насыщенность цвета + яркость около середины + резкость."""
    return f["sat"] * 1.2 - abs(f["y"] - 140) * 0.45 - f["blur"] * 4


def best_moments(frames, k=FRAMES_PER_VIDEO, gap=3.0, edge=0.6, start=1.5):
    """Лучшие моменты: без заставки в начале (start, сек) и последних edge секунд, не ближе gap друг к другу."""
    if not frames:
        return []
    end = max(f["t"] for f in frames)
    cands = [f for f in frames if max(edge, start) <= f["t"] <= end - edge] or frames
    out = []
    for f in sorted(cands, key=frame_score, reverse=True):
        if all(abs(f["t"] - o["t"]) >= gap for o in out):
            out.append(f)
        if len(out) >= k:
            break
    return out


def analyze(path):
    for flt in ("fps=2,scale=360:-2,signalstats,blurdetect=block_width=32:block_height=32,metadata=print:file=-",
                "fps=2,scale=360:-2,signalstats,metadata=print:file=-"):
        r = run([FFMPEG, "-hide_banner", "-nostats", "-i", path, "-vf", flt, "-an", "-f", "null", "-"])
        if r.returncode == 0:
            return parse_stats(r.stdout)
    return []


def extract(path, t, out):
    r = run([FFMPEG, "-hide_banner", "-loglevel", "error", "-y", "-ss", "%.2f" % t, "-i", path, "-frames:v", "1",
             "-vf", "scale='min(1080,iw)':-2", "-q:v", "3", out])
    return r.returncode == 0 and os.path.exists(out)


def compress(src, out):
    r = run([FFMPEG, "-hide_banner", "-loglevel", "error", "-y", "-i", src, "-an", "-vf", "scale='min(720,iw)':-2",
             "-c:v", "libx264", "-preset", "veryfast", "-crf", "28", "-pix_fmt", "yuv420p", "-movflags", "+faststart", out], timeout=600)
    return r.returncode == 0 and os.path.getsize(out) > 0


def download(url, path):
    with open(path, "wb") as f:
        f.write(get(url, binary=True))


def save_video(post, stem):
    """Сохранить видео поста в assets/reels: сжатое — <stem>.720.mp4, без ffmpeg — оригинал <stem>.mp4.
    Возвращает имя файла или "". Оригинал из прошлых запусков сжимается без повторного скачивания."""
    small, orig = stem + ".720.mp4", stem + ".mp4"
    small_path, orig_path = os.path.join(REEL_DIR, small), os.path.join(REEL_DIR, orig)
    if os.path.exists(small_path):
        return small
    try:
        if not os.path.exists(orig_path):
            download(post["videos"][0], orig_path + ".part")
            os.replace(orig_path + ".part", orig_path)
    except Exception as e:
        print("  видео %s не скачалось: %s" % (post["post"], e))
        for f in (orig_path + ".part", orig_path):
            if os.path.exists(f):
                os.remove(f)
        return ""
    if FFMPEG and compress(orig_path, small_path):
        os.remove(orig_path)
        return small
    if os.path.exists(small_path):
        os.remove(small_path)
    return orig


# ---------- main ----------

def entry(post, src, kind, score=0, kids=False):
    return {"src": src, "post": "https://t.me/%s/%s" % (CHANNEL, post["post"]), "date": post["date"][:10],
            "text": post["text"][:600], "prices": prices(post["text"]), "kind": kind, "score": round(score, 1), "kids": kids}


def load_previous():
    try:
        with open(OUT, encoding="utf-8") as f:
            s = f.read()
        m = re.search(r"window\.TG_PHOTOS = (\[.*?\]);\n", s, re.S)
        return json.loads(m.group(1)) if m else []
    except (OSError, ValueError):
        return []


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    cfg = load_config()
    reels_count = int(cfg.get("reels_count", 7))
    kids_posts = [str(x) for x in cfg.get("kids_posts", [])]
    skip = set(cfg.get("skip_frames", []))  # кадры с надписями-заставками, логотипами и т. п.
    os.makedirs(IMG_DIR, exist_ok=True)
    os.makedirs(REEL_DIR, exist_ok=True)

    posts = collect(PAGES)
    if not posts:
        print("Telegram: лента недоступна — оставляю прежние данные")
        return 0
    by_id = {p["post"]: p for p in posts}
    clean_posts = [p for p in posts if not JUNK.search(p["text"])]
    keep, items = set(), []

    # Ролики «Смотрите вживую»: последние доступные видео
    reels = []
    for p in pick_reels(posts, reels_count):
        name = save_video(p, p["post"])
        if name:
            reels.append({"src": "assets/reels/" + name, "post": "https://t.me/%s/%s" % (CHANNEL, p["post"]),
                          "date": p["date"][:10], "text": p["text"][:220], "poster": ""})

    # Кадры из видео
    previous = {e["src"]: e for e in load_previous() if e.get("kind") == "frame"}
    frame_posts = [p for p in clean_posts if p["videos"]][:FRAME_POSTS]
    missing_kids = [k for k in kids_posts if k not in by_id or not by_id[k]["videos"]]
    for k in missing_kids:
        if any(n.startswith("k_%s_" % k) for n in os.listdir(IMG_DIR)) or not FFMPEG:
            continue
        try:
            p = fetch_post(k)
        except Exception as e:
            print("  пост %s не загрузился: %s" % (k, e))
            p = None
        if p:
            by_id[k] = p
    frame_posts += [by_id[k] for k in kids_posts if k in by_id and by_id[k] not in frame_posts]
    for k in kids_posts:  # кадры детей сохраняются, даже если пост ушёл из ленты
        for n in os.listdir(IMG_DIR):
            src = "assets/tg/" + n
            if n.startswith("k_%s_" % k) and n[:-4] not in skip and src in previous and k not in {p["post"] for p in frame_posts}:
                e = dict(previous[src], kids=True)
                items.append(e)
                keep.add(n)

    n_new = 0
    for p in frame_posts:
        kids = p["post"] in kids_posts
        prefix = ("k_%s_" if kids else "f_%s_") % p["post"]
        have = sorted(n for n in os.listdir(IMG_DIR) if n.startswith(prefix) and n[:-4] not in skip)
        if have or any(x.startswith(prefix) for x in skip):
            for n in have:
                old = previous.get("assets/tg/" + n, {})
                items.append(entry(p, "assets/tg/" + n, "frame", old.get("score", 0), kids))
                keep.add(n)
            continue
        if not FFMPEG or not p["videos"]:
            continue
        reel = next((os.path.join(REEL_DIR, p["post"] + ext) for ext in (".mp4", ".720.mp4")
                     if os.path.exists(os.path.join(REEL_DIR, p["post"] + ext))), "")
        with tempfile.TemporaryDirectory() as tmp:
            path = reel or os.path.join(tmp, "v.mp4")
            try:
                if not reel:
                    download(p["videos"][0], path)
            except Exception as e:
                print("  видео %s не скачалось: %s" % (p["post"], e))
                continue
            moments = best_moments(analyze(path), k=KIDS_FRAMES, gap=2.5) if kids else best_moments(analyze(path))
            for i, f in enumerate(moments):
                name = "%s%d.jpg" % (prefix, i)
                if name[:-4] in skip:
                    continue
                if extract(path, f["t"], os.path.join(IMG_DIR, name)):
                    items.append(entry(p, "assets/tg/" + name, "frame", frame_score(f), kids))
                    keep.add(name)
                    n_new += 1

    # Фото постов
    photos = [(p, u, i) for p in clean_posts for i, u in enumerate(p["photos"])][:MAX_PHOTOS]
    for p, url, i in photos:
        name = "%s_%d.jpg" % (p["post"], i)
        path = os.path.join(IMG_DIR, name)
        if not os.path.exists(path):
            try:
                download(url, path)
            except Exception as e:
                print("  фото %s не скачалось: %s" % (url, e))
                continue
        items.append(entry(p, "assets/tg/" + name, "photo"))
        keep.add(name)

    # Обложки видео из постов с ценой (запасной вариант для фото товаров)
    thumbs = [(p, u, i) for p in clean_posts if prices(p["text"]) for i, u in enumerate(p["thumbs"])][:MAX_THUMBS]
    for p, url, i in thumbs:
        name = "%s_v%d.jpg" % (p["post"], i)
        path = os.path.join(IMG_DIR, name)
        if not os.path.exists(path):
            try:
                download(url, path)
            except Exception as e:
                print("  обложка %s не скачалась: %s" % (url, e))
                continue
        items.append(entry(p, "assets/tg/" + name, "thumb"))
        keep.add(name)

    # Постер для роликов — лучший кадр этого поста
    for r in reels:
        post = r["post"].rsplit("/", 1)[-1]
        r["poster"] = next((e["src"] for e in items if e["kind"] == "frame" and e["post"].endswith("/" + post)), "")

    # Актуальная коллекция
    brand, cp = find_collection(clean_posts)
    collection = None
    if cp:
        rx = dict((b, r) for b, r in BRANDS)[brand]
        same_post = [e for e in items if e["post"].endswith("/" + cp["post"])]
        same_brand = [e for e in items if re.search(rx, e["text"], re.I) and e["kind"] != "thumb"]
        pool = sorted(same_post, key=lambda e: (e["kind"] == "thumb", -e["score"])) + sorted(same_brand, key=lambda e: (e["kind"] != "frame", -e["score"]))
        # Видео для фона: из самого анонса, а если оно слишком большое для ленты — последнее доступное видео того же бренда
        vp = cp if cp["videos"] else next((p for p in clean_posts if p["videos"] and re.search(rx, p["text"], re.I)), None)
        video = ""
        if vp:
            name = save_video(vp, "c_" + vp["post"])
            if name:
                video = "assets/reels/" + name
                poster = [e for e in items if e["kind"] == "frame" and e["post"].endswith("/" + vp["post"])]
                pool = sorted(poster, key=lambda e: -e["score"]) + pool
        collection = {"brand": brand, "post": "https://t.me/%s/%s" % (CHANNEL, cp["post"]), "date": cp["date"][:10],
                      "text": cp["text"][:300], "img": pool[0]["src"] if pool else "", "video": video}

    keep_reels = {os.path.basename(r["src"]) for r in reels}
    if collection and collection["video"]:
        keep_reels.add(os.path.basename(collection["video"]))
    for f in os.listdir(REEL_DIR):
        if f.endswith(".mp4") and f not in keep_reels:
            os.remove(os.path.join(REEL_DIR, f))
    for f in os.listdir(IMG_DIR):
        if f.endswith(".jpg") and f not in keep:
            os.remove(os.path.join(IMG_DIR, f))

    featured = cfg.get("featured_frames", [])  # отобранные вручную кадры — на самые заметные места
    for e in items:
        name = os.path.basename(e["src"])[:-4]
        if name in featured:
            e["pin"] = featured.index(name) + 1
    items.sort(key=lambda e: int(e["post"].rsplit("/", 1)[-1]), reverse=True)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8", newline="\n") as f:
        f.write("/* Сгенерировано scripts/sync_telegram.py из t.me/%s — не редактируйте вручную. */\n" % CHANNEL)
        f.write("window.TG_PHOTOS = " + json.dumps(items, ensure_ascii=False, indent=1) + ";\n")
        f.write("window.TG_REELS = " + json.dumps(reels, ensure_ascii=False, indent=1) + ";\n")
        f.write("window.TG_COLLECTION = " + json.dumps(collection, ensure_ascii=False, indent=1) + ";\n")
    kinds = {k: sum(1 for e in items if e["kind"] == k) for k in ("frame", "photo", "thumb")}
    print("Telegram: роликов %d (%s), кадров %d (новых %d, детей %d), фото %d, обложек %d; коллекция: %s; ffmpeg: %s" % (
        len(reels), ", ".join(r["post"].rsplit("/", 1)[-1] for r in reels), kinds["frame"], n_new,
        sum(1 for e in items if e["kids"]), kinds["photo"], kinds["thumb"],
        "%s (пост %s)" % (brand, cp["post"]) if cp else "нет", "есть" if FFMPEG else "нет"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
