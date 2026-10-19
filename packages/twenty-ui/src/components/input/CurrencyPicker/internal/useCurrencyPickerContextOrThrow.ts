import { useContext } from 'react';

import { doNotTranslate } from '@ui/utilities/internal/doNotTranslate';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { CurrencyPickerContext } from './CurrencyPickerContext';

export const useCurrencyPickerContextOrThrow = () => {
  const context = useContext(CurrencyPickerContext);

  if (!isDefined(context)) {
    throw new Error(
      doNotTranslate('CurrencyPicker parts must be inside CurrencyPicker.Root'),
    );
  }

  return context;
};
