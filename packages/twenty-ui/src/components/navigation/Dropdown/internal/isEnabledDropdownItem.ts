export const isEnabledDropdownItem = ({
  content,
  item,
}: {
  content: HTMLElement;
  item: HTMLElement;
}) =>
  item.getAttribute('aria-disabled') !== 'true' &&
  !item.hasAttribute('disabled') &&
  item.closest('[data-dropdown-content]') === content;
