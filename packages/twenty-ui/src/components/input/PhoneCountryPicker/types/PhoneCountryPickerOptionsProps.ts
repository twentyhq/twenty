import { type PhoneCountryOption } from './PhoneCountryOption';

export type PhoneCountryPickerOptionsProps = {
  countries: readonly PhoneCountryOption[];
  value?: string;
  onValueChange: (value: string) => void;
  searchLabel?: string;
  emptyLabel?: string;
};
