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
