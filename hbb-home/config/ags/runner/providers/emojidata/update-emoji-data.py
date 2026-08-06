#!/usr/bin/env python3

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any
from urllib.request import urlopen


VERSION = "17.0.0"
PACKAGE = f"emojibase-data@{VERSION}"
BASE_URL = f"https://unpkg.com/{PACKAGE}/en"
CACHE_DIR = Path(__file__).resolve().parent / "unpkg" / PACKAGE / "en"
DATA_PATH = "data.json"
SHORTCODE_PATHS = (
    "shortcodes/github.json",
    "shortcodes/iamcal.json",
    "shortcodes/joypixels.json",
)

# allow 100 emoji and 1234 emoji. clocks lose bare 30 or 3.
# keycaps are ok since they are like 'keycap: 3' prior to processing
NUMERIC_TERM_ALLOWLIST = ("100", "1234")


def fetch_json_or_use_cache(remote_path: str) -> Any:
    cached = CACHE_DIR / remote_path
    if not cached.exists():
        cached.parent.mkdir(parents=True, exist_ok=True)
        with urlopen(f"{BASE_URL}/{remote_path}") as response:
            payload = response.read()
        cached.write_bytes(payload)
        print(f"Downloaded {cached}")
    return json.loads(cached.read_bytes())


def get_strings_from_json(value: Any) -> list[str]:
    if isinstance(value, str):
        return [value]
    if isinstance(value, list):
        return [item for item in value if isinstance(item, str)]
    return []


def normalize_term(value: str) -> str:
    return value.casefold().replace("_", " ").replace("-", " ").strip()


def main() -> None:
    output = Path(__file__).resolve().parent / "emoji-data.generated"

    emojis = fetch_json_or_use_cache(DATA_PATH)
    shortcode_maps = [
        fetch_json_or_use_cache(remote_path) for remote_path in SHORTCODE_PATHS
    ]

    lines: list[tuple[int, str]] = []
    for item in emojis:
        emoji = item.get("emoji")
        hexcode = item.get("hexcode")
        if not emoji or not hexcode:
            continue

        terms = get_strings_from_json(item.get("label"))
        terms += get_strings_from_json(item.get("annotation"))
        terms += get_strings_from_json(item.get("tags"))
        for shortcode_map in shortcode_maps:
            terms += get_strings_from_json(shortcode_map.get(hexcode))

        seen: set[str] = set()
        normalized = []
        for term in terms:
            term = normalize_term(term)
            if (
                term
                and term not in seen
                # avoid weird tags like "143" present upstream
                and not (term.isdigit() and term not in NUMERIC_TERM_ALLOWLIST)
            ):
                seen.add(term)
                normalized.append(term)

        line = emoji + (" " + " ".join(normalized) if normalized else "")
        lines.append((item.get("order", 10**9), line))

    lines.sort(key=lambda pair: pair[0])
    temporary_output = output.with_suffix(output.suffix + ".tmp")
    temporary_output.write_text(
        "\n".join(line for _, line in lines) + "\n",
        encoding="utf-8",
    )
    os.replace(temporary_output, output)
    print(f"Generated {output}")


if __name__ == "__main__":
    main()
