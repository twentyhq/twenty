import { type LinksMetadata } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { extractDomainFromLink } from 'src/modules/contact-creation-manager/utils/extract-domain-from-link.util';

// Returns the deduplicated, normalised domain keys for every URL stored on a
// LINKS field (primary + secondaries). Empty/null entries are skipped.
export const getAllCompanyDomains = (
  domainName: Partial<LinksMetadata> | null | undefined,
): string[] => {
  if (!isDefined(domainName)) {
    return [];
  }

  const urls: string[] = [];

  if (isDefined(domainName.primaryLinkUrl) && domainName.primaryLinkUrl !== '') {
    urls.push(domainName.primaryLinkUrl);
  }

  if (isDefined(domainName.secondaryLinks)) {
    for (const link of domainName.secondaryLinks) {
      if (isDefined(link?.url) && link.url !== '') {
        urls.push(link.url);
      }
    }
  }

  const seen = new Set<string>();
  const keys: string[] = [];

  for (const url of urls) {
    const key = extractDomainFromLink(url);

    if (key === '' || seen.has(key)) {
      continue;
    }
    seen.add(key);
    keys.push(key);
  }

  return keys;
};
