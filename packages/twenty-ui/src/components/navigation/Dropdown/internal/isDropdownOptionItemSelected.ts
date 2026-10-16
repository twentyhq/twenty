import { isDefined } from '@ui/utilities/utils/isDefined';

import { type DropdownSelectionContextValue } from './DropdownSelectionContextValue';

export const isDropdownOptionItemSelected = ({
  selection,
  value,
  standaloneSelected,
}: {
  selection: DropdownSelectionContextValue | undefined;
  value: string | undefined;
  standaloneSelected: boolean | undefined;
}) => {
  if (!isDefined(selection) || !isDefined(value)) {
    return standaloneSelected;
  }

  if (selection.multiple) {
    return selection.value.includes(value);
  }

  return selection.value === value;
};
