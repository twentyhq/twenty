import { isNonEmptyString } from '@sniptt/guards';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { type DropdownType } from '../types/DropdownType';
import { type DropdownFocusTarget } from './DropdownFocusTarget';
import { getDropdownItemLabel } from './getDropdownItemLabel';
import { getDropdownItems } from './getDropdownItems';

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

  if (isDefined(previousTrigger) && content.contains(previousTrigger)) {
    return previousTrigger;
  }

  const items = getDropdownItems(content);
  const pageTriggers = isDefined(target)
    ? items.filter((item) => item.dataset.dropdownPage === target.page)
    : [];

  if (pageTriggers.length === 1) {
    return pageTriggers[0];
  }

  const matchingPageTriggers = isNonEmptyString(target?.label)
    ? pageTriggers.filter(
        (item) => getDropdownItemLabel(item) === target?.label,
      )
    : [];

  if (matchingPageTriggers.length === 1) {
    return matchingPageTriggers[0];
  }

  const pageTrigger = isDefined(target) ? items[target.index] : undefined;

  if (isDefined(pageTrigger)) {
    return pageTrigger;
  }

  const firstFormControl = content.querySelector<HTMLElement>(
    'input:not(:disabled):not([type="hidden"]),button:not(:disabled),textarea:not(:disabled),select:not(:disabled),a[href],[tabindex="0"]',
  );

  const activePage = Array.from(
    content.querySelectorAll<HTMLElement>('[data-dropdown-page-type]'),
  ).find((page) => page.closest('[data-dropdown-content]') === content);
  const resolvedType =
    activePage?.dataset.dropdownPageType ?? type ?? content.dataset.type;

  if (resolvedType === 'panel') {
    return firstFormControl ?? content;
  }

  const search = content.querySelector<HTMLInputElement>(
    '[data-dropdown-search]:not(:disabled)',
  );

  if (isDefined(search)) {
    return search;
  }

  return (
    (edge === 'last' ? items[items.length - 1] : items[0]) ??
    firstFormControl ??
    content
  );
};
