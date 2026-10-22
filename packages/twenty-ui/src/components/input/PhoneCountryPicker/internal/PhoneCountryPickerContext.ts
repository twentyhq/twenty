import { createContext } from 'react';

import { type PhoneCountryPickerRootProps } from '../types/PhoneCountryPickerRootProps';
import { type PreparedPhoneCountryOption } from './PreparedPhoneCountryOption';

export const PhoneCountryPickerContext = createContext<{
  countries: readonly PreparedPhoneCountryOption[];
  value: string | null;
  onValueChange: NonNullable<PhoneCountryPickerRootProps['onValueChange']>;
  disabled: boolean;
  closeOnSelect: boolean;
} | null>(null);
