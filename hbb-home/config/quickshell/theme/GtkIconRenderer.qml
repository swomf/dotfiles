pragma Singleton

import Quickshell
import Quickshell.Io
import QtQuick

QtObject {
    id: root

    property int nextRequestId: 1
    property bool workerReady: false
    property var queuedRequests: []
    property var callbacks: ({})

    function render(iconName, size, color, outputPath, callback) {
        const requestId = nextRequestId++
        callbacks[requestId] = callback

        const request = [
            requestId,
            encodeURIComponent(iconName),
            size,
            encodeURIComponent(color),
            encodeURIComponent(outputPath)
        ].join("\t") + "\n"

        if (workerReady) {
            worker.write(request)
        } else {
            queuedRequests.push(request)
            if (!worker.running)
                worker.running = true
        }

        return requestId
    }

    function flushQueue() {
        for (const request of queuedRequests)
            worker.write(request)
        queuedRequests = []
    }

    function handleResponse(response) {
        const fields = response.trim().split("\t")
        if (fields.length < 2)
            return

        const requestId = Number(fields[1])
        const callback = callbacks[requestId]
        if (!callback)
            return

        delete callbacks[requestId]
        callback(fields[0] === "ok", fields.slice(2).join("\t"))
    }

    function failPending(message) {
        const pending = callbacks
        callbacks = ({})
        queuedRequests = []
        for (const requestId in pending)
            pending[requestId](false, message)
    }

    property Process worker: Process {
        command: [
            Quickshell.shellPath("theme/render-gtk-icon"),
            "--worker"
        ]
        stdinEnabled: true

        stdout: SplitParser {
            splitMarker: "\n"
            onRead: data => root.handleResponse(data)
        }

        stderr: SplitParser {
            splitMarker: "\n"
            onRead: data => {
                if (data.trim() !== "")
                    console.warn("GTK icon renderer: " + data.trim())
            }
        }

        onStarted: {
            root.workerReady = true
            root.flushQueue()
        }

        onExited: (exitCode, exitStatus) => {
            root.workerReady = false
            root.failPending("renderer exited with code " + exitCode)
        }
    }
}
