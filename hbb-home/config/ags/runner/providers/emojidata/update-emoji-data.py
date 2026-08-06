#!/usr/bin/env python3

import json
from pathlib import Path
from urllib.request import urlopen

url = "https://unpkg.com/emojibase-data@17.0.0/en"
output = Path(__file__).resolve().with_name("emoji-data.generated")


def get_json(path):
    with urlopen(f"{url}/{path}") as response:
        return json.load(response)


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
            if t and t not in seen:
                seen.append(t)
        print(item["emoji"], " ".join(seen), file=f)
