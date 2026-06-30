export type ObserveElementVisibilityOptions = {
  rootMargin?: string;
  threshold?: number;
};

// IntersectionObserver as a boolean stream with an unobserve cleanup.
// Environments without the API (jsdom) report visible so content renders.
export function observeElementVisibility(
  element: Element,
  onChange: (isVisible: boolean) => void,
  { rootMargin = '0px', threshold = 0 }: ObserveElementVisibilityOptions = {},
): () => void {
  if (typeof IntersectionObserver === 'undefined') {
    onChange(true);
    return () => {};
  }

  const observer = new IntersectionObserver(
    (observerEntries) => {
      const entry = observerEntries[observerEntries.length - 1];
      if (entry !== undefined) {
        onChange(entry.isIntersecting);
      }
    },
    { rootMargin, threshold },
  );

  observer.observe(element);
  return () => observer.disconnect();
}
