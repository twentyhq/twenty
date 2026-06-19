// Progress of a tall scroll container through the viewport: 0 when its top
// reaches the viewport top, 1 when its bottom reaches the viewport bottom.
// Returns null when the container cannot scroll (not taller than viewport).
export function computeScrollProgress(
  rectTop: number,
  rectHeight: number,
  viewportHeight: number,
): number | null {
  const scrollableDistance = rectHeight - viewportHeight;
  if (scrollableDistance <= 0) return null;

  const raw = -rectTop / scrollableDistance;
  if (raw <= 0) return 0;
  if (raw >= 1) return 1;
  return raw;
}
