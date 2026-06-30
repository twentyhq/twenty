import {
  type CountryCode,
  getCountries,
  getCountryCallingCode,
} from 'libphonenumber-js';

// Precompute a map from calling code to country codes for O(1) lookups
const CALLING_CODE_TO_COUNTRIES = new Map<string, CountryCode[]>();

for (const country of getCountries()) {
  const callingCode = getCountryCallingCode(country);

  const existing = CALLING_CODE_TO_COUNTRIES.get(callingCode);

  if (existing) {
    existing.push(country);
  } else {
    CALLING_CODE_TO_COUNTRIES.set(callingCode, [country]);
  }
}

export const getCountryCodesForCallingCode = (
  callingCode: string,
): CountryCode[] => {
  const cleanCallingCode = callingCode.startsWith('+')
    ? callingCode.slice(1)
    : callingCode;

  return CALLING_CODE_TO_COUNTRIES.get(cleanCallingCode) ?? [];
};
