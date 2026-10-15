import { useContext } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { PhoneCountryPickerContext } from './PhoneCountryPickerContext';

export const usePhoneCountryPickerContext = () => {
  const context = useContext(PhoneCountryPickerContext);

  if (!isDefined(context)) {
    throw new Error(
      'PhoneCountryPicker parts require PhoneCountryPicker.Root.',
    );
  }

  return context;
};
