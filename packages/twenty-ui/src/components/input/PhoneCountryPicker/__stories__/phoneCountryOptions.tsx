import { type PhoneCountryOption } from '../types/PhoneCountryOption';

export const PHONE_COUNTRY_OPTIONS: readonly PhoneCountryOption[] = [
  { value: 'CA', label: 'Canada', callingCode: '1', flag: '🇨🇦' },
  { value: 'FR', label: 'France', callingCode: '33', flag: '🇫🇷' },
  { value: 'DE', label: 'Germany', callingCode: '49', flag: '🇩🇪' },
  { value: 'GB', label: 'United Kingdom', callingCode: '44', flag: '🇬🇧' },
  { value: 'US', label: 'United States', callingCode: '1', flag: '🇺🇸' },
];
