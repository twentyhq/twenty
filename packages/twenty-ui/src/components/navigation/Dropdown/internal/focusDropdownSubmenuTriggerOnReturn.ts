import { isDefined } from '@ui/utilities/utils/isDefined';

export const focusDropdownSubmenuTriggerOnReturn = ({
  triggerId,
  focusTarget,
}: {
  triggerId: string | undefined;
  focusTarget: EventTarget | null;
}) => {
  if (!isDefined(triggerId) || !(focusTarget instanceof HTMLElement)) {
    return;
  }

  const trigger = focusTarget.ownerDocument.getElementById(triggerId);
  const parentContent = trigger?.closest('[data-dropdown-content]');

  if (isDefined(trigger) && parentContent?.contains(focusTarget) === true) {
    trigger.focus();
  }
};
