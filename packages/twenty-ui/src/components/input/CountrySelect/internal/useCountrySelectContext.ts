import { useContext } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { CountrySelectContext } from './CountrySelectContext';

export const useCountrySelectContext = () => {
  const context = useContext(CountrySelectContext);

  if (!isDefined(context)) {
    throw new Error('CountrySelect parts must be inside CountrySelect.Root');
  }

  return context;
};
