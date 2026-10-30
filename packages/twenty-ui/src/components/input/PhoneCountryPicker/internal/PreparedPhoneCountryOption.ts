import { type PhoneCountryOption } from '../types/PhoneCountryOption';

export type PreparedPhoneCountryOption = PhoneCountryOption & {
  searchLabel: string;
  searchValue: string;
};
