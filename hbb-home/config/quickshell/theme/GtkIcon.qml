import Quickshell
import QtQuick

Item {
    id: root

    property string iconName: "image-missing"
    property color color: "#e0e0e0"
    property int rasterSize: Math.max(48, Math.ceil(Math.max(width, height) * 2))

    property string cacheFile: Quickshell.cachePath(
        "gtk-icons/"
        + encodeURIComponent(iconName) + "-"
        + rasterSize + "-"
        + color.toString().replace("#", "")
        + ".png"
    )

    property url renderedSource: ""
    readonly property string fallbackSource:
        Quickshell.iconPath(iconName, "image-missing")

    property int activeRequestId: 0

    function render() {
        if (width <= 0 || height <= 0)
            return

        const requestedIconName = iconName
        const requestedCacheFile = cacheFile
        let requestId = 0
        // One shared C worker keeps GTK initialized between icon changes.
        requestId = GtkIconRenderer.render(
            requestedIconName,
            rasterSize,
            color.toString(),
            requestedCacheFile,
            (success, error) => {
                if (requestId !== root.activeRequestId)
                    return

                if (success) {
                    root.renderedSource =
                        "file://" + requestedCacheFile + "?v=" + Date.now()
                } else {
                    console.warn(
                        "GTK icon render failed for " + requestedIconName
                        + ": " + error
                    )
                }
            }
        )
        activeRequestId = requestId
    }

    onIconNameChanged: render()
    onColorChanged: render()
    onRasterSizeChanged: render()
    Component.onCompleted: render()

    Image {
        anchors.fill: parent
        source: root.renderedSource || root.fallbackSource
        fillMode: Image.PreserveAspectFit
        sourceSize.width: root.rasterSize
        sourceSize.height: root.rasterSize
    }
  }
