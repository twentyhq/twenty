import { isDefined } from '@ui/utilities/utils/isDefined';

import { type DropdownDismissEvent } from '../types/DropdownDismissEvent';
import { getDropdownDismissTarget } from './getDropdownDismissTarget';

export const isDropdownDismissPrevented = ({
  onDismiss,
  event,
  target = getDropdownDismissTarget(event),
}: {
  onDismiss: ((dismissEvent: DropdownDismissEvent) => void) | undefined;
  event: Event;
  target?: Element | null;
}) => {
  if (!isDefined(onDismiss)) {
    return false;
  }

  let isPrevented = false;

  onDismiss({
    target,
    type: event.type,
    preventDefault: () => {
      isPrevented = true;
    },
  });

  return isPrevented;
};
