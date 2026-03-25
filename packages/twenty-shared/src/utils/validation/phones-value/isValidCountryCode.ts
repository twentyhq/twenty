import { type CountryCode, getCountries } from 'libphonenumber-js';

const ALL_COUNTRIES_CODE_SET = new Set<string>(getCountries());

export const isValidCountryCode = (input: string): input is CountryCode => {
  return ALL_COUNTRIES_CODE_SET.has(input);
};
