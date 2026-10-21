import { isActiveDropdownElement } from './isActiveDropdownElement';

export const isEnabledDropdownItem = ({
  content,
  item,
}: {
  content: HTMLElement;
  item: HTMLElement;
}) =>
  item.getAttribute('aria-disabled') !== 'true' &&
  !item.hasAttribute('disabled') &&
  isActiveDropdownElement(item) &&
  item.closest('[data-dropdown-content]') === content;
