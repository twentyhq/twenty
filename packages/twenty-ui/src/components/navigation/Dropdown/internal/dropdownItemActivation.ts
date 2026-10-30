import { type DropdownSelectionGroupChangeEventDetails } from '../types/DropdownSelectionGroupChangeEventDetails';

const activationEvents = new WeakMap<HTMLElement, KeyboardEvent>();

export const dropdownItemActivation = {
  activate: ({ item, event }: { item: HTMLElement; event: KeyboardEvent }) => {
    activationEvents.set(item, event);

    try {
      item.click();
    } finally {
      activationEvents.delete(item);
    }
  },
  getEvent: ({
    item,
    event,
  }: {
    item: HTMLElement;
    event: DropdownSelectionGroupChangeEventDetails['event'];
  }) => activationEvents.get(item) ?? event,
};
