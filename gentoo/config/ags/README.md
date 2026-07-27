# hyprland ags rice

Features:

bar.ts
* numbers on the top left
* volume icon at bottom left (just an indicator)
* mmmm-dd-yy hh:mm:ss day clock

notifications:
* standard

runner:
* apps, stdin, translate, rink, symbols

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
