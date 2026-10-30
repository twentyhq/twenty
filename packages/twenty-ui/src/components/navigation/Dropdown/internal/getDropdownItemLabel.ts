import { isDefined } from '@ui/utilities/utils/isDefined';

export const getDropdownItemLabel = (item: HTMLElement) => {
  const ariaLabel = item.getAttribute('aria-label');

  if (isDefined(ariaLabel)) {
    return ariaLabel;
  }

  const announcedItem = item.ownerDocument.importNode(item, true);

  for (const decorativeElement of Array.from(
    announcedItem.querySelectorAll('[aria-hidden="true"]'),
  )) {
    decorativeElement.remove();
  }

  return announcedItem.textContent ?? '';
};
