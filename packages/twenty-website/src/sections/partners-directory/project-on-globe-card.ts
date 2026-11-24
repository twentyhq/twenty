import {
  GLOBE_FOV_DEGREES,
  GLOBE_RADIUS,
  globeFacingCameraDistance,
} from './globe-view';

const DEGREES = Math.PI / 180;

// Where a place falls, in percent of the frame, on a card cover: a still of
// the profile's globe turned to `center` ([longitude, latitude]), closed in
// to `zoom` and framed at `aspect` (width / height). The same turn as the
// globe (spin about the pole, then the tilt), the same camera. Null when the
// place is round the back.
export const projectOnGlobeCard = (
  place: readonly [number, number],
  center: readonly [number, number],
  zoom: number,
  aspect: number,
): { left: number; top: number } | null => {
  const [longitude, latitude] = place;
  const phi = latitude * DEGREES;
  const lambda = longitude * DEGREES;
  const x = GLOBE_RADIUS * Math.cos(phi) * Math.sin(lambda);
  const y = GLOBE_RADIUS * Math.sin(phi);
  const z = GLOBE_RADIUS * Math.cos(phi) * Math.cos(lambda);

  const spin = -center[0] * DEGREES;
  const spunX = x * Math.cos(spin) + z * Math.sin(spin);
  const spunZ = -x * Math.sin(spin) + z * Math.cos(spin);

  const tilt = center[1] * DEGREES;
  const tiltedY = y * Math.cos(tilt) - spunZ * Math.sin(tilt);
  const tiltedZ = y * Math.sin(tilt) + spunZ * Math.cos(tilt);

  const distance = globeFacingCameraDistance(zoom);
  if (tiltedZ <= (GLOBE_RADIUS * GLOBE_RADIUS) / distance) {
    return null;
  }

  const halfHeight = Math.tan((GLOBE_FOV_DEGREES / 2) * DEGREES);
  const depth = distance - tiltedZ;
  const ndcX = spunX / depth / (halfHeight * aspect);
  const ndcY = tiltedY / depth / halfHeight;

  return { left: 50 + ndcX * 50, top: 50 - ndcY * 50 };
};
