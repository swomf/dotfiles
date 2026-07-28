# my anyrun clone

```sh
ags request runner
```

- plain text = app launch
- `=2 cups to ml` = unit calc+convert (needs rink)
- `;greek small alpha` = unicode search
- `:fr hello world` = auto-detect and translate to French
- `:en>ja hello world` = translate from English to Japanese
- `:def word` = dictionaryapi.dev lookup
- no prefix exists for emoji instead we use `ags request runner emoji` = emoji search
  - initialize with `./providers/emojidata/update-emoji-data.py` and `./providers/emojidata/update-twemoji.sh`
  - consider editing `providers/emojidata/emoji-overrides`

    ```text
    😂 + lmao sobbing
    😂 - tear
    🫠 = melt embarrassed sarcasm
    ```

- we can also use `ags request runner {symbols|unicode}` = unicode search

also! fuzzel replacement (newline seps). dont get rekt by argmax though (i didnt want to do a socket)

```sh
printf '%s\n' alpha beta gamma | ~/.config/ags/runner/choose
```
