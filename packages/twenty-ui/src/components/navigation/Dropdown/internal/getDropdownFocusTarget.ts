import { isNonEmptyString } from '@sniptt/guards';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { type DropdownType } from '../types/DropdownType';
import { type DropdownFocusTarget } from './DropdownFocusTarget';
import { type DropdownRowRegistry } from './DropdownRowRegistry';
import { getDropdownItemLabel } from './getDropdownItemLabel';
import { getDropdownPageType } from './getDropdownPageType';
import { getDropdownRows } from './getDropdownRows';
import { getDropdownSearch } from './getDropdownSearch';
import { getEnabledDropdownRows } from './getEnabledDropdownRows';

export const getDropdownFocusTarget = ({
  content,
  rowRegistry,
  pageId,
  type,
  target,
  edge = 'first',
}: {
  content: HTMLElement;
  rowRegistry: DropdownRowRegistry;
  pageId?: string;
  type: DropdownType;
  target?: DropdownFocusTarget;
  edge?: 'first' | 'last';
}) => {
  const previousTrigger = isDefined(target?.id)
    ? getDropdownRows(rowRegistry).find((row) => row.id === target.id)
    : undefined;

  if (isDefined(previousTrigger)) {
    return previousTrigger.element;
  }

  const enabledRows = getEnabledDropdownRows(rowRegistry);
  const pageTriggers = isDefined(target)
    ? enabledRows.filter((row) => row.page === target.page)
    : [];

  const [firstPageTrigger] = pageTriggers;

  if (pageTriggers.length === 1 && isDefined(firstPageTrigger)) {
    return firstPageTrigger.element;
  }

  const matchingPageTriggers = isNonEmptyString(target?.label)
    ? pageTriggers.filter(
        (row) => getDropdownItemLabel(row.element) === target?.label,
      )
    : [];

  const [firstMatchingPageTrigger] = matchingPageTriggers;

  if (
    matchingPageTriggers.length === 1 &&
    isDefined(firstMatchingPageTrigger)
  ) {
    return firstMatchingPageTrigger.element;
  }

  const pageTrigger = isDefined(target) ? enabledRows[target.index] : undefined;

  if (isDefined(pageTrigger)) {
    return pageTrigger.element;
  }

  const firstFormControl = content.querySelector<HTMLElement>(
    'input:not(:disabled):not([type="hidden"]),button:not(:disabled),textarea:not(:disabled),select:not(:disabled),a[href],[tabindex="0"]',
  );

  const resolvedType = getDropdownPageType({ rowRegistry, pageId }) ?? type;

  if (resolvedType === 'panel') {
    return firstFormControl ?? content;
  }

  const search = getDropdownSearch(rowRegistry);

  if (isDefined(search)) {
    return search;
  }

  if (edge === 'last') {
    return (
      enabledRows[enabledRows.length - 1]?.element ??
      firstFormControl ??
      content
    );
  }

  return (
    (enabledRows.find((row) => row.kind !== 'back') ?? enabledRows[0])
      ?.element ??
    firstFormControl ??
    content
  );
};
