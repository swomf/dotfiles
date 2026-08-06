# my anyrun clone

```sh
ags request runner
```

- plain text = app launch
- `=2 cups to ml` = unit calc+convert (needs rink)
- `;greek small alpha` = unicode search
- `:fr hello world` = auto-detect and translate to French
- `:en>ja hello world` = translate from English to Japanese
- `:def word` = English definition (copies selected definition; needs network access)
- null prefix instead we use `ags request runner emoji` = emoji search
  - see `providers/emojidata/update-emoji-data` and the sync script for the twemoji svgs
  - consider editing `providers/emoji-data/emoji-overrides` semantically

    ```text
    😂 + lmao sobbing
    😂 - tear
    🫠 = melt embarrassed sarcasm
    ```

- null prefix we can also use `ags request runner {symbols|unicode}` = unicode search
- null prefix we can also use `ags request runner rink` = unit calc+convert

also! fuzzel replacement (newline seps). dont get rekt by argmax though (i didnt want to do a socket)

```sh
printf '%s\n' alpha beta gamma | ~/.config/ags/runner/choose
```
