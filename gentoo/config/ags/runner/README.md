# my anyrun clone

```sh
ags request runner
```

emoji search (also see search-emoji in hypr/wm/executable)
i dont use a query prefix for this one.
btw you need to generate in `providers/emojidata/update-emoji-data`

Twemoji SVGs are pinned and synced separately. The sync only installs assets
referenced by `emoji-data.generated` (e.g. excluding expanded skin-tone variants):

```sh
./providers/emojidata/update-twemoji.py
```

```sh
ags request runner emoji
```

consider editing `providers/emojidata/emoji-overrides`. semantic add/remove/set

```text
😂 + lmao sobbing
😂 - tear
🫠 = melt embarrassed sarcasm
```

- plain text = app launch
- `=2 cups to ml` = unit calc+convert (needs rink)
- `;greek small alpha` = unicode search
- `:fr hello world` = auto-detect and translate to French
- `:en>ja hello world` = translate from English to Japanese

fuzzel replacement (newline seps)

```sh
printf '%s\n' alpha beta gamma | ~/.config/ags/runner/choose
```
