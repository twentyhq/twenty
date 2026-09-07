import { isNonEmptyString } from '@sniptt/guards';
import { type LinkMetadata, type LinksMetadata } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { parseArrayOrJsonStringToArray } from 'src/engine/api/graphql/graphql-query-runner/utils/parse-additional-items.util';

export const getDomainNamesFromLinks = (
  domainName: LinksMetadata | null | undefined,
): string[] => {
  if (!isDefined(domainName)) {
    return [];
  }

  return [
    domainName.primaryLinkUrl,
    ...parseArrayOrJsonStringToArray<LinkMetadata>(
      domainName.secondaryLinks,
    ).map((link) => link.url),
  ].filter(isNonEmptyString);
};
