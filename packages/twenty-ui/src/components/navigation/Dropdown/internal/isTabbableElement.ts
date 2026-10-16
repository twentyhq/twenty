import { isFunction } from '@sniptt/guards';

import { doNotTranslate } from '@ui/utilities/internal/doNotTranslate';

export const isTabbableElement = (element: HTMLElement) =>
  element.tabIndex >= 0 &&
  !element.matches(':disabled') &&
  element.closest(doNotTranslate('[hidden], [inert], [aria-hidden="true"]')) ===
    null &&
  (!isFunction(element.checkVisibility) ||
    element.checkVisibility({ visibilityProperty: true }));
