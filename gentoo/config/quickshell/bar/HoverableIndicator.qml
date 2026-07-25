import QtQuick
import "../theme" as AppTheme

Item {
    id: root

    property int contentHeight: AppTheme.Theme.statusIndicatorHeight
    property int extraHeight: 0
    property bool active: false
    property bool externallyHovered: false
    property bool handleMouse: true
    property int acceptedButtons: Qt.LeftButton
    property color foreground: AppTheme.Theme.foreground
    property int decorationEasing: Easing.OutCubic
    property var decorationBezier: []
    readonly property bool hovered: mouse.containsMouse || externallyHovered
    property real decorationHeight: (active || hovered)
        ? AppTheme.Theme.indicatorDecorationHeight : 0

    signal clicked(var mouse)

    height: contentHeight + decorationHeight + extraHeight

    Rectangle {
        anchors {
            left: parent.left
            right: parent.right
            bottom: parent.bottom
        }
        height: root.contentHeight + root.decorationHeight
        color: root.hovered ? AppTheme.Theme.indicatorHoverColor : "transparent"
        radius: AppTheme.Theme.indicatorRadius

        Behavior on color {
            ColorAnimation { duration: AppTheme.Theme.indicatorAnimationDuration }
        }
    }

    Eyelid {
        anchors {
            left: parent.left
            right: parent.right
            bottom: parent.bottom
        }
        borderWidth: root.decorationHeight
        radius: AppTheme.Theme.indicatorRadius
        color: root.foreground
        visible: root.decorationHeight > 0
    }

    Behavior on decorationHeight {
        NumberAnimation {
            duration: AppTheme.Theme.indicatorAnimationDuration
            easing.type: root.decorationEasing
            easing.bezierCurve: root.decorationBezier
        }
    }

    MouseArea {
        id: mouse
        anchors.fill: parent
        enabled: root.handleMouse
        hoverEnabled: root.handleMouse
        acceptedButtons: root.acceptedButtons
        onClicked: mouse => root.clicked(mouse)
    }
}
