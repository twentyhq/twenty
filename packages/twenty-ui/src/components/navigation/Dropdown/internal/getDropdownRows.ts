import { isDropdownRow } from './isDropdownRow';

export const getDropdownRows = (content: HTMLElement) =>
  Array.from(
    content.querySelectorAll<HTMLElement>('[data-dropdown-item]'),
  ).filter((item) => isDropdownRow({ content, item }));
