export type DropdownSelectionGroupChangeEventDetails = {
  reason: 'item-press';
  event: MouseEvent | KeyboardEvent | PointerEvent;
  trigger: Element | undefined;
  cancel: () => void;
  isCanceled: boolean;
};
