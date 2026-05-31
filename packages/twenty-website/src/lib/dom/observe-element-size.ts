export const observeElementsSize = (
  elements: ReadonlyArray<Element>,
  onResize: () => void,
): (() => void) => {
  if (elements.length === 0) {
    return () => {};
  }

  if (typeof ResizeObserver === 'function') {
    const resizeObserver = new ResizeObserver(() => onResize());

    elements.forEach((element) => resizeObserver.observe(element));

    return () => resizeObserver.disconnect();
  }

  if (typeof window === 'undefined') {
    return () => {};
  }

  window.addEventListener('resize', onResize);

  return () => window.removeEventListener('resize', onResize);
};

export const observeElementSize = (
  element: Element,
  onResize: () => void,
): (() => void) => observeElementsSize([element], onResize);
