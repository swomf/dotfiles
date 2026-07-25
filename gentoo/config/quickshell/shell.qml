//@ pragma UseQApplication
pragma ComponentBehavior: Bound

import Quickshell
import Quickshell.Services.Notifications
import QtQuick
import "bar"
import "notifications"

ShellRoot {
    id: root

    // A copied array is used so QML notices insertions and removals.
    property var popupNotifications: []

    function addNotification(notification) {
        notification.tracked = true
        popupNotifications = [notification].concat(
            popupNotifications.filter(n => n.id !== notification.id))
    }

    function hideNotification(id) {
        popupNotifications = popupNotifications.filter(n => n.id !== id)
    }

    NotificationServer {
        id: notificationServer
        keepOnReload: true
        bodySupported: true
        bodyMarkupSupported: true
        bodyImagesSupported: true
        actionsSupported: true
        actionIconsSupported: true
        imageSupported: true
        onNotification: notification => root.addNotification(notification)
    }

    Variants {
        model: Quickshell.screens

        Bar {
            required property var modelData
            screen: modelData
        }
    }

    Variants {
        model: Quickshell.screens

        NotificationPopups {
            required property var modelData
            screen: modelData
            notifications: root.popupNotifications
            onHideRequested: id => root.hideNotification(id)
        }
    }
}
