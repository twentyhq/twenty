import { isDefined } from '@ui/utilities/utils/isDefined';

import { isActiveDropdownElement } from './isActiveDropdownElement';
import { compareDropdownElementOrder } from './compareDropdownElementOrder';

const DROPDOWN_TABBABLE_ELEMENT_SELECTOR =
  'a[href],button,input:not([type="hidden"]),select,textarea,[tabindex]';

export const getDropdownTabNavigation = ({
  content,
  target,
  shiftKey,
}: {
  content: HTMLElement;
  target?: HTMLElement;
  shiftKey: boolean;
}) => {
  const tabStops = Array.from(
    content.querySelectorAll<HTMLElement>(DROPDOWN_TABBABLE_ELEMENT_SELECTOR),
  ).filter(
    (element) =>
      Number(element.getAttribute('data-tabindex') ?? element.tabIndex) >= 0 &&
      !element.matches(':disabled,[aria-disabled="true"]') &&
      isActiveDropdownElement(element) &&
      element.closest('[data-dropdown-content]') === content,
  );
  const visualTabStops = [...tabStops].sort((firstElement, secondElement) =>
    compareDropdownElementOrder({ firstElement, secondElement }),
  );
  const hasReorderedTabStops = tabStops.some(
    (element, index) => element !== visualTabStops[index],
  );
  const targetIndex = isDefined(target) ? visualTabStops.indexOf(target) : -1;

  if (!hasReorderedTabStops || (isDefined(target) && targetIndex < 0)) {
    return undefined;
  }

  return { target: visualTabStops[targetIndex + (shiftKey ? -1 : 1)] };
};
