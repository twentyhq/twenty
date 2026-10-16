import { useContext } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { CurrencyPickerContext } from './CurrencyPickerContext';

export const useCurrencyPickerContext = () => {
  const context = useContext(CurrencyPickerContext);

  if (!isDefined(context)) {
    throw new Error('CurrencyPicker parts must be inside CurrencyPicker.Root');
  }

  return context;
};
