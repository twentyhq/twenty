import { isDefined } from '@ui/utilities/utils/isDefined';

const INACTIVE_DROPDOWN_ELEMENT_SELECTOR = '[hidden],[inert]';

export const isActiveDropdownElement = (element: HTMLElement) =>
  !isDefined(element.closest(INACTIVE_DROPDOWN_ELEMENT_SELECTOR));
