const FOCUS_GUARD_ATTRIBUTE = 'data-base-ui-focus-guard';

export const getTrailingFocusGuard = (element: Element | null) => {
  const nextElement = element?.nextElementSibling;

  if (
    !(nextElement instanceof HTMLElement) ||
    !nextElement.hasAttribute(FOCUS_GUARD_ATTRIBUTE)
  ) {
    return undefined;
  }

  return nextElement;
};
