import { isDefined } from '@ui/utilities/utils/isDefined';

import { type DropdownKind } from '../types/DropdownKind';
import { type DropdownFocusTarget } from './DropdownFocusTarget';
import { getDropdownItems } from './getDropdownItems';

export const getDropdownFocusTarget = ({
  content,
  target,
  edge = 'first',
  kind,
}: {
  content: HTMLElement;
  target?: DropdownFocusTarget;
  edge?: 'first' | 'last';
  kind?: DropdownKind;
}) => {
  const previousTrigger = isDefined(target?.id)
    ? content.ownerDocument.getElementById(target.id)
    : null;

  if (isDefined(previousTrigger) && content.contains(previousTrigger)) {
    return previousTrigger;
  }

  const pageTrigger = isDefined(target)
    ? getDropdownItems(content)[target.index]
    : undefined;

  if (isDefined(pageTrigger)) {
    return pageTrigger;
  }

  const firstFormControl = content.querySelector<HTMLElement>(
    'input:not(:disabled):not([type="hidden"]),button:not(:disabled),textarea:not(:disabled),select:not(:disabled),a[href],[tabindex="0"]',
  );

  if (kind === 'panel') {
    return firstFormControl ?? content;
  }

  const search = content.querySelector<HTMLInputElement>(
    '[data-dropdown-search]:not(:disabled)',
  );

  if (isDefined(search)) {
    return search;
  }

  const items = getDropdownItems(content);

  return (
    (edge === 'last' ? items[items.length - 1] : items[0]) ??
    firstFormControl ??
    content
  );
};
