export const getDropdownTrigger = (content: HTMLElement) =>
  Array.from(
    content.ownerDocument.querySelectorAll<HTMLElement>(
      '[data-dropdown-item][aria-controls]',
    ),
  ).find((trigger) => trigger.getAttribute('aria-controls') === content.id);
