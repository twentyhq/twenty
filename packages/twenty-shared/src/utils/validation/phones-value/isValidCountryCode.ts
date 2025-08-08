import { type CountryCode, getCountries } from 'libphonenumber-js';

const ALL_COUNTRIES_CODE = getCountries();

export const isValidCountryCode = (input: string): input is CountryCode => {
  return ALL_COUNTRIES_CODE.includes(input as unknown as CountryCode);
};
