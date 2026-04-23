/**
 * Computes the 0..1 scroll progress of a tall (sticky-bearing) container as
 * the viewport moves through it.
 *
 * Inputs are the container's `getBoundingClientRect()` top + height, plus
 * the viewport height. The function is pure so it can be unit-tested
 * without a DOM.
 *
 * Returns:
 *   - `0` when the container's top is at or below the viewport top
 *     (we haven't started scrolling through it yet).
 *   - `1` when the container has scrolled past the viewport entirely
 *     (the bottom of the container has reached the viewport bottom).
 *   - A linear interpolation in between.
 *   - `null` when the container is shorter than the viewport (no scroll
 *     range exists; callers should treat this as "no progress to report"
 *     rather than coerce it to 0 or 1).
 *
 * The contract intentionally clamps to [0, 1]. Section visuals depend on
 * never receiving < 0 or > 1 — clamping in one place is safer than asking
 * every consumer to remember.
 */
export function computeScrollProgress(
  rectTop: number,
  rectHeight: number,
  viewportHeight: number,
): number | null {
  const scrollableDistance = rectHeight - viewportHeight;
  if (scrollableDistance <= 0) {
    return null;
  }

  const raw = -rectTop / scrollableDistance;
  if (raw <= 0) return 0;
  if (raw >= 1) return 1;
  return raw;
}
