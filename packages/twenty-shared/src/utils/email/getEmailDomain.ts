import { isNonEmptyString } from '@sniptt/guards';

import { isDefined } from '@/utils/validation/isDefined';

export const getEmailDomain = (
  emailAddress: string | null | undefined,
): string | null => {
  if (!isDefined(emailAddress) || !emailAddress.includes('@')) {
    return null;
  }

  const domain = emailAddress
    .slice(emailAddress.lastIndexOf('@') + 1)
    .toLowerCase();

  return isNonEmptyString(domain) ? domain : null;
};
