import { type DropdownSelectionGroupChangeEventDetails } from '../types/DropdownSelectionGroupChangeEventDetails';

export const createDropdownSelectionEventDetails = ({
  event,
  trigger,
}: {
  event: DropdownSelectionGroupChangeEventDetails['event'];
  trigger: Element;
}): DropdownSelectionGroupChangeEventDetails => {
  let isCanceled = false;

  return {
    reason: 'item-press',
    event,
    trigger,
    cancel: () => {
      isCanceled = true;
    },
    get isCanceled() {
      return isCanceled;
    },
  };
};
