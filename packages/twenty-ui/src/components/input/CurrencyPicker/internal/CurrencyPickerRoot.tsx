import { isFunction, isUndefined } from '@sniptt/guards';
import { useId } from 'react';

import { DropdownSelectionGroupEffect } from '@ui/components/navigation/Dropdown/internal/DropdownSelectionGroupEffect';
import { getDropdownSelectionGroupState } from '@ui/components/navigation/Dropdown/internal/getDropdownSelectionGroupState';
import { useDropdownContext } from '@ui/components/navigation/Dropdown/internal/useDropdownContext';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { type CurrencyPickerRootProps } from '../types/CurrencyPickerRootProps';
import { CurrencyPickerContext } from './CurrencyPickerContext';
import { getCurrencyPickerLabel } from './getCurrencyPickerLabel';
import { getCurrencyPickerSearchText } from './getCurrencyPickerSearchText';

export const CurrencyPickerRoot = ({
  currencies,
  value: controlledValue,
  defaultValue = null,
  onValueChange,
  closeOnSelect,
  disabled = false,
  selectedFirst = false,
  getOptionLabel = getCurrencyPickerLabel,
  getSearchText = getCurrencyPickerSearchText,
  renderValue,
  children,
}: CurrencyPickerRootProps) => {
  const groupId = useId();
  const { selections, initializeSelection } = useDropdownContext();
  const selectionProps = {
    value: controlledValue,
    defaultValue,
    onValueChange,
    closeOnSelect,
  };
  const selection = getDropdownSelectionGroupState({
    props: { ...selectionProps, id: groupId },
    storedState: selections.get(groupId),
  });
  const value = selection.multiple ? null : selection.value;
  const preparedOptions = currencies.map((currency) => ({
    currency,
    label: getOptionLabel(currency),
    searchText: getSearchText(currency).toLowerCase(),
  }));
  const selectedOption = preparedOptions.find(
    ({ currency }) => currency.code === value,
  );
  const options =
    selectedFirst && isDefined(selectedOption)
      ? [
          selectedOption,
          ...preparedOptions.filter((option) => option !== selectedOption),
        ]
      : preparedOptions;
  const state = { value, selectedCurrency: selectedOption?.currency, disabled };

  return (
    <CurrencyPickerContext.Provider
      value={{ state, groupId, options, selectionProps, renderValue }}
    >
      {isUndefined(controlledValue) && (
        <DropdownSelectionGroupEffect
          id={groupId}
          initialState={selection}
          initializeSelection={initializeSelection}
        />
      )}
      {isFunction(children) ? children(state) : children}
    </CurrencyPickerContext.Provider>
  );
};
