import { type ParsedName } from 'src/modules/contact-creation-manager/types/parsed-name.type';
import { getParsedNameFromEmailLocalPart } from 'src/modules/contact-creation-manager/utils/get-parsed-name-from-email-local-part.util';

export const getParsedNameFromHandle = (handle: string): ParsedName => {
  const [localPart = ''] = handle.split('@');

  return getParsedNameFromEmailLocalPart(localPart);
};
