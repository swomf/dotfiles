import QtQuick
import "../theme" as AppTheme

Item {
    id: root

    property string label: ""
    property string iconName: "image-missing"
    property color labelColor: AppTheme.Theme.foreground
    property color iconColor: AppTheme.Theme.foreground
    property int labelHeight: AppTheme.Theme.statusLabelHeight
    property int iconSize: AppTheme.Theme.statusIconSize

    VerticalText {
        anchors {
            top: parent.top
            horizontalCenter: parent.horizontalCenter
        }
        height: root.labelHeight
        text: root.label
        color: root.labelColor
        font {
            family: "Nimbus Sans"
            pixelSize: 12
        }
    }

    AppTheme.GtkIcon {
        anchors {
            bottom: parent.bottom
            horizontalCenter: parent.horizontalCenter
        }
        width: root.iconSize
        height: root.iconSize
        iconName: root.iconName
        color: root.iconColor
    }
}
