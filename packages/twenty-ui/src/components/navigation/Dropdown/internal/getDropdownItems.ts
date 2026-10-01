export const getDropdownItems = (content: HTMLElement) =>
  Array.from(
    content.querySelectorAll<HTMLElement>('[data-dropdown-item]'),
  ).filter(
    (item) =>
      item.getAttribute('aria-disabled') !== 'true' &&
      !item.hasAttribute('disabled') &&
      item.closest('[data-dropdown-content]') === content,
  );
