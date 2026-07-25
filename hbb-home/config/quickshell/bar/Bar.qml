pragma ComponentBehavior: Bound

import Quickshell
import Quickshell.Hyprland
import Quickshell.Io
import Quickshell.Networking
import Quickshell.Services.Pipewire
import Quickshell.Services.SystemTray
import Quickshell.Services.UPower
import Quickshell.Widgets
import QtQuick
import QtQuick.Controls
import "../theme" as AppTheme

PanelWindow {
    id: bar

    property color foreground: AppTheme.Theme.foreground
    property color accent: AppTheme.Theme.accent
    property var sinkAudio: Pipewire.defaultAudioSink?.audio
    property var wifiDevice: {
        const devices = Networking.devices.values
        for (let i = 0; i < devices.length; ++i)
            if (devices[i].type === DeviceType.Wifi)
                return devices[i]
        return null
    }
    property var wifiNetwork: {
        if (!wifiDevice)
            return null
        const networks = wifiDevice.networks.values
        for (let i = 0; i < networks.length; ++i)
            if (networks[i].connected)
                return networks[i]
        return null
    }
    property string cpuTemperature: "0"
    property string memoryUsage: "0"
    property bool volumeExpanded: false
    readonly property string wifiIconName: !Networking.wifiEnabled
        ? "network-wireless-disabled-symbolic"
        : wifiNetwork ? "network-wireless-signal-excellent-symbolic"
        : "network-wireless-offline-symbolic"
    readonly property string volumeIconName: sinkAudio?.muted
        ? "audio-volume-muted-symbolic"
        : (sinkAudio?.volume ?? 0) > 1
            ? "audio-volume-overamplified-symbolic"
        : (sinkAudio?.volume ?? 0) > 0.66
            ? "audio-volume-high-symbolic"
        : (sinkAudio?.volume ?? 0) > 0.33
            ? "audio-volume-medium-symbolic"
        : "audio-volume-low-symbolic"

    anchors {
        top: true
        bottom: true
        left: true
    }
    implicitWidth: 22
    exclusiveZone: 22
    color: AppTheme.Theme.background

    Process {
        id: temperatureProcess
        command: ["cat", "/sys/class/thermal/thermal_zone0/temp"]
        stdout: StdioCollector {
            onStreamFinished: {
                const value = Number(text.trim())
                if (!isNaN(value))
                    bar.cpuTemperature = Math.round(value / 1000).toString()
            }
        }
    }

    Process {
        id: memoryProcess
        command: ["free", "-h"]
        stdout: StdioCollector {
            onStreamFinished: {
                const line = text.split("\n").find(line => line.startsWith("Mem:"))
                if (line) {
                    const fields = line.trim().split(/\s+/)
                    bar.memoryUsage = fields[2] + " / " + fields[1]
                }
            }
        }
    }

    // This is required before reading or writing PwNodeAudio volume/mute.
    PwObjectTracker {
        objects: [Pipewire.defaultAudioSink]
    }

    Timer {
        interval: 1000
        running: true
        repeat: true
        triggeredOnStart: true
        onTriggered: {
            if (!memoryProcess.running)
                memoryProcess.running = true
            if (!temperatureProcess.running)
                temperatureProcess.running = true
        }
    }

    SystemClock {
        id: clock
        precision: SystemClock.Seconds
    }

    Column {
        id: workspaces
        anchors {
            top: parent.top
            left: parent.left
            right: parent.right
        }

        Repeater {
            model: {
                const values = Hyprland.workspaces.values
                    .filter(ws => ws.id > 0)
                    .sort((a, b) => a.id - b.id)
                return values
            }

            HoverableIndicator {
                id: workspace
                required property var modelData
                width: workspaces.width
                contentHeight: AppTheme.Theme.workspaceHeight
                active: modelData.active
                foreground: bar.foreground
                decorationEasing: Easing.BezierSpline
                decorationBezier: AppTheme.Theme.gtkEase
                onClicked: Hyprland.dispatch("workspace " + modelData.id)

                Item {
                    anchors {
                        left: parent.left
                        right: parent.right
                        top: parent.top
                    }
                    height: parent.contentHeight

                    Text {
                        anchors.centerIn: parent
                    text: workspace.modelData.id
                    color: bar.foreground
                    font {
                        family: "Nimbus Sans"
                        pixelSize: 16
                        weight: Font.ExtraBold
                    }
                    }
                }

            }
        }
    }

    Column {
        id: status
        anchors {
            left: parent.left
            right: parent.right
            bottom: parent.bottom
            bottomMargin: 2
        }
        spacing: 2

        Repeater {
            model: SystemTray.items

            HoverableIndicator {
                id: trayItem
                required property var modelData
                width: status.width
                contentHeight: AppTheme.Theme.trayItemHeight
                acceptedButtons: Qt.LeftButton | Qt.RightButton | Qt.MiddleButton
                onClicked: mouse => {
                    if (mouse.button === Qt.RightButton || modelData.hasMenu)
                        modelData.display(bar, bar.width,
                            trayItem.mapToItem(null, 0, 0).y)
                    else if (mouse.button === Qt.MiddleButton)
                        modelData.secondaryActivate()
                    else
                        modelData.activate()
                }

                IconImage {
                    anchors {
                        top: parent.top
                        topMargin: (trayItem.contentHeight - height) / 2
                        horizontalCenter: parent.horizontalCenter
                    }
                    implicitSize: AppTheme.Theme.trayIconSize
                    // StatusNotifier items supply an icon name or image. Let
                    // IconImage resolve it through the active icon theme.
                    source: trayItem.modelData.icon
                }

            }
        }

        Item {
            width: status.width
            height: visible ? AppTheme.Theme.trayItemHeight : 0
            visible: bar.wifiDevice !== null

            AppTheme.GtkIcon {
                anchors.centerIn: parent
                width: AppTheme.Theme.statusIconSize
                height: AppTheme.Theme.statusIconSize
                iconName: bar.wifiIconName
            }

            ToolTip.visible: wifiMouse.containsMouse
            ToolTip.text: bar.wifiNetwork?.name ?? "Not connected"

            MouseArea {
                id: wifiMouse
                anchors.fill: parent
                hoverEnabled: true
            }
        }

        StatusIndicator {
            width: status.width
            height: AppTheme.Theme.statusIndicatorHeight
            labelHeight: 29
            label: bar.cpuTemperature + "°C"
            labelColor: Number(bar.cpuTemperature) >= 90 ? "#ff7f7f" : bar.foreground
            iconName: "cpu-symbolic"
            iconColor: labelColor
        }

        StatusIndicator {
            width: status.width
            height: 81
            labelHeight: 59
            label: bar.memoryUsage
            iconName: "device_mem"
        }

        Item {
            id: batteryWidget
            property var battery: UPower.displayDevice
            readonly property int level: Math.min(100, Math.max(0,
                Math.round((battery?.percentage ?? 0) * 10) * 10))
            // UPower reports FullyCharged (not Charging) once a plugged-in
            // battery tops out, so treat it as "on AC" too — otherwise a
            // charged laptop shows the plain battery glyph with no plug.
            readonly property bool charging: battery?.state === UPowerDeviceState.Charging
                || battery?.state === UPowerDeviceState.PendingCharge
                || battery?.state === UPowerDeviceState.FullyCharged
            readonly property string themedIconName: "battery-"
                + String(level).padStart(3, "0") + (charging ? "-charging" : "")
            width: status.width
            height: visible ? AppTheme.Theme.statusIndicatorHeight : 0
            visible: battery && battery.isPresent

            StatusIndicator {
                anchors.fill: parent
                label: Math.floor(batteryWidget.battery.percentage * 100) + " %"
                iconName: batteryWidget.themedIconName
            }
        }

        HoverableIndicator {
            id: volume
            width: status.width
            extraHeight: bar.volumeExpanded ? 58 : 0
            handleMouse: false
            externallyHovered: volumeMouse.containsMouse

            Rectangle {
                id: volumeSlider
                anchors {
                    top: parent.top
                    horizontalCenter: parent.horizontalCenter
                }
                width: 12
                height: bar.volumeExpanded ? 54 : 0
                radius: 6
                color: "#383838"
                visible: height > 0
                clip: true

                Rectangle {
                    anchors {
                        left: parent.left
                        right: parent.right
                        bottom: parent.bottom
                    }
                    height: parent.height * Math.min(1, (bar.sinkAudio?.volume ?? 0) / 1.5)
                    radius: 6
                    color: bar.accent
                }

                MouseArea {
                    anchors.fill: parent
                    onPressed: mouse => setVolume(mouse.y)
                    onPositionChanged: mouse => {
                        if (pressed)
                            setVolume(mouse.y)
                    }
                    function setVolume(y) {
                        if (bar.sinkAudio)
                            bar.sinkAudio.volume = Math.max(0, Math.min(1.5,
                                (1 - y / height) * 1.5))
                    }
                }
            }

            Rectangle {
                id: volumeButton
                anchors.bottom: parent.bottom
                width: parent.width
                height: volume.contentHeight + volume.decorationHeight
                color: "transparent"

                Item {
                    anchors {
                        top: parent.top
                        left: parent.left
                        right: parent.right
                    }
                    height: volume.contentHeight

                    StatusIndicator {
                        anchors.fill: parent
                        label: Math.floor((bar.sinkAudio?.volume ?? 0) * 100) + " %"
                        iconName: bar.volumeIconName
                    }
                }

                MouseArea {
                    id: volumeMouse
                    anchors.fill: parent
                    hoverEnabled: true
                    acceptedButtons: Qt.LeftButton | Qt.RightButton
                    onClicked: mouse => {
                        if (mouse.button === Qt.RightButton)
                            Quickshell.execDetached(["pavucontrol"])
                        else
                            bar.volumeExpanded = !bar.volumeExpanded
                    }
                }
            }
        }

        VerticalText {
            width: status.width
            // Let the rotated label occupy only its natural size instead of
            // reserving a fixed 218 px at the bottom of the bar.
            height: implicitHeight
            text: Qt.formatDateTime(clock.date, "yyyy-MM-dd HH:mm:ss ddd")
            color: bar.foreground
            font {
                family: "Nimbus Sans"
                pixelSize: 12
            }
        }
    }
}
