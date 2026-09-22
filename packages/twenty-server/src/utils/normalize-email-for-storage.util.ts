import { domainToUnicode } from 'node:url';

import { getEmailIdentityKey } from 'twenty-shared/utils';

export const normalizeEmailForStorage = (email: string): string => {
  const canonicalEmail = getEmailIdentityKey(email);
  const atIndex = canonicalEmail.lastIndexOf('@');

  if (atIndex === -1) {
    return canonicalEmail;
  }

  const asciiDomain = canonicalEmail.slice(atIndex + 1);
  // EMAILS values are displayed directly, so keep the readable IDN spelling.
  const unicodeDomain = domainToUnicode(asciiDomain);

  return `${canonicalEmail.slice(0, atIndex)}@${unicodeDomain || asciiDomain}`;
};
