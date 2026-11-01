import { useContext } from 'react';

import { doNotTranslate } from '@ui/utilities/internal/doNotTranslate';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { CountrySelectContext } from './CountrySelectContext';

export const useCountrySelectContextOrThrow = () => {
  const context = useContext(CountrySelectContext);

  if (!isDefined(context)) {
    throw new Error(
      doNotTranslate('CountrySelect parts must be inside CountrySelect.Root'),
    );
  }

  return context;
};
