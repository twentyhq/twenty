import { useContext } from 'react';

import { doNotTranslate } from '@ui/utilities/internal/doNotTranslate';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { PhoneCountryPickerContext } from './PhoneCountryPickerContext';

export const usePhoneCountryPickerContextOrThrow = () => {
  const context = useContext(PhoneCountryPickerContext);

  if (!isDefined(context)) {
    throw new Error(
      doNotTranslate(
        'PhoneCountryPicker parts require PhoneCountryPicker.Root.',
      ),
    );
  }

  return context;
};
