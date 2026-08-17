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

  const domainNames = isNonEmptyString(domainName.primaryLinkUrl)
    ? [extractDomainFromLink(domainName.primaryLinkUrl).toLowerCase()]
    : [];

  for (const link of parseArrayOrJsonStringToArray<LinkMetadata>(
    domainName.secondaryLinks,
  )) {
    if (isNonEmptyString(link.url)) {
      domainNames.push(extractDomainFromLink(link.url).toLowerCase());
    }
  }

  return domainNames;
};
