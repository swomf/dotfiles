# hyprland ags rice

Features:

bar.ts
* numbers on the top left
* volume icon at bottom left (just an indicator)
* mmmm-dd-yy hh:mm:ss day clock

notifications:
* freedesktop popups (markup, actions, images, categories, sounds, urgency)
* notification center on the right edge: history, per-notification actions,
  clear all, do-not-disturb toggle, Escape to close

```sh
ags request notifications          # toggle the center
ags request notifications open     # or close
ags request notifications dnd      # toggle do-not-disturb
```

the daemon runs with `ignoreTimeout`, so `expire-timeout` only hides the popup.
notifications stay in the center until dismissed, actioned, or closed by the
sending app

runner:
* apps, stdin, translate, dictionary, rink, symbols

You need Nimbus Sans.

## footguns

we're on gtk3 so doing shit like

```js
self => {                                                              
  const keyboard = Gtk.EventControllerKey.new(self)
  keyboard.set_propagation_phase(Gtk.PropagationPhase.CAPTURE)
  keyboard.connect("key-pressed", (_, keyval) => handleKeyPress(keyval))
```

will get garbage collected because gtk4 the widget owns the controllers. local const gets garbage collected.
