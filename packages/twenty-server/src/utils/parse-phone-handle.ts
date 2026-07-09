import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { type PhonesMetadata } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const PHONE_HANDLE_SEPARATORS_REGEX = /[\s\-().]/g;
const PHONE_HANDLE_REGEX = /^\+?\d{6,15}$/;

export const parsePhoneHandle = (handle: string): PhonesMetadata | null => {
  const normalizedHandle = handle.replace(PHONE_HANDLE_SEPARATORS_REGEX, '');

  if (!PHONE_HANDLE_REGEX.test(normalizedHandle)) {
    return null;
  }

  const internationalHandle = normalizedHandle.startsWith('+')
    ? normalizedHandle
    : `+${normalizedHandle}`;

  const parsedPhoneNumber = parsePhoneNumberFromString(internationalHandle);

  if (!isDefined(parsedPhoneNumber) || !parsedPhoneNumber.isPossible()) {
    return null;
  }

  const countryCode =
    parsedPhoneNumber.country ?? parsedPhoneNumber.getPossibleCountries()[0];

  if (!isDefined(countryCode)) {
    return null;
  }

  return {
    primaryPhoneNumber: parsedPhoneNumber.nationalNumber,
    primaryPhoneCallingCode: `+${parsedPhoneNumber.countryCallingCode}`,
    primaryPhoneCountryCode: countryCode,
    additionalPhones: null,
  };
};
