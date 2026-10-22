import { isNonEmptyString } from '@sniptt/guards';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { type DropdownType } from '../types/DropdownType';
import { type DropdownFocusTarget } from './DropdownFocusTarget';
import { getDropdownItemLabel } from './getDropdownItemLabel';
import { getDropdownItems } from './getDropdownItems';
import { getDropdownSearch } from './getDropdownSearch';
import { isActiveDropdownElement } from './isActiveDropdownElement';
import { isEnabledDropdownItem } from './isEnabledDropdownItem';

export const getDropdownFocusTarget = ({
  content,
  target,
  edge = 'first',
  type,
}: {
  content: HTMLElement;
  target?: DropdownFocusTarget;
  edge?: 'first' | 'last';
  type?: DropdownType;
}) => {
  const previousTrigger = isDefined(target?.id)
    ? content.ownerDocument.getElementById(target.id)
    : null;

  if (
    isDefined(previousTrigger) &&
    isEnabledDropdownItem({ content, item: previousTrigger })
  ) {
    return previousTrigger;
  }

  const items = getDropdownItems(content);
  const pageTriggers = isDefined(target)
    ? items.filter((item) => item.dataset.dropdownPage === target.page)
    : [];

  const [firstPageTrigger] = pageTriggers;

  if (pageTriggers.length === 1 && isDefined(firstPageTrigger)) {
    return firstPageTrigger;
  }

  const matchingPageTriggers = isNonEmptyString(target?.label)
    ? pageTriggers.filter(
        (item) => getDropdownItemLabel(item) === target?.label,
      )
    : [];

  const [firstMatchingPageTrigger] = matchingPageTriggers;

  if (
    matchingPageTriggers.length === 1 &&
    isDefined(firstMatchingPageTrigger)
  ) {
    return firstMatchingPageTrigger;
  }

  const pageTrigger = isDefined(target) ? items[target.index] : undefined;

  if (isDefined(pageTrigger)) {
    return pageTrigger;
  }

  const firstFormControl = Array.from(
    content.querySelectorAll<HTMLElement>(
      'input:not(:disabled):not([type="hidden"]),button:not(:disabled),textarea:not(:disabled),select:not(:disabled),a[href],[tabindex="0"]',
    ),
  ).find(isActiveDropdownElement);

  const activePage = Array.from(
    content.querySelectorAll<HTMLElement>('[data-dropdown-page-type]'),
  ).find(
    (page) =>
      page.closest('[data-dropdown-content]') === content &&
      isActiveDropdownElement(page),
  );
  const resolvedType =
    activePage?.dataset.dropdownPageType ?? type ?? content.dataset.type;

  if (resolvedType === 'panel') {
    return firstFormControl ?? content;
  }

  const search = getDropdownSearch(content);

  if (isDefined(search)) {
    return search;
  }

  if (edge === 'last') {
    return items[items.length - 1] ?? firstFormControl ?? content;
  }

  const selectedOption =
    resolvedType === 'picker'
      ? items.find(
          (item) =>
            item.hasAttribute('data-dropdown-option-item') &&
            (item.getAttribute('aria-selected') === 'true' ||
              item.getAttribute('aria-pressed') === 'true' ||
              item.getAttribute('aria-checked') === 'true' ||
              item.getAttribute('aria-current') === 'true'),
        )
      : undefined;

  return (
    selectedOption ??
    items.find((item) => !item.hasAttribute('data-dropdown-back')) ??
    items[0] ??
    firstFormControl ??
    content
  );
};
