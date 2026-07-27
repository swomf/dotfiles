# my anyrun clone

```sh
ags request runner
```

emoji search (also see search-emoji in hypr/wm/executable)
i dont use a query prefix for this one.
generate search terms and install with respectively:

```sh
./providers/emojidata/update-emoji-data.py
./providers/emojidata/update-twemoji.sh
```

```sh
ags request runner emoji
```

consider editing `providers/emojidata/emoji-overrides`. semantic add/remove/set is + - =

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
