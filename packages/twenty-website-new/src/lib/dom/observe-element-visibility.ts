export type ObserveElementVisibilityOptions = IntersectionObserverInit & {
  fallbackIsVisible?: boolean;
};

export const observeElementVisibility = (
  element: Element,
  onVisibilityChange: (isVisible: boolean) => void,
  options: ObserveElementVisibilityOptions = {},
): (() => void) => {
  const { fallbackIsVisible = true, ...intersectionObserverOptions } = options;

  if (typeof IntersectionObserver === 'function') {
    const intersectionObserver = new IntersectionObserver((entries) => {
      onVisibilityChange(entries.some((entry) => entry.isIntersecting));
    }, intersectionObserverOptions);

    intersectionObserver.observe(element);

    return () => intersectionObserver.disconnect();
  }

  onVisibilityChange(fallbackIsVisible);

  return () => {};
};
