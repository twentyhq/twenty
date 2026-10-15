export type DropdownDismissEvent = {
  target: Element | null;
  type: string;
  preventDefault: () => void;
};
