import psl from 'psl';
import { getDomainFromEmail } from 'twenty-shared/utils';

import { isParsedDomain } from 'src/modules/contact-creation-manager/types/is-psl-parsed-domain.type';

export const getDomainNameFromHandle = (handle: string): string => {
  const wholeDomain = getDomainFromEmail(handle) ?? '';

  const result = psl.parse(wholeDomain);

  if (!isParsedDomain(result)) {
    return '';
  }

  return result.domain ?? '';
};
