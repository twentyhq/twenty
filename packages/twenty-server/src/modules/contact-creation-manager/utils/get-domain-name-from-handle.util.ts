import psl from 'psl';

import { isParsedDomain } from 'src/modules/contact-creation-manager/types/is-psl-parsed-domain.type';

export const getDomainNameFromHandle = (handle: string): string => {
  const wholeDomain = handle?.split('@')?.[1] || '';

  const result = psl.parse(wholeDomain);

  if (!isParsedDomain(result)) {
    return '';
  }

  return result.domain ?? '';
};
