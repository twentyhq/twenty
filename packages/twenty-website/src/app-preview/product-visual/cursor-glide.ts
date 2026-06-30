import { type HeroCursorCoordinate } from './hero-cursors';

const GLIDE_BASE_MS = 500;
const GLIDE_MS_PER_PX = 0.55;
const GLIDE_MIN_MS = 620;
const GLIDE_MAX_MS = 1000;
const GLIDE_SKIP_PX = 6;

// Percent coordinates resolve against the overlay box.
function pixelDistance(
  from: HeroCursorCoordinate,
  to: HeroCursorCoordinate,
  overlay: { height: number; width: number },
): number {
  const dx = ((to.left - from.left) / 100) * overlay.width;
  const dy = ((to.top - from.top) / 100) * overlay.height;

  return Math.hypot(dx, dy);
}

// Longer hops glide longer, clamped to a believable hand speed.
function forDistance(distance: number): number {
  return Math.max(
    GLIDE_MIN_MS,
    Math.min(GLIDE_MAX_MS, GLIDE_BASE_MS + distance * GLIDE_MS_PER_PX),
  );
}

export const cursorGlide = {
  SKIP_PX: GLIDE_SKIP_PX,
  forDistance,
  pixelDistance,
};
