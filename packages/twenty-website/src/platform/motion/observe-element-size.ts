// ResizeObserver with a window-resize fallback, ported from the old
// site's dom helper. Returns the stop function.
export function observeElementSize(
  element: Element,
  onResize: () => void,
): () => void {
  if (typeof ResizeObserver === 'function') {
    const resizeObserver = new ResizeObserver(() => onResize());

    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }

  if (typeof window === 'undefined') {
    return () => {};
  }

  window.addEventListener('resize', onResize);

  return () => window.removeEventListener('resize', onResize);
}
