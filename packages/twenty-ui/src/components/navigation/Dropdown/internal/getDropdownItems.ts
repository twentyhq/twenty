import { isEnabledDropdownItem } from './isEnabledDropdownItem';

export const getDropdownItems = (content: HTMLElement) =>
  Array.from(
    content.querySelectorAll<HTMLElement>('[data-dropdown-item]'),
  ).filter((item) => isEnabledDropdownItem({ content, item }));
