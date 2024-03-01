import { parseDomain, fromUrl, ParseResultType } from 'parse-domain';

import { capitalize } from 'src/utils/capitalize';

export const getCompanyNameFromDomainName = (domainName: string) => {
  const parseResult = parseDomain(fromUrl(domainName));

  if (parseResult.type === ParseResultType.Listed) {
    const { domain } = parseResult;

    return domain ? capitalize(domain) : '';
  }

  return '';
};
