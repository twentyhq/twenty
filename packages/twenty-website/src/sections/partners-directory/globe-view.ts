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

// The globe's measures, shared by the WebGL globe and by the directory cards,
// whose covers are stills of it: the point on a card is projected with them.
export const GLOBE_RADIUS = 2;
export const GLOBE_FOV_DEGREES = 30;
// A profile's camera closes in until the globe stands at this many times its
// frame's height: the partner's region. Each card cover has its own zoom
// (region-card-view.data.ts).
export const GLOBE_FACING_ZOOM = 2.5;

// The camera distance at which the globe stands `zoom` times its frame's
// height.
export const globeFacingCameraDistance = (zoom: number): number =>
  GLOBE_RADIUS /
  Math.sin(Math.atan(zoom * Math.tan((GLOBE_FOV_DEGREES / 2) * DEGREES)));
