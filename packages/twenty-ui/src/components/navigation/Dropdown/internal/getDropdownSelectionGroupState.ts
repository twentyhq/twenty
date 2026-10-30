import { isUndefined } from '@sniptt/guards';

import { type DropdownSelectionGroupProps } from '../types/DropdownSelectionGroupProps';
import { type DropdownSelectionGroupState } from '../types/DropdownSelectionGroupState';

export const getDropdownSelectionGroupState = ({
  props,
  storedState,
}: {
  props: DropdownSelectionGroupProps;
  storedState?: DropdownSelectionGroupState;
}): DropdownSelectionGroupState => {
  if (props.multiple) {
    return {
      multiple: true,
      value:
        props.value ??
        (storedState?.multiple
          ? storedState.value
          : (props.defaultValue ?? [])),
    };
  }

  if (!isUndefined(props.value)) {
    return { multiple: false, value: props.value };
  }

  return {
    multiple: false,
    value:
      storedState?.multiple === false
        ? storedState.value
        : (props.defaultValue ?? null),
  };
};
