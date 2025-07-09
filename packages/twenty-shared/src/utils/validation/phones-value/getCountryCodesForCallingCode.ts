import { getCountries, getCountryCallingCode } from 'libphonenumber-js';

const ALL_COUNTRIES_CODE = getCountries();

export const getCountryCodesForCallingCode = (callingCode: string) => {
  const cleanCallingCode = callingCode.startsWith('+')
    ? callingCode.slice(1)
    : callingCode;

  return ALL_COUNTRIES_CODE.filter((country) => {
    const countryCallingCode = getCountryCallingCode(country);

    return countryCallingCode === cleanCallingCode;
  });
};
