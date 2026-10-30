export const getDropdownItemLabel = (item: HTMLElement) =>
  item.getAttribute('aria-label') ?? item.textContent ?? '';
