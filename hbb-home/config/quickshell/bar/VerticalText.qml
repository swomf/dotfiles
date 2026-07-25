import QtQuick

Item {
    id: root

    property alias text: label.text
    property alias color: label.color
    property alias font: label.font
    property alias elide: label.elide
    property alias horizontalAlignment: label.horizontalAlignment
    property real angle: -90

    implicitWidth: label.implicitHeight
    implicitHeight: label.implicitWidth

    Text {
        id: label
        anchors.centerIn: parent
        rotation: root.angle
        color: "#e0e0e0"
        renderType: Text.NativeRendering
    }
}
