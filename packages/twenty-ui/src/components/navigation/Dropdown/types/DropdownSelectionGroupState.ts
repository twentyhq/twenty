export type DropdownSelectionGroupState =
  | { multiple: false; value: string | null }
  | { multiple: true; value: string[] };
