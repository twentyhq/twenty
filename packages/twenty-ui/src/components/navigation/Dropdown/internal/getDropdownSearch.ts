import { isActiveDropdownElement } from './isActiveDropdownElement';

export const getDropdownSearch = (content: HTMLElement) =>
  Array.from(
    content.querySelectorAll<HTMLInputElement>(
      '[data-dropdown-search]:not(:disabled)',
    ),
  ).find(
    (search) =>
      search.closest('[data-dropdown-content]') === content &&
      isActiveDropdownElement(search),
  ) ?? null;
