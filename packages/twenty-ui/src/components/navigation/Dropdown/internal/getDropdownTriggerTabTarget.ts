import { isDefined } from '@ui/utilities/utils/isDefined';

import { getDropdownTabNavigation } from './getDropdownTabNavigation';

export const getDropdownTriggerTabTarget = (trigger: HTMLElement) => {
  const contentId = trigger.getAttribute('aria-controls');
  const content = isDefined(contentId)
    ? trigger.ownerDocument.getElementById(contentId)
    : null;

  if (!isDefined(content)) {
    return undefined;
  }

  return getDropdownTabNavigation({ content, shiftKey: false })?.target;
};
