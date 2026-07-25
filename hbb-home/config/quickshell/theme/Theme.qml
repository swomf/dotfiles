pragma Singleton

import QtQuick

QtObject {
    // Shared visual tokens. Feature components inherit these through their
    // root properties, while direct consumers can import this singleton.
    readonly property color foreground: "#e0e0e0"
    readonly property color accent: "#378df7"
    readonly property color background: "#000000"

    readonly property list<real> gtkEase: [
        0.25, 0.1,
        0.25, 1.0,
    ]

    readonly property int statusIconSize: 22
    readonly property int statusIndicatorHeight: 53
    readonly property int statusLabelHeight: 31
    readonly property int trayItemHeight: 25
    readonly property int workspaceHeight: 21
    readonly property int indicatorDecorationHeight: 3
    readonly property int indicatorRadius: 7
    readonly property int indicatorAnimationDuration: 200
    readonly property color indicatorHoverColor: "#4de0e0e0"
    // System tray items are full-bleed application icons, not padded symbolic
    // glyphs, so they need a smaller box than statusIconSize to avoid spilling
    // over the 22 px bar edges.
    readonly property int trayIconSize: 18
}
