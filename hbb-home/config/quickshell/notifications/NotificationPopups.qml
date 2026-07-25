pragma ComponentBehavior: Bound

import Quickshell
import Quickshell.Services.Notifications
import Quickshell.Widgets
import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import "../theme" as AppTheme

PanelWindow {
    id: popupWindow

    required property var notifications
    signal hideRequested(int id)

    anchors {
        top: true
        right: true
    }
    exclusiveZone: 0
    implicitWidth: 440
    implicitHeight: popupColumn.implicitHeight + 24
    color: "transparent"

    Column {
        id: popupColumn
        anchors {
            top: parent.top
            left: parent.left
            right: parent.right
            margins: 12
        }
        spacing: 12

        Repeater {
            model: popupWindow.notifications

            Rectangle {
                id: card
                required property var modelData

                width: popupColumn.width
                implicitHeight: cardLayout.implicitHeight + 2
                radius: 13
                color: "#202020"
                border {
                    width: 1
                    color: modelData.urgency === NotificationUrgency.Critical
                        ? "#ccff4040" : "#e0e0e0"
                }

                ColumnLayout {
                    id: cardLayout
                    anchors {
                        left: parent.left
                        right: parent.right
                    }
                    spacing: 0

                    RowLayout {
                        Layout.fillWidth: true
                        Layout.margins: 8
                        spacing: 7

                        IconImage {
                            Layout.preferredWidth: 18
                            Layout.preferredHeight: 18
                            visible: modelData.appIcon !== "" || modelData.desktopEntry !== ""
                            source: Quickshell.iconPath(
                                modelData.appIcon || modelData.desktopEntry,
                                "application-x-executable")
                        }

                        Text {
                            Layout.fillWidth: true
                            text: modelData.appName || "Unknown"
                            color: modelData.urgency === NotificationUrgency.Critical
                                ? "#ff7f7f" : "#80e0e0e0"
                            elide: Text.ElideRight
                            font.bold: true
                        }

                        Text {
                            text: Qt.formatTime(new Date(), "HH:mm")
                            color: "#80e0e0e0"
                        }

                        Rectangle {
                            Layout.preferredWidth: 24
                            Layout.preferredHeight: 24
                            radius: 8
                            color: closeMouse.containsMouse ? "#e0e0e0" : "transparent"

                            Text {
                                anchors.centerIn: parent
                                text: "×"
                                color: closeMouse.containsMouse ? "#202020" : "#e0e0e0"
                                font.pixelSize: 20
                            }

                            MouseArea {
                                id: closeMouse
                                anchors.fill: parent
                                hoverEnabled: true
                                onClicked: card.modelData.dismiss()
                            }
                        }
                    }

                    Rectangle {
                        Layout.fillWidth: true
                        Layout.leftMargin: 7
                        Layout.rightMargin: 7
                        implicitHeight: 1
                        color: "#1ae0e0e0"
                    }

                    RowLayout {
                        Layout.fillWidth: true
                        Layout.margins: 16
                        Layout.topMargin: 8
                        spacing: 8

                        Image {
                            Layout.preferredWidth: visible ? 100 : 0
                            Layout.preferredHeight: visible ? 100 : 0
                            visible: modelData.image !== ""
                            source: {
                                if (!visible)
                                    return ""
                                if (modelData.image.startsWith("/") ||
                                    modelData.image.startsWith("file:"))
                                    return modelData.image
                                return Quickshell.iconPath(modelData.image)
                            }
                            fillMode: Image.PreserveAspectCrop
                        }

                        ColumnLayout {
                            Layout.fillWidth: true
                            Layout.alignment: Qt.AlignTop
                            spacing: 5

                            Text {
                                Layout.fillWidth: true
                                text: modelData.summary
                    color: AppTheme.Theme.foreground
                                elide: Text.ElideRight
                                font.pixelSize: 16
                            }

                            Text {
                                Layout.fillWidth: true
                                visible: text !== ""
                                text: modelData.body
                                color: "#c0e0e0e0"
                                wrapMode: Text.Wrap
                                textFormat: Text.RichText
                                onLinkActivated: link => Qt.openUrlExternally(link)
                            }
                        }
                    }

                    RowLayout {
                        Layout.fillWidth: true
                        Layout.leftMargin: 16
                        Layout.rightMargin: 16
                        Layout.bottomMargin: 12
                        visible: modelData.actions.length > 0

                        Repeater {
                            model: card.modelData.actions

                            Button {
                                required property var modelData
                                Layout.fillWidth: true
                                text: modelData.text
                                onClicked: modelData.invoke()
                            }
                        }
                    }
                }

                Connections {
                    target: card.modelData
                    function onClosed(reason) {
                        popupWindow.hideRequested(card.modelData.id)
                    }
                }

                HoverHandler {
                    onActiveChanged: {
                        if (!active)
                            popupWindow.hideRequested(card.modelData.id)
                    }
                }
            }
        }
    }
}
