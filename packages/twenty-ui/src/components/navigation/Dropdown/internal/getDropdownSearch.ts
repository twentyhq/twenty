export const getDropdownSearch = (content: HTMLElement) =>
  content.querySelector<HTMLInputElement>(
    '[data-dropdown-search]:not(:disabled)',
  );
