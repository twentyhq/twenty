const DEGREES = Math.PI / 180;

// North tipped a little toward the viewer, Europe and the Atlantic in front.
const TILT_DEGREES = 8;
const FRONT_LONGITUDE = -5;

// The hero globe's starting view. The model keeps its pole on y (see the
// bounds anchors in partners-globe.glb), so the engine's turn and drag spin
// it like the earth.
export const GLOBE_VIEW = {
  previewDistance: 4.3,
  pose: {
    rotationX: TILT_DEGREES * DEGREES,
    rotationY: -FRONT_LONGITUDE * DEGREES,
  },
} as const;
