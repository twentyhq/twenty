import { type DropdownSelectionGroupChangeEventDetails } from '../types/DropdownSelectionGroupChangeEventDetails';
import { type DropdownSelectionGroupState } from '../types/DropdownSelectionGroupState';

export type DropdownSelectionContextValue = DropdownSelectionGroupState & {
  closeOnSelect: boolean;
  select: (selection: {
    value: string;
    eventDetails: DropdownSelectionGroupChangeEventDetails;
  }) => void;
};
