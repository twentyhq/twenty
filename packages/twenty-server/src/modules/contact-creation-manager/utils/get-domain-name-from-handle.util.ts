import psl from 'psl';

import { isParsedDomain } from 'src/modules/contact-creation-manager/types/is-psl-parsed-domain.type';
import { getDomainFromEmail } from 'src/utils/get-domain-from-email';

export const getDomainNameFromHandle = (handle: string): string => {
  const wholeDomain = getDomainFromEmail(handle) ?? '';

  const result = psl.parse(wholeDomain);

  if (!isParsedDomain(result)) {
    return '';
  }

  return result.domain ?? '';
};
