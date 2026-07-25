import QtQuick
import "." as ThemeComponents

Item {
    id: root

    property url source
    // Kept for call-site compatibility. Software Qt Quick cannot apply an
    // effect-based tint, so callers must use assets with their colour baked in.
    property color color: ThemeComponents.Theme.foreground

    Image {
        anchors.fill: parent
        source: root.source
        fillMode: Image.PreserveAspectFit
        sourceSize {
            width: width
            height: height
        }
    }
}
