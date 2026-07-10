import { isNonEmptyString } from '@sniptt/guards';
import addressparser from 'addressparser';

import { type EmailAddressWithDisplayName } from '@/types';

export const parseEmailAddressList = (
  rawText: string,
): EmailAddressWithDisplayName[] => {
  const normalizedText = rawText.replace(/\r?\n/g, ',');

  try {
    return addressparser(normalizedText)
      .flatMap((parsedAddress) => parsedAddress.group ?? [parsedAddress])
      .filter((parsedAddress) => isNonEmptyString(parsedAddress.address))
      .map((parsedAddress) => ({
        address: parsedAddress.address,
        displayName: isNonEmptyString(parsedAddress.name)
          ? parsedAddress.name
          : undefined,
      }));
  } catch {
    return [];
  }
};
