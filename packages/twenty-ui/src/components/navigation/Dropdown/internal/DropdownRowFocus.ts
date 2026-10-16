export type DropdownRowFocus = {
  rowIds?: string[];
  tabStopRowId?: string;
  focusRow: (id: string) => void;
};
