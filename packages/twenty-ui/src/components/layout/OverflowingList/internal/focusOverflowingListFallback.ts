import { isDefined } from '@ui/utilities/utils/isDefined';
import { doNotTranslate } from '@ui/utilities/internal/doNotTranslate';

const FOCUSABLE_ITEM_SELECTOR = doNotTranslate(
  'button, a[href], input, select, textarea, [tabindex]',
);

export const focusOverflowingListFallback = ({
  items,
  popup,
  trigger,
  root,
  removedIndex,
  excludedItem,
}: {
  items: HTMLElement | null;
  popup: HTMLElement | null;
  trigger: HTMLElement | null;
  root: HTMLElement | null;
  removedIndex: number;
  excludedItem?: HTMLElement;
}) => {
  const itemElements = [
    ...Array.from(items?.children ?? []),
    ...Array.from(popup?.children ?? []),
  ].filter((item) => item !== excludedItem);
  const orderedItems = itemElements.sort(
    (firstItem, secondItem) =>
      Math.abs(
        Number(firstItem.getAttribute('data-item-index')) - removedIndex,
      ) -
        Math.abs(
          Number(secondItem.getAttribute('data-item-index')) - removedIndex,
        ) ||
      Number(secondItem.getAttribute('data-item-index')) -
        Number(firstItem.getAttribute('data-item-index')),
  );

  for (const item of orderedItems) {
    if (item.hasAttribute('inert')) {
      continue;
    }

    for (const candidate of Array.from(
      item.querySelectorAll<HTMLElement>(FOCUSABLE_ITEM_SELECTOR),
    )) {
      const isAvailable =
        !candidate.matches(':disabled') &&
        !isDefined(candidate.closest('[inert]'));

      if (isAvailable) {
        candidate.focus();

        if (candidate.ownerDocument.activeElement === candidate) {
          return;
        }
      }
    }
  }

  trigger?.focus();

  if (isDefined(trigger) && trigger.ownerDocument.activeElement === trigger) {
    return;
  }

  root?.focus();
};
