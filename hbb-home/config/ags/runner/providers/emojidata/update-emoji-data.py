#!/usr/bin/env python3

import json
from pathlib import Path
from urllib.request import urlopen

package = "emojibase-data@17.0.0/en"
output = Path(__file__).resolve().with_name("emoji-data.generated")


def get_json(path):
    cached = output.parent / "unpkg" / package / path
    if not cached.exists():
        cached.parent.mkdir(parents=True, exist_ok=True)
        with urlopen(f"https://unpkg.com/{package}/{path}") as response:
            cached.write_bytes(response.read())
        print(f"Downloaded {cached}")
    return json.loads(cached.read_bytes())


emojis = get_json("data.json")
emoji_shortcodes = [
    get_json(f"shortcodes/{name}.json") for name in ("github", "iamcal", "joypixels")
]

with open(output, "w") as f:
    for item in emojis:
        terms = [item["label"]] + item.get("tags", [])
        for mapping in emoji_shortcodes:
            aliases = mapping.get(item["hexcode"], [])
            # emojibase uses str or list for tags
            terms += [aliases] if isinstance(aliases, str) else aliases
        seen = []
        for t in terms:
            t = t.lower().replace("_", " ").replace("-", " ").strip()
            # there are a lot of mysterious bullshit numbers to remove
            # clocks are ok since clock120 exists btw
            # button numbers are still searchable
            # red 100, button 1234 is ok
            if t.isdigit() and t not in ("100", "1234"):
                continue
            if t and t not in seen:
                seen.append(t)
        print(item["emoji"], " ".join(seen), file=f)
