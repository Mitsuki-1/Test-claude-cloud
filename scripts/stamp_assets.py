#!/usr/bin/env python3
"""
Проставляет версии к css/js в HTML-страницах: css/style.css -> css/style.css?v=<хэш файла>.

Запускается в GitHub Actions перед выкладкой (в git не коммитится). Хэш меняется только
когда меняется сам файл, поэтому браузеры и кэш хостинга сразу берут новую версию,
а неизменённые файлы по-прежнему берутся из кэша. Без этого после обновления сайта
у посетителей мог остаться старый style.css при новых скриптах — например, белый
логотип Caramell на белой карточке вместо красной.
"""
import glob
import hashlib
import os
import re
import sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
REF = re.compile(r'((?:src|href)=")((?:css|js)/[^"?#]+\.(?:css|js))(?:\?v=[^"]*)?(")')


def file_hash(rel):
    path = os.path.join(ROOT, rel)
    if not os.path.isfile(path):
        return None
    with open(path, "rb") as f:
        return hashlib.sha1(f.read()).hexdigest()[:10]


def main():
    pages = sorted(glob.glob(os.path.join(ROOT, "*.html")))
    total = 0
    for page in pages:
        with open(page, encoding="utf-8") as f:
            html = f.read()
        count = [0]

        def stamp(m):
            h = file_hash(m.group(2))
            if not h:
                return m.group(0)
            count[0] += 1
            return m.group(1) + m.group(2) + "?v=" + h + m.group(3)

        out = REF.sub(stamp, html)
        if out != html:
            with open(page, "w", encoding="utf-8") as f:
                f.write(out)
        total += count[0]
        print("%s: %d ссылок с версией" % (os.path.basename(page), count[0]))
    return 0 if total else 1


if __name__ == "__main__":
    sys.exit(main())
