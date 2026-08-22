import { isNonEmptyString } from '@sniptt/guards';
import { type LinkMetadata, type LinksMetadata } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { parseArrayOrJsonStringToArray } from 'src/engine/api/graphql/graphql-query-runner/utils/parse-additional-items.util';
import { extractDomainFromLink } from 'src/modules/contact-creation-manager/utils/extract-domain-from-link.util';

export const getDomainNamesFromCompany = (
  domainName: LinksMetadata | null | undefined,
): string[] => {
  if (!isDefined(domainName)) {
    return [];
  }

  const linkUrls = [
    domainName.primaryLinkUrl,
    ...parseArrayOrJsonStringToArray<LinkMetadata>(
      domainName.secondaryLinks,
    ).map((link) => link.url),
  ];

  const domainNames = [];

  for (const linkUrl of linkUrls) {
    if (!isNonEmptyString(linkUrl)) {
      continue;
    }

    const extractedDomainName = extractDomainFromLink(linkUrl).toLowerCase();

    if (isNonEmptyString(extractedDomainName)) {
      domainNames.push(extractedDomainName);
    }
  }

  return domainNames;
};
