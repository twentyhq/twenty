import { isNonEmptyString } from '@sniptt/guards';

import { type ParsedName } from 'src/modules/contact-creation-manager/types/parsed-name.type';

export const getParsedNameFromEmailLocalPart = (
  localPart: string,
): ParsedName => {
  const [withoutPlusAddressTag = ''] = localPart.split('+');
  const parts = withoutPlusAddressTag.split('.').filter(isNonEmptyString);

  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
  };
};
