import { useRender } from '@base-ui/react/use-render';
import { isUndefined } from '@sniptt/guards';
import { clsx } from 'clsx';
import { useId } from 'react';

import { type DropdownSelectionGroupProps } from '../types/DropdownSelectionGroupProps';
import { type DropdownSelectionGroupChangeEventDetails } from '../types/DropdownSelectionGroupChangeEventDetails';
import styles from '../Dropdown.module.scss';
import { DropdownSelectionContext } from './DropdownSelectionContext';
import { DropdownSelectionGroupEffect } from './DropdownSelectionGroupEffect';
import { useDropdownContext } from './useDropdownContext';
import { getDropdownSelectionGroupState } from './getDropdownSelectionGroupState';

export const DropdownSelectionGroup = (props: DropdownSelectionGroupProps) => {
  const {
    id,
    multiple = false,
    value: controlledValue,
    defaultValue: _defaultValue,
    onValueChange: _onValueChange,
    closeOnSelect = !multiple,
    render,
    ref,
    className,
    children,
    ...elementProps
  } = props;
  const { type, selections, initializeSelection, updateSelection } =
    useDropdownContext();
  const generatedId = useId();
  const selectionGroupId = id ?? generatedId;
  const state = getDropdownSelectionGroupState({
    props,
    storedState: selections.get(selectionGroupId),
  });

  const select = ({
    value,
    eventDetails,
  }: {
    value: string;
    eventDetails: DropdownSelectionGroupChangeEventDetails;
  }) => {
    if (!state.multiple && state.value === value) {
      return;
    }

    if (state.multiple && props.multiple) {
      const nextValue = state.value.includes(value)
        ? state.value.filter((selectedValue) => selectedValue !== value)
        : [...state.value, value];

      props.onValueChange?.(nextValue, eventDetails);

      if (!eventDetails.isCanceled && isUndefined(controlledValue)) {
        updateSelection({
          id: selectionGroupId,
          state: { multiple: true, value: nextValue },
        });
      }

      return;
    }

    if (!props.multiple) {
      props.onValueChange?.(value, eventDetails);

      if (!eventDetails.isCanceled && isUndefined(controlledValue)) {
        updateSelection({
          id: selectionGroupId,
          state: { multiple: false, value },
        });
      }
    }
  };

  const element = useRender({
    render,
    ref,
    state,
    props: {
      ...elementProps,
      id: selectionGroupId,
      className: clsx(styles.selectionGroup, className),
      role: type === 'picker' ? 'listbox' : 'group',
      'aria-multiselectable': type === 'picker' ? multiple : undefined,
      children,
    },
  });

  return (
    <DropdownSelectionContext.Provider
      value={{ ...state, closeOnSelect, select }}
    >
      {isUndefined(controlledValue) && (
        <DropdownSelectionGroupEffect
          id={selectionGroupId}
          initialState={state}
          initializeSelection={initializeSelection}
        />
      )}
      {element}
    </DropdownSelectionContext.Provider>
  );
};
