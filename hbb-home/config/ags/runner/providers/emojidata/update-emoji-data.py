#!/usr/bin/env python3

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any
from urllib.request import urlopen


VERSION = "17.0.0"
BASE_URL = f"https://unpkg.com/emojibase-data@{VERSION}/en"
SHORTCODE_PATHS = (
    "shortcodes/github.json",
    "shortcodes/iamcal.json",
    "shortcodes/joypixels.json",
)


def download_json(url: str) -> Any:
    with urlopen(url) as response:
        return json.load(response)


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

    emojis = download_json(f"{BASE_URL}/data.json")
    shortcode_maps = [
        download_json(f"{BASE_URL}/{remote_path}")
        for remote_path in SHORTCODE_PATHS
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
            if term and term not in seen:
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
