import { isNonEmptyString } from '@sniptt/guards';
import { type PhonesMetadata } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const getPhoneHandlesFromPhones = ({
  phones,
}: {
  phones: PhonesMetadata | null | undefined;
}): string[] => {
  if (!isDefined(phones) || !isNonEmptyString(phones.primaryPhoneNumber)) {
    return [];
  }

  const phoneNumber = phones.primaryPhoneNumber;
  const callingCodeDigits = (phones.primaryPhoneCallingCode ?? '').replace(
    /\+/g,
    '',
  );

  if (!isNonEmptyString(callingCodeDigits)) {
    return [phoneNumber];
  }

  return [
    ...new Set([
      `${callingCodeDigits}${phoneNumber}`,
      `+${callingCodeDigits}${phoneNumber}`,
      phoneNumber,
    ]),
  ];
};
