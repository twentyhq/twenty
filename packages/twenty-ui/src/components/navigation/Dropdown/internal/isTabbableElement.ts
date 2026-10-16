import { isFunction } from '@sniptt/guards';

export const isTabbableElement = (element: HTMLElement) =>
  element.tabIndex >= 0 &&
  !element.matches(':disabled') &&
  element.closest('[hidden], [inert], [aria-hidden="true"]') === null &&
  (!isFunction(element.checkVisibility) ||
    element.checkVisibility({ visibilityProperty: true }));
