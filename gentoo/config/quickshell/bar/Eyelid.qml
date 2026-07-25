import QtQuick
import QtQuick.Shapes

// GTK renders a one-sided rounded border as a filled area, not as a stroke.
// The outer and inner curves meet at the ends because the side borders have
// zero width. That convergence produces the tapered "raised edge".
Item {
    id: root

    property color color: "#e0e0e0"
    property real radius: 7
    property real borderWidth: 3
    readonly property real innerY: Math.max(0, radius - borderWidth)
    readonly property real kappa: 0.5522847498

    implicitHeight: radius

    Shape {
        anchors.fill: parent

        ShapePath {
            fillColor: root.color
            strokeColor: "transparent"
            startX: 0
            startY: 0

            // Outer lower-left corner.
            PathCubic {
                control1X: 0
                control1Y: root.kappa * root.radius
                control2X: (1 - root.kappa) * root.radius
                control2Y: root.radius
                x: root.radius
                y: root.radius
            }

            // Outer bottom edge and lower-right corner.
            PathLine {
                x: root.width - root.radius
                y: root.radius
            }
            PathCubic {
                control1X: root.width - root.radius + root.kappa * root.radius
                control1Y: root.radius
                control2X: root.width
                control2Y: root.kappa * root.radius
                x: root.width
                y: 0
            }

            // Inner right corner. It converges with the outer curve because
            // there is no right-side border.
            PathCubic {
                control1X: root.width
                control1Y: root.kappa * root.innerY
                control2X: root.width - root.radius + root.kappa * root.radius
                control2Y: root.innerY
                x: root.width - root.radius
                y: root.innerY
            }

            // Inner edge and left corner, returning to the shared endpoint.
            PathLine {
                x: root.radius
                y: root.innerY
            }
            PathCubic {
                control1X: (1 - root.kappa) * root.radius
                control1Y: root.innerY
                control2X: 0
                control2Y: root.kappa * root.innerY
                x: 0
                y: 0
            }
        }
    }
}
