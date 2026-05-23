import { type ParsedName } from 'src/modules/contact-creation-manager/types/parsed-name.type';

export const getParsedNameFromEmailLocalPart = (
  localPart: string,
): ParsedName => {
  const parts = localPart.split('.').filter((part) => part !== '');

  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
  };
};
